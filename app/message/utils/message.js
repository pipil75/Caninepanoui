"use client";

import { useState } from "react";
import { sendMessageToBothSides } from " ./sendMessageToBothSides";

export default function SendMessageClient() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSendMessage = async () => {
    try {
      setStatus("Envoi en cours...");
      await sendMessageToBothSides({
        message,
        recipientId: "some-recipient-id",
        recipientRole: "user",
      });
      setStatus("Message envoyé avec succès !");
    } catch (error) {
      setStatus(`Erreur : ${error.message}`);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Votre message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Envoyer</button>
      <p>{status}</p>
    </div>
  );
}
