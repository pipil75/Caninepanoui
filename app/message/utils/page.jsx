import { ref, push, set } from "firebase/database";
import { auth, database } from "../../../lib/firebase";

export const sendMessageToBothSides = async ({
  message,
  recipientId,
  recipientRole,
}) => {
  try {
    // Vérifiez si l'utilisateur est authentifié
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Utilisateur non authentifié.");
    }

    if (!message.trim()) {
      throw new Error("Le message ne peut pas être vide.");
    }

    // Données du message
    const messageData = {
      message: message.trim(),
      senderId: currentUser.uid,
      senderName: currentUser.displayName || "Utilisateur",
      senderEmail: currentUser.email,
      recipientId,
      recipientRole,
      timestamp: new Date().toISOString(),
    };

    console.log("Données du message :", messageData);

    // Références Firebase
    const senderRole = currentUser.uid === recipientId ? "pro" : "user";
    const recipientRef = ref(
      database,
      `users/${recipientRole}/${recipientId}/messages`
    );
    const senderRef = ref(
      database,
      `users/${senderRole}/${currentUser.uid}/messages`
    );

    // Générer un ID de message unique
    const messageKey = push(senderRef).key;

    // Ajouter le message aux deux côtés
    const updates = {};
    updates[`users/${recipientRole}/${recipientId}/messages/${messageKey}`] =
      messageData;
    updates[`users/${senderRole}/${currentUser.uid}/messages/${messageKey}`] =
      messageData;

    await set(ref(database), updates);

    console.log("Message envoyé et enregistré des deux côtés.");
    return "Message envoyé avec succès.";
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error.message);
    throw new Error(error.message);
  }
};
