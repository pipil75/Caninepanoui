import { NextResponse } from "next/server";
import paypalClient from "../../../lib/paypal";

export async function POST(request) {
  if (req.method === "POST") {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");

    // Définir les détails de la commande
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "10.00",
          },
        },
      ],
    });

    try {
      const order = await paypalClient.execute(request);
      res.status(200).json({ id: order.result.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
