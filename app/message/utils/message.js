"use client";

import { useState } from "react";
import { sendMessageToBothSides } from "./sendMessageToBothSides";

export default function SendMessageClient({
  messageId,
  recipientId,
  recipientRole,
}) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSendReply = async () => {
    if (!message.trim()) {
      setStatus("Le message ne peut pas être vide.");
      return;
    }

    console.log("Envoi d'une réponse pour messageId:", messageId);
    console.log("RecipientId:", recipientId);
    console.log("RecipientRole:", recipientRole);

    try {
      setStatus("Envoi en cours...");
      await sendMessageToBothSides({
        message,
        recipientId,
        recipientRole,
        isReply: !!messageId, // Passe en mode "réponse" si messageId est défini
        originalMessageId: messageId, // L'ID du message auquel on répond
      });
      setMessage(""); // Réinitialise le champ après envoi
      setStatus("Réponse envoyée avec succès !");
    } catch (error) {
      setStatus(`Erreur lors de l'envoi de la réponse : ${error.message}`);
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <input
        type="text"
        placeholder="Votre réponse"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "5px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={handleSendReply}
        style={{
          padding: "6px 12px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#28a745",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Envoyer la réponse
      </button>
      {status && (
        <p
          style={{
            marginTop: "5px",
            color: status.includes("Erreur") ? "red" : "green",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}
