/**
 * Envoie un message ou une réponse, avec gestion des chemins Firebase.
 */
"use client";

import { ref, push, update } from "firebase/database";
import { auth, database } from "../../../lib/firebase";

/**
 * Envoie un message ou une réponse
 * @param {Object} params
 */
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

    if (isReply) {
      // Ajouter une réponse sous le bon message
      if (!originalMessageId) {
        throw new Error("Un ID de message parent est requis pour une réponse.");
      }

      const replyPath = `messages/${originalMessageId}/replies`;
      const newReplyKey = push(ref(database, replyPath)).key;

      await update(ref(database), {
        [`${replyPath}/${newReplyKey}`]: messageData,
      });

      console.log("Réponse ajoutée :", {
        replyPath,
        newReplyKey,
      });
    } else {
      // Ajouter un nouveau message
      const messagesPath = `messages`;
      const newMessageKey = push(ref(database, messagesPath)).key;

      await update(ref(database), {
        [`${messagesPath}/${newMessageKey}`]: {
          ...messageData,
          replies: {}, // Initialise la section des réponses
        },
      });

      console.log("Message ajouté :", {
        messagesPath,
        newMessageKey,
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error.message);
    throw new Error(error.message);
  }
};
