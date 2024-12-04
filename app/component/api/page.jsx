import { useEffect } from "react";

const PayPalButton = () => {
  useEffect(() => {
    // Charger le SDK PayPal de manière dynamique pour inclure la devise en EUR
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=VOTRE_CLIENT_ID&currency=EUR`;
    script.async = true;
    script.onload = () => {
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "10.00", // montant de l'article en euros
                  },
                },
              ],
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
              alert(
                "Transaction completed by " + details.payer.name.given_name
              );
            });
          },
        })
        .render("#paypal-button-container");
    };
    document.body.appendChild(script);

    return () => {
      // Supprime le script lorsque le composant est démonté
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <div id="paypal-button-container"></div>
    </div>
  );
};

export default PayPalButton;
