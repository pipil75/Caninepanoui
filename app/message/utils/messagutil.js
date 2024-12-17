"use client"; // Important ici

import { ref, push, update } from "firebase/database";
import { auth, database } from "../../lib/firebase";

export const sendMessageToBothSides = async ({
  message,
  recipientId,
  recipientRole,
}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Utilisateur non authentifié.");
    }

    if (!message.trim()) {
      throw new Error("Le message ne peut pas être vide.");
    }

    const messageData = {
      message: message.trim(),
      senderId: currentUser.uid,
      senderName: currentUser.displayName || "Utilisateur",
      senderEmail: currentUser.email,
      recipientId,
      recipientRole,
      timestamp: new Date().toISOString(),
    };

    const senderRole = currentUser.uid === recipientId ? "pro" : "user";
    const senderRef = ref(
      database,
      `users/${senderRole}/${currentUser.uid}/messages`
    );
    const recipientRef = ref(
      database,
      `users/${recipientRole}/${recipientId}/messages`
    );

    const messageKey = push(senderRef).key;

    const updates = {};
    updates[`users/${recipientRole}/${recipientId}/messages/${messageKey}`] =
      messageData;
    updates[`users/${senderRole}/${currentUser.uid}/messages/${messageKey}`] =
      messageData;

    await update(ref(database), updates);

    return "Message envoyé avec succès.";
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error.message);
    throw new Error(error.message);
  }
};
