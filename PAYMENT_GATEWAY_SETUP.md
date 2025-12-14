# Payment Gateway Setup Guide - Lumière

This guide explains how to set up payment methods for your Lumière e-commerce store.

---

## Current Payment Methods

Your store supports three payment options:

| Method | Status | Description |
|--------|--------|-------------|
| Cash on Delivery (COD) | Active | Customer pays when order arrives |
| WhatsApp Payment | Active | Order details sent via WhatsApp for payment link |
| Credit Card (MyFatoorah) | Coming Soon | Online card payments via MyFatoorah |

---

## 1. MyFatoorah Credit Card Setup

### Step 1: Create a MyFatoorah Account

1. Go to [MyFatoorah](https://www.myfatoorah.com/)
2. Sign up for a merchant account
3. Complete the verification process (business documents required)
4. Once approved, access your merchant dashboard

### Step 2: Get Your API Keys

1. Log in to your MyFatoorah merchant dashboard
2. Navigate to **Settings** > **API Settings** or **Integration**
3. Find your credentials:
   - **API Key** (also called Token or Bearer Token)
   - **Secret Key** (if required for webhooks/callbacks)

> **Important:** Keep these keys confidential. Never share them publicly.

### Step 3: Add Keys to Replit Secrets

1. In your Replit project, click the **Secrets** tab (lock icon in the sidebar)
2. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `MYFATOORAH_API_KEY` | Your MyFatoorah API Key/Token |
| `MYFATOORAH_SECRET_KEY` | Your MyFatoorah Secret Key |

3. Click **Add Secret** for each one
4. Restart the application for changes to take effect

### Step 4: Configure Callback URLs (in MyFatoorah Dashboard)

Set these URLs in your MyFatoorah dashboard:

| Setting | URL |
|---------|-----|
| Success URL | `https://your-domain.replit.app/checkout/success` |
| Error URL | `https://your-domain.replit.app/checkout/error` |
| Webhook URL | `https://your-domain.replit.app/api/payments/webhook` |

Replace `your-domain` with your actual Replit app domain.

---

## 2. Cash on Delivery (COD)

This payment method is enabled by default and requires no setup.

**How it works:**
1. Customer places an order and selects "Cash on Delivery"
2. Order is created with `paymentStatus: 'unpaid'`
3. Customer pays when the order is delivered
4. Admin marks payment as received in the dashboard

---

## 3. WhatsApp Payment

This payment method is enabled by default.

**How it works:**
1. Customer places an order and selects "Pay via WhatsApp"
2. WhatsApp opens with a pre-formatted message containing:
   - Order number
   - Order items and quantities
   - Shipping address
   - Total amount
3. Store owner receives the message and sends a payment link
4. Customer completes payment via the link
5. Admin updates order status in dashboard

**To customize the WhatsApp number:**
- Update the WhatsApp number in your store settings

---

## Environment Variables Reference

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `MYFATOORAH_API_KEY` | Secret | Yes (for card payments) | MyFatoorah API authentication token |
| `MYFATOORAH_SECRET_KEY` | Secret | Yes (for webhooks) | MyFatoorah webhook signature verification |
| `MONGODB_URI` | Secret | Yes | MongoDB database connection string |
| `SESSION_SECRET` | Secret | Yes | Session cookie encryption key |

---

## Testing Payments

### Test Mode (Sandbox)

MyFatoorah provides a sandbox environment for testing:

1. Use sandbox API keys from MyFatoorah test dashboard
2. Test card numbers:
   - **Success:** 5123450000000008
   - **Failure:** 5123450000000016
3. Use any future expiry date and any 3-digit CVV

### Going Live

1. Replace sandbox keys with production keys
2. Update callback URLs to production domain
3. Test with a real transaction (small amount)
4. Monitor the MyFatoorah dashboard for transactions

---

## Troubleshooting

### "Coming Soon" Badge on Credit Card Option
- The credit card integration is being finalized
- Ensure your API keys are correctly added to Replit Secrets
- Contact support if the issue persists after keys are added

### Payment Not Processing
1. Check that API keys are correct in Secrets
2. Verify your MyFatoorah account is active and approved
3. Check the application logs for error messages
4. Ensure callback URLs are correctly configured

### Order Created But Payment Failed
1. Check order status in Admin Dashboard > Orders
2. Review payment status (paid/unpaid)
3. Contact MyFatoorah support with transaction ID

---

## Security Best Practices

1. **Never expose API keys** in client-side code or public repositories
2. **Use Replit Secrets** for all sensitive credentials
3. **Enable webhook verification** to validate payment callbacks
4. **Monitor transactions** regularly in your MyFatoorah dashboard
5. **Use HTTPS** for all payment-related URLs (Replit provides this automatically)

---

## Support

- **MyFatoorah Support:** support@myfatoorah.com
- **MyFatoorah Documentation:** https://docs.myfatoorah.com/
- **Replit Secrets Guide:** Available in Replit documentation

---

*Last updated: December 2025*
