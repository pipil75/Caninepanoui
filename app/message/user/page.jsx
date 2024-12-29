// UserMessages.js
"use client";

import React, { useEffect, useState } from "react";
import { ref, push, update, remove, onValue } from "firebase/database";
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

export default function UserMessages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({}); // Réponses par conversation ID

  useEffect(() => {
    const fetchConversations = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }

      const userId = currentUser.uid;
      const conversationsRef = ref(
        database,
        `users/user/${userId}/conversations`
      );

      onValue(conversationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          // Transformer les données pour inclure les messages de chaque conversation
          const conversationsArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            messages: data[key].messages
              ? Object.keys(data[key].messages).map((msgKey) => ({
                  id: msgKey,
                  ...data[key].messages[msgKey],
                }))
              : [],
          }));
          console.log("Conversations récupérées :", conversationsArray);
          setConversations(conversationsArray);
        } else {
          setConversations([]);
        }
        setLoading(false);
      });
    };

    fetchConversations();
  }, []);

  const handleReplyChange = (conversationId, value) => {
    setReply((prev) => ({
      ...prev,
      [conversationId]: value,
    }));
  };

  const handleReplySubmit = async (conversation) => {
    const conversationId = conversation.id;
    const recipientId = conversation.recipientId;

    if (!reply[conversationId]?.trim()) {
      console.log("Message vide ou invalide :", reply[conversationId]);
      alert("La réponse ne peut pas être vide.");
      return;
    }

    if (!recipientId) {
      alert("L'identifiant du destinataire est manquant.");
      return;
    }

    const messageData = {
      message: reply[conversationId].trim(),
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.name || "Utilisateur",
      timestamp: new Date().toISOString(),
    };

    try {
      // Crée une référence au chemin des messages
      const messageRef = ref(
        database,
        `users/user/${auth.currentUser.uid}/conversations/${conversationId}/messages`
      );

      // Utilise push pour créer une clé unique
      const newMessageKey = push(messageRef).key;

      console.log("Clé générée pour le message :", newMessageKey);

      if (!newMessageKey) {
        throw new Error(
          "Impossible de générer une clé pour le nouveau message."
        );
      }

      // Prépare les mises à jour à écrire dans la base de données
      const updates = {
        [`users/user/${auth.currentUser.uid}/conversations/${conversationId}/messages/${newMessageKey}`]:
          messageData,
        [`users/pro/${recipientId}/conversations/${conversationId}/messages/${newMessageKey}`]:
          messageData,
      };

      console.log("Mises à jour préparées pour Firebase :", updates);

      // Applique les mises à jour
      await update(ref(database), updates);
      console.log("Mises à jour effectuées avec succès !");
      setReply((prev) => ({ ...prev, [conversationId]: "" }));
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error);
      alert(`Une erreur s'est produite : ${error.message}`);
    }
  };

  const handleDelete = async (conversationId) => {
    const conversationRef = ref(
      database,
      `users/user/${auth.currentUser.uid}/conversations/${conversationId}`
    );
    try {
      await remove(conversationRef);
      alert("Conversation supprimée !");
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la conversation :",
        error.message
      );
      alert("Une erreur s'est produite lors de la suppression.");
    }
  };

  if (loading) {
    return <p>Chargement des conversations...</p>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <ResponsiveAppBar />
      <Typography variant="h4" gutterBottom>
        Conversations Utilisateur
      </Typography>
      {conversations.length === 0 ? (
        <Typography variant="h6" color="text.secondary">
          Aucune conversation trouvée.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {conversations.map((conversation) => (
            <Grid item xs={12} md={6} key={conversation.id}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Avec : {conversation.recipientName}
                  </Typography>

                  {/* Affichage des messages */}
                  <Box sx={{ marginTop: 2 }}>
                    <Typography variant="subtitle1">Messages :</Typography>
                    {conversation.messages.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "8px",
                          marginBottom: "8px",
                          backgroundColor:
                            msg.senderId === auth.currentUser.uid
                              ? "#dcf8c6"
                              : "#fff",
                        }}
                      >
                        <Typography variant="body2">
                          <strong>De :</strong> {msg.senderName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Message :</strong> {msg.message}
                        </Typography>
                        <Typography variant="caption">
                          Envoyé le : {new Date(msg.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Formulaire de réponse */}
                  <Box sx={{ marginTop: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Répondre..."
                      value={reply[conversation.id] || ""}
                      onChange={(e) =>
                        handleReplyChange(conversation.id, e.target.value)
                      }
                    />
                    <Box sx={{ marginTop: 1, display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<Reply />}
                        onClick={() => handleReplySubmit(conversation)}
                      >
                        Répondre
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(conversation.id)}
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
