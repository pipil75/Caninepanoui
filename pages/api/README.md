Cette API fournit des endpoints pour intégrer les fonctionnalités de création et de capture de commandes avec PayPal. Elle utilise le SDK PayPal pour gérer les paiements dans un environnement Sandbox ou Production.

Prérequis
Un compte PayPal Developer.
Les clés d'API (Client ID et Client Secret) générées sur le tableau de bord PayPal Developer.
Node.js version 14 ou supérieure.

## Installation

Clonez le projet et installez les dépendances :
git clone https://github.com/votre-utilisateur/votre-projet.git
cd votre-projet
npm install

## Créez un fichier .env.local dans le projet et ajoutez vos informations PayPal :

PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com

## Création d'une commande

Méthode : POST
URL : /api/orders
Description : Crée une commande PayPal avec le montant, la devise et l'adresse e-mail du bénéficiaire en dynamique.

            amount: {
              currency_code: currency,
              value: amount,
            },
            payee: {
              email_address: payeeEmail,
            },

Réponse réussie :
{
"id": "ORDER_ID"
}

## Capture d'une commande

Méthode : POST
URL : /api/capture?orderId=ORDER_ID
Réponse réussie :
Si la capture est réussie, l'API retourne le résultat brut de PayPal dans ce format :

json

{
"status": "success",
"data": { ...response.result }
}
