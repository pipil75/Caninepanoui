import { NextResponse } from "next/server";
import paypalClient from "../../../lib/paypal";
import paypal from "@paypal/checkout-server-sdk";

export async function POST(request) {
  try {
    // Récupérer les données nécessaires depuis la requête
    const { amount, proEmail, proId, userId } = await request.json();

    if (!amount || !proEmail || !proId || !userId) {
      return NextResponse.json(
        { error: "Tous les champs (montant, email du pro, etc.) sont requis." },
        { status: 400 }
      );
    }

    // Créer une commande avec PayPal
    const createOrderRequest = new paypal.orders.OrdersCreateRequest();
    createOrderRequest.prefer("return=representation");

    createOrderRequest.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount, // Montant total payé par l'utilisateur
          },
          payee: {
            email_address: proEmail, // Email PayPal du professionnel
          },
          description: "Paiement au professionnel via votre plateforme",
          custom_id: JSON.stringify({ proId, userId }), // Stocker des métadonnées
        },
      ],
      application_context: {
        brand_name: "VotrePlateforme",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      },
    });

    const order = await paypalClient.execute(createOrderRequest);

    // Retourner l'ID de la commande pour que le front-end puisse l'utiliser
    return NextResponse.json({ id: order.result.id });
  } catch (error) {
    console.error("Erreur lors de la création de la commande PayPal :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
