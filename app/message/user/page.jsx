"use client";

import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
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
import { sendMessageToBothSides } from "../utils/messagutil";

export default function UserMessages() {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMessages = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }

      const userId = currentUser.uid;
      const messagesRef = ref(database, "messages");

      onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const filteredMessages = Object.keys(data)
            .filter((key) => data[key].recipientId === userId)
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
          setMessages(filteredMessages);
        } else {
          setMessages([]);
        }
        setLoading(false);
      });
    };

    fetchUserMessages();
  }, []);

  const handleReplySubmit = async (messageId, replyMessage) => {
    if (!replyMessage.trim()) {
      alert("Le message de réponse ne peut pas être vide.");
      return;
    }

    try {
      await sendMessageToBothSides({
        message: replyMessage,
        recipientId: messages.find((m) => m.id === messageId).senderId,
        recipientRole: "pro",
        isReply: true,
        originalMessageId: messageId,
      });

      setReply((prev) => ({ ...prev, [messageId]: "" }));
      alert("Réponse envoyée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error.message);
      alert("Une erreur est survenue lors de l'envoi de la réponse.");
    }
  };

  if (loading) return <Typography>Chargement des messages...</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Vos Messages
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
                  <TextField
                    placeholder="Répondre..."
                    fullWidth
                    size="small"
                    value={reply[message.id] || ""}
                    onChange={(e) =>
                      setReply((prev) => ({
                        ...prev,
                        [message.id]: e.target.value,
                      }))
                    }
                    sx={{ marginTop: 2 }}
                  />
                  <Button
                    variant="contained"
                    sx={{ marginTop: 2 }}
                    onClick={() =>
                      handleReplySubmit(message.id, reply[message.id] || "")
                    }
                  >
                    Répondre
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
