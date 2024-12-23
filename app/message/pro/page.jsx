"use client";

import React, { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { auth, database } from "../../../lib/firebase";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { Delete, Reply } from "@mui/icons-material";
import ResponsiveAppBar from "../../navbar";
import Header from "../../header";
import { sendMessageToBothSides } from "../utils/messagutil";

export default function ProMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({}); // Réponses par message ID

  useEffect(() => {
    const fetchProMessages = () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }

      const proId = currentUser.uid;
      const messagesRef = ref(database, `users/pro/${proId}/messages`);

      onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const messagesArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            replies: data[key].replies
              ? Object.keys(data[key].replies).map((replyKey) => ({
                  id: replyKey,
                  ...data[key].replies[replyKey],
                }))
              : [],
          }));
          console.log("Messages récupérés avec réponses :", messagesArray);
          setMessages(messagesArray);
        } else {
          setMessages([]);
        }
        setLoading(false);
      });
    };

    fetchProMessages();
  }, []);

  const handleReplyChange = (messageId, value) => {
    setReply((prev) => ({
      ...prev,
      [messageId]: value,
    }));
  };

  const handleReplySubmit = async (message) => {
    const replyMessage = reply[message.id]; // Récupère la réponse depuis l'état
    if (!replyMessage?.trim()) {
      alert("Le message de réponse ne peut pas être vide.");
      return;
    }

    try {
      console.log("ID du message parent :", message.id); // Debug
      console.log("ID du destinataire :", message.senderId);

      await sendMessageToBothSides({
        message: replyMessage,
        recipientId: message.senderId, // L'expéditeur du message devient le destinataire
        recipientRole: "user", // Le pro répond à l'utilisateur
        isReply: true,
        originalMessageId: message.id, // Passe l'ID du message parent
      });

      setReply((prev) => ({ ...prev, [message.id]: "" })); // Réinitialise le champ de réponse
      alert("Réponse envoyée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error.message);
      alert("Une erreur est survenue lors de l'envoi de la réponse.");
    }
  };

  const handleDelete = async (messageId) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Utilisateur non authentifié.");
      return;
    }

    const messageRef = ref(
      database,
      `users/pro/${currentUser.uid}/messages/${messageId}`
    );

    try {
      await remove(messageRef);
      alert("Message supprimé !");
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du message :",
        error.message
      );
      alert("Une erreur est survenue lors de la suppression du message.");
    }
  };

  if (loading) {
    return <p>Chargement des messages...</p>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <ResponsiveAppBar />
      <Typography variant="h4" gutterBottom>
        Messages Pro
      </Typography>
      {messages.length === 0 ? (
        <Typography variant="h6" color="text.secondary">
          Aucun message trouvé.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {messages.map((message) => (
            <Grid item xs={12} md={6} key={message.id}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    De : {message.senderEmail || "Inconnu"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Message :</strong>{" "}
                    {message.message || "Pas de contenu"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", marginTop: 1 }}
                  >
                    Envoyé le :{" "}
                    {message.timestamp
                      ? new Date(message.timestamp).toLocaleString()
                      : "Inconnu"}
                  </Typography>

                  {message.replies && message.replies.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1">Réponses :</Typography>
                      {message.replies.map((reply) => (
                        <Box key={reply.id} sx={{ marginBottom: "8px" }}>
                          <Typography variant="body2">
                            <strong>De :</strong>{" "}
                            {reply.senderEmail || "Inconnu"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Message :</strong>{" "}
                            {reply.message || "Pas de contenu"}
                          </Typography>
                          <Typography variant="caption">
                            Envoyé le :{" "}
                            {reply.timestamp
                              ? new Date(reply.timestamp).toLocaleString()
                              : "Inconnu"}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Formulaire de réponse */}
                  <Box sx={{ marginTop: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Répondre..."
                      value={reply[message.id] || ""}
                      onChange={(e) =>
                        handleReplyChange(message.id, e.target.value)
                      }
                    />
                    <Box sx={{ marginTop: 1, display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<Reply />}
                        onClick={() => handleReplySubmit(message)}
                      >
                        Répondre
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(message.id)}
                      >
                        Supprimer
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Header />
    </Box>
  );
}
