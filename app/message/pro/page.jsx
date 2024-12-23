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
  const [reply, setReply] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProMessages = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("Utilisateur non authentifié.");
        setError("Vous devez être connecté pour voir vos messages.");
        setLoading(false);
        return;
      }

      const proId = currentUser.uid;
      const messagesRef = ref(database, `messages`);

      onValue(
        messagesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const messagesArray = Object.keys(data)
              .filter((key) => data[key].recipientId === proId)
              .map((key) => ({
                id: key,
                ...data[key],
                replies: data[key].replies
                  ? Object.keys(data[key].replies).map((replyKey) => ({
                      id: replyKey,
                      ...data[key].replies[replyKey],
                    }))
                  : [],
              }));

            setMessages(messagesArray);
          } else {
            setMessages([]);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Erreur lors de la récupération des messages :", error);
          setError("Une erreur est survenue lors du chargement des messages.");
          setLoading(false);
        }
      );
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
    const replyMessage = reply[message.id];
    if (!replyMessage?.trim()) {
      alert("Le message de réponse ne peut pas être vide.");
      return;
    }

    try {
      await sendMessageToBothSides({
        message: replyMessage,
        recipientId: message.senderId,
        recipientRole: message.senderRole || "user",
        isReply: true,
        originalMessageId: message.id,
      });
      S;

      setReply((prev) => ({ ...prev, [message.id]: "" }));
      alert("Réponse envoyée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error.message);
      alert("Une erreur est survenue lors de l'envoi de la réponse.");
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await remove(ref(database, `messages/${messageId}`));
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
    return <Typography>Chargement des messages...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error" variant="h6">
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Messages Professionnels
      </Typography>
      {messages.length === 0 ? (
        <Typography variant="h6" color="text.secondary">
          Aucun message trouvé.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {messages.map((message) => (
            <Grid item xs={12} md={6} key={message.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    De : {message.senderEmail || "Inconnu"}
                  </Typography>
                  <Typography variant="body1">{message.message}</Typography>
                  {message.replies && message.replies.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1">Réponses :</Typography>
                      {message.replies.map((reply) => (
                        <Box
                          key={reply.id}
                          sx={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <Typography variant="body2">
                            <strong>Message :</strong> {reply.message}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <TextField
                    placeholder="Répondre..."
                    fullWidth
                    size="small"
                    value={reply[message.id] || ""}
                    onChange={(e) =>
                      handleReplyChange(message.id, e.target.value)
                    }
                    sx={{ marginTop: 2 }}
                  />
                  <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                    <Button
                      onClick={() => handleReplySubmit(message)}
                      variant="contained"
                      startIcon={<Reply />}
                      size="small"
                    >
                      Répondre
                    </Button>
                    <Button
                      onClick={() => handleDelete(message.id)}
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      size="small"
                    >
                      Supprimer
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
