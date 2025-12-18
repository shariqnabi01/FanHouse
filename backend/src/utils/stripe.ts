// @ts-ignore
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe | null {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      stripeClient = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
      console.log('[Stripe] Initialized with', secretKey.startsWith('sk_test') ? 'TEST mode' : 'LIVE mode');
    }
  }
  return stripeClient;
}

// Legacy function for backward compatibility (simulated)
export async function processSubscriptionStripe(
  fanId: string,
  creatorId: string,
  amount: number,
  customerEmail?: string
) {
  // This is kept for backward compatibility but shouldn't be used
  // Use createSubscriptionCheckoutSession instead
  throw new Error('Use createSubscriptionCheckoutSession for real payments');
}

export async function createPPVCheckoutSession(
  fanId: string,
  postId: string,
  amount: number,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  const stripe = getStripeClient();
  
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    // Create or retrieve customer
    let customer;
    if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            fanId,
            postId,
          },
        });
      }
    } else {
      customer = await stripe.customers.create({
        metadata: {
          fanId,
          postId,
        },
      });
    }

    // Create Checkout Session - this will redirect user to Stripe payment page
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PPV Content Unlock',
              description: `Unlock PPV content for post ${postId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        fanId,
        postId,
        type: 'ppv_unlock',
      },
    });

    return {
      sessionId: session.id,
      url: session.url, // This is the Stripe Checkout URL
      customerId: customer.id,
    };
  } catch (error: any) {
    console.error('[Stripe] Checkout session error:', error);
    throw new Error(`Stripe checkout failed: ${error.message}`);
  }
}

export async function createSubscriptionCheckoutSession(
  fanId: string,
  creatorId: string,
  amount: number,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  const stripe = getStripeClient();
  
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    // Create or retrieve customer
    let customer;
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else if (customerEmail) {
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          fanId,
          creatorId,
        },
      });
    } else {
      customer = await stripe.customers.create({
        metadata: {
          fanId,
          creatorId,
        },
      });
    }

    // Create Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Creator Subscription',
              description: `Monthly subscription to creator`,
            },
            unit_amount: Math.round(amount * 100),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        fanId,
        creatorId,
        type: 'subscription',
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
      customerId: customer.id,
    };
  } catch (error: any) {
    console.error('[Stripe] Subscription checkout error:', error);
    throw new Error(`Stripe checkout failed: ${error.message}`);
  }
}

// Legacy function for backward compatibility (simulated)
export async function processPPVUnlockStripe(
  fanId: string,
  postId: string,
  amount: number,
  customerEmail?: string
) {
  // This is kept for backward compatibility but shouldn't be used
  // Use createPPVCheckoutSession instead
  throw new Error('Use createPPVCheckoutSession for real payments');
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

