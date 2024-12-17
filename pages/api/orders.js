import paypal from "@paypal/checkout-server-sdk";

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { amount, currency, payeeEmail } = req.body;

      if (!amount || !currency || !payeeEmail) {
        return res.status(400).json({
          error: "Amount, currency, and payeeEmail are required.",
        });
      }

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount,
            },
            payee: {
              email_address: payeeEmail,
            },
            description: "Payment for professional service",
          },
        ],
      });

      const response = await client.execute(request);

      console.log("Réponse de PayPal :", response.result);

      res.status(201).json({ id: response.result.id });
    } catch (error) {
      console.error(
        "Erreur lors de la création de la commande PayPal :",
        error
      );

      if (error.response) {
        console.error("Détails de l'erreur PayPal :", error.response);
        return res.status(500).json({
          error: "Erreur lors de la création de la commande PayPal",
          details: error.response,
        });
      }

      res.status(500).json({
        error: "Une erreur est survenue lors du traitement de votre demande.",
      });
    }
  } else {
    console.error("Méthode non autorisée :", req.method);
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Méthode ${req.method} non autorisée.`);
  }
}
