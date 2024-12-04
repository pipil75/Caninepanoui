// app/api/paypal/capture-order.js
import { NextResponse } from "next/server";
import paypalClient from "../../../lib/paypal";

export async function POST(request) {
  try {
    const { orderID } = await request.json();

    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    const response = await paypalClient.execute(captureRequest);

    return NextResponse.json({ status: "COMPLETED", details: response.result });
  } catch (error) {
    console.error("Erreur lors de la capture de la commande PayPal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
