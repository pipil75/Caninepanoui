// lib/paypal.js
import paypal from "@paypal/checkout-server-sdk";

const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

export default paypalClient;
