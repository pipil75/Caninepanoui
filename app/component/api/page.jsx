import { useEffect, useState } from "react";
import { Database, getDatabase, ref, set } from "firebase/database";
import paypal from "@paypal/checkout-server-sdk"; // Assurez-vous que cette librairie est installée
import { database } from "@/lib/firebase";
// Configuration PayPal
const environment = new paypal.core.SandboxEnvironment(
  "AR9HVby23C6W5RAovkPVYdqgeVJ2fvsykycPJeuPELPCRGonsCahva320cbFmeOb53FQ6eSuNIGqLkqt",
  "EL1vX2Bs0DYHPB0rN6wMXf7nMgynYkWhIvNPT7tgC9CQOIorNGr8vJUiPswRnebvCfs3c9mMGzuJBwEe"
);
const client = new paypal.core.PayPalHttpClient(environment);

const PayPalButton = ({ userId, role }) => {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // Chargement dynamique du SDK PayPal
    const scriptExists = document.querySelector(
      `script[src="https://www.paypal.com/sdk/js?client-id=AR9HVby23C6W5RAovkPVYdqgeVJ2fvsykycPJeuPELPCRGonsCahva320cbFmeOb53FQ6eSuNIGqLkqt&currency=USD"]`
    );

    if (!scriptExists) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=AR9HVby23C6W5RAovkPVYdqgeVJ2fvsykycPJeuPELPCRGonsCahva320cbFmeOb53FQ6eSuNIGqLkqt&currency=USD`;
      script.async = true;
      script.onload = () => setSdkReady(true);
      document.body.appendChild(script);
    } else {
      setSdkReady(true);
    }
  }, []);

  const saveToDatabase = (transactionDetails) => {
    const userRef = ref(database, `users/${userId}`);

    const data = {
      email: transactionDetails.payer.email_address,
      name: transactionDetails.payer.name.given_name,
      role: role,
      transactionId: transactionDetails.id,
      amount: transactionDetails.purchase_units[0].amount.value,
      currency: transactionDetails.purchase_units[0].amount.currency_code,
    };

    set(userRef, data)
      .then(() => {
        console.log("Transaction enregistrée avec succès dans Firebase !");
      })
      .catch((error) => {
        console.error("Erreur lors de l'enregistrement :", error);
      });
  };

  const distributePayments = async (transactionDetails) => {
    const amount = parseFloat(
      transactionDetails.purchase_units[0].amount.value
    );
    const sellerPayPalId = "seller@exemple.com"; // À rendre dynamique si nécessaire
    const sitePayPalId = "site@exemple.com";

    const payouts = [
      {
        receiver: sellerPayPalId,
        amount: (amount * 0.95).toFixed(2), // 95% pour le vendeur
      },
      {
        receiver: sitePayPalId,
        amount: (amount * 0.05).toFixed(2), // 5% pour le site
      },
    ];

    for (const payout of payouts) {
      const request = new paypal.payouts.PayoutsPostRequest();
      request.requestBody({
        sender_batch_header: {
          sender_batch_id: Math.random().toString(36).substring(9),
          email_subject: "Paiement reçu",
        },
        items: [
          {
            recipient_type: "EMAIL",
            amount: {
              value: payout.amount,
              currency: "USD",
            },
            receiver: payout.receiver,
            note: "Paiement de votre part",
            sender_item_id: "item_" + Math.random().toString(36).substring(9),
          },
        ],
      });

      try {
        const response = await client.execute(request);
        console.log("Payout response:", response);
      } catch (error) {
        console.error("Error in payout:", error);
      }
    }
  };

  useEffect(() => {
    if (sdkReady) {
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "10.00", // Montant dynamique
                    currency: "USD",
                  },
                },
              ],
            });
          },
          onApprove: (data, actions) => {
            return actions.order
              .capture()
              .then((details) => {
                console.log("Paiement approuvé :", details);
                saveToDatabase(details); // Enregistrement dans Firebase
                distributePayments(details); // Distribution des paiements
                alert(
                  `Merci pour votre paiement, ${details.payer.name.given_name}`
                );
              })
              .catch((err) => {
                console.error("Erreur lors de l'approbation :", err);
              });
          },
          onError: (err) => {
            console.error("Erreur lors de la transaction PayPal :", err);
          },
        })
        .render("#paypal-button-container");
    }
  }, [sdkReady]);

  return (
    <div>
      {sdkReady ? (
        <div id="paypal-button-container"></div>
      ) : (
        <p>Chargement du bouton PayPal...</p>
      )}
    </div>
  );
};

export default PayPalButton;
