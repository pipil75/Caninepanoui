// UserMessages.js
"use client";

import React, { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { auth, database } from "../../../lib/firebase";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Grid,
} from "@mui/material";
import { Delete, Reply } from "@mui/icons-material";
import ResponsiveAppBar from "../../navbar";
import Header from "../../header";
import { sendMessageToBothSides } from "../utils/messagutil"; // Assurez-vous que le chemin est correct

export default function ProMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({}); // Réponses par message ID

  useEffect(() => {
    const fetchUserMessages = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }

      const userId = currentUser.uid;
      const messagesRef = ref(database, `users/pro/${userId}/messages`);

      onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          // Inclure les réponses pour chaque message
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
          console.log("Messages récupérés :", messagesArray);
          setMessages(messagesArray);
        } else {
          setMessages([]);
        }
        setLoading(false);
      });
    };

    fetchUserMessages();
  }, []);

  const handleReplyChange = (messageId, value) => {
    setReply((prev) => ({
      ...prev,
      [messageId]: value,
    }));
  };

  const handleReplySubmit = async (message) => {
    if (!reply[message.id]?.trim()) {
      alert("La réponse ne peut pas être vide.");
      return;
    }

    try {
      await sendMessageToBothSides({
        message: reply[message.id],
        recipientId: message.senderId,
        recipientRole: message.senderRole || "pro", // Assurez une valeur par défaut
        isReply: true,
        originalMessageId: message.id,
      });
      setReply((prev) => ({ ...prev, [message.id]: "" })); // Réinitialise la réponse pour ce message
      alert("Réponse envoyée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error.message);
      alert(
        "Une erreur s'est produite lors de l'envoi de la réponse. Veuillez réessayer."
      );
    }
  };

  const handleDelete = async (messageId) => {
    const messageRef = ref(
      database,
      `users/pro/${auth.currentUser.uid}/messages/${messageId}`
    );
    try {
      await remove(messageRef);
      alert("Message supprimé !");
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du message :",
        error.message
      );
      alert("Une erreur s'est produite lors de la suppression du message.");
    }
  };

  if (loading) {
    return <p>Chargement des messages...</p>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <ResponsiveAppBar />
      <Typography variant="h4" gutterBottom>
        Messages Utilisateur
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
                    De : {message.senderEmail}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Message :</strong> {message.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", marginTop: 1 }}
                  >
                    Envoyé le : {new Date(message.timestamp).toLocaleString()}
                  </Typography>

                  {/* Affichage des réponses */}
                  {message.replies && message.replies.length > 0 && (
                    <Box sx={{ marginTop: 2 }}>
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
                            <strong>De :</strong> {reply.senderEmail}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Message :</strong> {reply.message}
                          </Typography>
                          <Typography variant="caption">
                            Envoyé le :{" "}
                            {new Date(reply.timestamp).toLocaleString()}
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
