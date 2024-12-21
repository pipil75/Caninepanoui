"use client";

import { ref, push, update } from "firebase/database";
import { auth, database } from "../../../lib/firebase";

export const sendMessageToBothSides = async ({
  message,
  recipientId,
  recipientRole,
  isReply = false,
  originalMessageId = null,
}) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Utilisateur non authentifié.");
    }

    if (!message.trim()) {
      throw new Error("Le message ne peut pas être vide.");
    }

    // Rôle de l'expéditeur
    const senderRole = recipientRole === "pro" ? "user" : "pro";

    // Données du message ou de la réponse
    const messageData = {
      message: message.trim(),
      senderId: currentUser.uid,
      senderRole,
      senderEmail: currentUser.email,
      recipientId,
      recipientRole,
      timestamp: new Date().toISOString(),
    };

    const updates = {};

    if (isReply && originalMessageId) {
      // Ajouter une réponse sous le message parent
      const senderReplyPath = `users/${senderRole}/${currentUser.uid}/messages/${originalMessageId}/replies`;
      const recipientReplyPath = `users/${recipientRole}/${recipientId}/messages/${originalMessageId}/replies`;

      const newReplyKey = push(ref(database, senderReplyPath)).key;

      updates[`${senderReplyPath}/${newReplyKey}`] = messageData;
      updates[`${recipientReplyPath}/${newReplyKey}`] = messageData;

      console.log(
        "Chemins des réponses :",
        senderReplyPath,
        recipientReplyPath
      );
    } else {
      // Nouveau message
      const senderPath = `users/${senderRole}/${currentUser.uid}/messages`;
      const recipientPath = `users/${recipientRole}/${recipientId}/messages`;

      const newMessageKey = push(ref(database, senderPath)).key;

      updates[`${senderPath}/${newMessageKey}`] = messageData;
      updates[`${recipientPath}/${newMessageKey}`] = messageData;

      console.log("Chemins des messages :", senderPath, recipientPath);
    }

    // Mise à jour dans Firebase
    await update(ref(database), updates);
    console.log("Message envoyé :", messageData);
    return "Message envoyé avec succès.";
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error.message);
    throw new Error(error.message);
  }
};
