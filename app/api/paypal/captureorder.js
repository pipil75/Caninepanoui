import { NextResponse } from "next/server";
import paypalClient from "../../../lib/paypal";
import paypal from "@paypal/checkout-server-sdk";
import { ref, set } from "firebase/database";
import { database } from "../../../lib/firebase";

export async function POST(request) {
  try {
    const { orderID } = await request.json();

    if (!orderID) {
      console.error("Order ID manquant dans la requête.");
      return NextResponse.json({ error: "Order ID requis." }, { status: 400 });
    }

    // Étape 1 : Capturer le paiement
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);

    let response;
    try {
      response = await paypalClient.execute(captureRequest);
    } catch (paypalError) {
      console.error("Erreur lors de la capture PayPal :", paypalError);
      return NextResponse.json({ error: "Erreur PayPal." }, { status: 500 });
    }

    if (response.result.status !== "COMPLETED") {
      console.warn(
        "Le paiement n'a pas été complété :",
        response.result.status
      );
      return NextResponse.json(
        { error: "Le paiement n'a pas été complété." },
        { status: 400 }
      );
    }

    // Étape 2 : Extraire les détails du paiement
    const paymentDetails = response.result.purchase_units[0];
    const { custom_id } = paymentDetails;

    if (!custom_id) {
      console.error("custom_id manquant dans les détails de la commande.");
      return NextResponse.json(
        { error: "Les données custom_id sont manquantes." },
        { status: 400 }
      );
    }

    let proId, userId;
    try {
      ({ proId, userId } = JSON.parse(custom_id));
    } catch (parseError) {
      console.error("Erreur de parsing du custom_id :", parseError);
      return NextResponse.json(
        { error: "Erreur dans les données custom_id." },
        { status: 400 }
      );
    }

    if (!proId || !userId) {
      console.error("proId ou userId manquant dans custom_id.");
      return NextResponse.json(
        { error: "proId et userId sont requis." },
        { status: 400 }
      );
    }

    const amount = paymentDetails.amount.value;
    const currency = paymentDetails.amount.currency_code;
    const proEmail = paymentDetails.payee?.email_address || "Non spécifié";

    // Préparer les données du paiement
    const timestamp = new Date().toISOString();
    const paymentData = {
      orderID,
      proId,
      userId,
      amount,
      currency,
      proEmail,
      captureStatus: response.result.status,
      timestamp,
    };

    // Étape 3 : Enregistrer les paiements dans Firebase
    try {
      // Enregistrer le paiement sous l'utilisateur
      const userPaymentRef = ref(
        database,
        `users/${userId}/payments/${orderID}`
      );
      await set(userPaymentRef, paymentData);
      console.log(`Paiement enregistré pour l'utilisateur ${userId}`);

      // Enregistrer le paiement sous le professionnel
      const proPaymentRef = ref(database, `users/${proId}/payments/${orderID}`);
      await set(proPaymentRef, paymentData);
      console.log(`Paiement enregistré pour le professionnel ${proId}`);
    } catch (firebaseError) {
      console.error(
        "Erreur lors de l'enregistrement dans Firebase :",
        firebaseError
      );
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement dans Firebase." },
        { status: 500 }
      );
    }

    // Étape 4 : Retourner une réponse de succès
    return NextResponse.json({
      status: "COMPLETED",
      details: response.result,
    });
  } catch (error) {
    console.error("Erreur générale lors de la capture du paiement :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
