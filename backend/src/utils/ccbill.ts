import { 
  createSubscriptionCheckoutSession, 
  createPPVCheckoutSession, 
  isStripeConfigured 
} from './stripe.js';

// Create checkout session for subscription (Stripe) or mock payment
export async function createSubscriptionCheckout(
  fanId: string, 
  creatorId: string, 
  amount: number, 
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  const stripeConfigured = isStripeConfigured();
  console.log(`[Subscription] Stripe configured: ${stripeConfigured}, Key: ${process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET'}`);
  
  if (stripeConfigured) {
    console.log(`[Stripe] Creating subscription checkout: fan ${fanId} -> creator ${creatorId}, amount: $${amount}`);
    try {
      const result = await createSubscriptionCheckoutSession(fanId, creatorId, amount, customerEmail, successUrl, cancelUrl);
      console.log(`[Stripe] Checkout session created:`, { sessionId: result.sessionId, hasUrl: !!result.url });
      return result;
    } catch (error: any) {
      console.error(`[Stripe] Error creating checkout session:`, error);
      throw error;
    }
  }
  
  // Fallback to mock - return mock success immediately
  console.log(`[CCBill Mock] Processing subscription: fan ${fanId} -> creator ${creatorId}, amount: $${amount}`);
  
  const transactionId = `ccbill_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    transactionId,
    status: 'completed',
    amount,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    url: null, // No redirect needed for mock
    sessionId: null,
  };
}

// Create checkout session for PPV unlock (Stripe) or mock payment
export async function createPPVCheckout(
  fanId: string, 
  postId: string, 
  amount: number, 
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  const stripeConfigured = isStripeConfigured();
  console.log(`[Payment] Stripe configured: ${stripeConfigured}, Key: ${process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET'}`);
  
  if (stripeConfigured) {
    console.log(`[Stripe] Creating PPV checkout: fan ${fanId} -> post ${postId}, amount: $${amount}`);
    return await createPPVCheckoutSession(fanId, postId, amount, customerEmail, successUrl, cancelUrl);
  }
  
  // Fallback to mock - return mock success immediately
  console.log(`[CCBill Mock] Processing PPV unlock: fan ${fanId} -> post ${postId}, amount: $${amount}`);
  
  const transactionId = `ccbill_ppv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    transactionId,
    status: 'completed',
    amount,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    url: null, // No redirect needed for mock
  };
}

