# Stripe Payment Integration Setup

Stripe has been integrated as an alternative payment method. It will automatically be used if API keys are provided, otherwise the system falls back to mocked payments.

## Getting Stripe Test API Keys (Free)

1. **Create a Stripe Account** (if you don't have one):
   - Go to https://stripe.com
   - Sign up for a free account
   - No credit card required for test mode

2. **Get Your Test API Key**:
   - Log into Stripe Dashboard
   - Go to **Developers** → **API keys**
   - Copy your **Secret key** (starts with `sk_test_...`)
   - The **Publishable key** is not needed for backend-only integration

## Configuration

### Option 1: Environment Variable (Recommended)

Add to your `backend/.env` file or docker-compose environment:

```env
STRIPE_SECRET_KEY=sk_test_your_test_key_here
```

### Option 2: Docker Compose

Add to your `.env` file in the project root:

```env
STRIPE_SECRET_KEY=sk_test_your_test_key_here
```

Then restart the backend:

```bash
docker-compose restart backend
```

## How It Works

- **If Stripe key is provided**: Real Stripe payments are processed (test mode)
- **If no Stripe key**: System falls back to mocked payments (current behavior)

## Testing with Stripe

### Test Card Numbers

Stripe provides test card numbers that always succeed:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any:
- **Expiry**: Future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Current Implementation

The current implementation uses **Stripe Checkout Sessions** which redirect users to Stripe's hosted payment page:

1. User clicks "Subscribe" or "Unlock PPV"
2. Backend creates a Stripe Checkout Session
3. User is redirected to Stripe's payment page
4. User enters payment details on Stripe's secure page
5. After successful payment, user is redirected back to success page
6. Transaction is recorded in the ledger

**If Stripe is not configured**, the system falls back to mocked payments (no redirect, instant success).

## Production Considerations

For production, you'll want to:

1. **Use Stripe Subscriptions API** for recurring payments (monthly subscriptions)
2. **Implement webhooks** to handle payment confirmations asynchronously
3. **Add frontend Stripe.js** integration for secure card collection
4. **Handle payment failures** and retries
5. **Use live API keys** (starts with `sk_live_...`)

## Current Status

✅ Stripe Checkout Sessions integrated
✅ Automatic redirect to Stripe payment page
✅ Automatic fallback to mock if no keys
✅ Test mode support
✅ Success page for payment confirmation
⚠️ Webhooks not implemented (payments confirmed via redirect for now)
⚠️ For production, add webhook endpoint for async payment confirmation

## Testing

1. Add your Stripe test key to environment
2. Restart backend: `docker-compose restart backend`
3. Try subscribing or unlocking PPV
4. Check Stripe Dashboard → Payments to see test transactions
5. Check application logs for `[Stripe]` messages

## Troubleshooting

**"Stripe not configured" error:**
- Make sure `STRIPE_SECRET_KEY` is set in environment
- Restart backend after adding key
- Check logs for Stripe initialization message

**Payment fails:**
- Check Stripe Dashboard for error details
- Verify test card numbers are used correctly
- Check backend logs for error messages

**Still using mock:**
- Verify environment variable is set correctly
- Check that key starts with `sk_test_` or `sk_live_`
- Restart backend container

