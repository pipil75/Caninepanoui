import paypal from "@paypal/checkout-server-sdk";

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

export default async function handler(req, res) {
  console.log(req);
  if (req.method === "POST") {
    const { orderId } = req.query;

    // Vérifiez si orderId est reçu
    console.log("Order ID reçu :", orderId);

    if (!orderId) {
      return res
        .status(400)
        .json({ error: "Order ID manquant dans la requête" });
    }

    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      console.log("Requête PayPal pour capturer l'ordre :", request);

      const response = await client.execute(request);

      console.log("Réponse de PayPal après capture :", response.result);

      res.status(200).json({
        status: "success",
        data: response.result,
      });
    } catch (error) {
      console.error("Erreur lors de la capture de la commande PayPal :", error);

      res.status(500).json({
        status: "error",
        message: "Failed to capture the order.",
        error: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
  }
}
