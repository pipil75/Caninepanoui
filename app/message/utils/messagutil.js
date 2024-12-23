"use client";

import { ref, push, update } from "firebase/database";
import { auth, database } from "../../../lib/firebase";

/**
 * Envoie un message ou une réponse, avec gestion des chemins Firebase.
 */
export const sendMessage = async ({
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
      senderEmail: currentUser.email,
      senderRole,
      recipientId,
      recipientRole,
      timestamp: new Date().toISOString(),
    };

    if (isReply && originalMessageId) {
      // Chemin pour les réponses
      const replyPath = `messages/${originalMessageId}/replies`;
      const newReplyKey = push(ref(database, replyPath)).key;

      await update(ref(database), {
        [`${replyPath}/${newReplyKey}`]: messageData,
      });

      console.log("Réponse enregistrée :", {
        replyPath,
        newReplyKey,
      });
    } else {
      // Chemin pour les messages
      const messagesPath = `messages`;
      const newMessageKey = push(ref(database, messagesPath)).key;

      await update(ref(database), {
        [`${messagesPath}/${newMessageKey}`]: {
          ...messageData,
          replies: {},
        },
      });

      console.log("Message enregistré :", {
        messagesPath,
        newMessageKey,
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error.message);
    throw new Error(error.message);
  }
};
