## pour demarré mon projet en local

git clone https://github.com/pipil75/Caninepanoui
cd monprojet
npm install

# ou

yarn install

# ou

pnpm install

## pour demarre mon serveur en local

pnpm dev

Ce projet utilise Firebase pour l'intégration backend. Assurez-vous de configurer Firebase correctement :

Créez un projet Firebase sur la console Firebase.

Ajoutez une application web dans votre projet Firebase et copiez la configuration Firebase (apiKey, authDomain, etc.).

## Créez un fichier .env.local à la racine du projet et ajoutez les variables d'environnement suivantes :

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

## Installez le SDK Firebase si ce n’est pas déjà fait :

pnpm install firebase

## Configurez Firebase dans lib/firebase.js ou un fichier équivalent :

import { initializeApp } from "firebase/app";

const firebaseConfig = {
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export default app;

## Le déploiement de ce projet sur Vercel est simple :

Connectez votre dépôt GitHub à Vercel.
Créez un nouveau projet sur Vercel et sélectionnez ce dépôt.
Configurez les variables d'environnement Firebase dans l'interface Vercel (section Environment Variables).
Déployez le projet.

## liens utile

https://nextjs.org/docs/pages/building-your-application/deploying

## Fonctionnalités

Next.js : Framework moderne pour React, avec rendu côté serveur (SSR) et génération statique (SSG).
Firebase :
Authentification (email, Google, etc.).
Base de données en temps réel ou Firestore.
Stockage de fichiers.
Déploiement continu avec Vercel.
