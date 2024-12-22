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

    // Détermine le rôle de l'expéditeur
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
      // Ajouter une réponse au message existant
      const senderReplyPath = `users/${senderRole}/${currentUser.uid}/messages/${originalMessageId}/replies`;
      const recipientReplyPath = `users/${recipientRole}/${recipientId}/messages/${originalMessageId}/replies`;

      const newReplyKey = push(ref(database, senderReplyPath)).key;

      // Assurez-vous que la réponse est enregistrée dans les deux chemins corrects
      updates[`${senderReplyPath}/${newReplyKey}`] = messageData; // Pour l'expéditeur
      updates[`${recipientReplyPath}/${newReplyKey}`] = messageData; // Pour le destinataire

      console.log("Chemins de mise à jour pour la réponse :", {
        senderReplyPath,
        recipientReplyPath,
      });
    } else {
      // Nouveau message
      const senderPath = `users/${senderRole}/${currentUser.uid}/messages`;
      const recipientPath = `users/${recipientRole}/${recipientId}/messages`;

      const newMessageKey = push(ref(database, senderPath)).key;

      // Assurez-vous que le message est enregistré dans les deux chemins corrects
      updates[`${senderPath}/${newMessageKey}`] = messageData;
      updates[`${recipientPath}/${newMessageKey}`] = messageData;

      console.log("Chemins de mise à jour pour le message :", {
        senderPath,
        recipientPath,
      });
    }

    // Mise à jour dans Firebase
    await update(ref(database), updates);
    console.log("Mise à jour réussie dans Firebase :", updates);
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error.message);
    throw new Error(error.message);
  }
};
