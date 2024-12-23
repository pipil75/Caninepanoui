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

    const senderRole = recipientRole === "pro" ? "user" : "pro";

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

    if (isReply) {
      if (!originalMessageId) {
        throw new Error("Un ID de message parent est requis pour une réponse.");
      }

      const senderReplyPath = `users/${senderRole}/${currentUser.uid}/messages/${originalMessageId}/replies`;
      const recipientReplyPath = `users/${recipientRole}/${recipientId}/messages/${originalMessageId}/replies`;

      const newReplyKey = push(ref(database, senderReplyPath)).key;

      updates[`${senderReplyPath}/${newReplyKey}`] = messageData;
      updates[`${recipientReplyPath}/${newReplyKey}`] = messageData;

      console.log("Réponse enregistrée :", {
        senderReplyPath,
        recipientReplyPath,
        newReplyKey,
      });
    } else {
      const senderPath = `users/${senderRole}/${currentUser.uid}/messages`;
      const recipientPath = `users/${recipientRole}/${recipientId}/messages`;

      const newMessageKey = push(ref(database, senderPath)).key;

      updates[`${senderPath}/${newMessageKey}`] = messageData;
      updates[`${recipientPath}/${newMessageKey}`] = messageData;

      console.log("Message enregistré :", { senderPath, recipientPath });
    }

    await update(ref(database), updates);
    console.log("Firebase mise à jour réussie :", updates);
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error.message);
    throw new Error(error.message);
  }
};
