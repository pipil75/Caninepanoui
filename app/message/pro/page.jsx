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
  Grid,
} from "@mui/material";
import { Delete, Reply } from "@mui/icons-material";
import ResponsiveAppBar from "../../navbar";
import Header from "../../header";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
export default function ProMessages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({}); // Réponses par conversation ID
  // Vérification de l'authentification de l'utilisateur
  useEffect(() => {
    // Configurer la persistance de session
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Une fois la persistance configurée, surveiller l'état de l'utilisateur
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            // Si l'utilisateur n'est pas connecté, redirection vers la page d'accueil
            router.push("/");
          } else {
            // L'utilisateur est connecté, arrêter le chargement de l'auth
            setAuthLoading(false);
          }
        });

        return () => unsubscribe(); // Nettoyer lors du démontage
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la configuration de la persistance :",
          error
        );
        // Optionnel : gérer l'erreur ici, par exemple, afficher un message à l'utilisateur
      });
  });
  useEffect(() => {
    const fetchConversations = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }

      const proId = currentUser.uid;
      const conversationsRef = ref(
        database,
        `users/pro/${proId}/conversations`
      );

      onValue(conversationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
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
    const recipientId = conversation.recipientId; // Cela fait référence à l'ID de l'utilisateur (le client)

    if (!reply[conversationId]?.trim()) {
      alert("La réponse ne peut pas être vide.");
      return;
    }

    // Création des données du message
    const messageData = {
      message: reply[conversationId].trim(),
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || "Professionnel",
      timestamp: new Date().toISOString(),
    };

    try {
      const messagesRef = ref(
        database,
        `users/pro/${auth.currentUser.uid}/conversations/${conversationId}/messages`
      );

      const newMessageRef = push(messagesRef);

      const newMessageKey = newMessageRef.key;

      const updates = {};

      updates[
        `users/pro/${auth.currentUser.uid}/conversations/${conversationId}/messages/${newMessageKey}`
      ] = messageData;

      updates[
        `users/user/${recipientId}/conversations/${conversationId}/messages/${newMessageKey}`
      ] = messageData;

      await update(ref(database), updates);

      setReply((prev) => ({ ...prev, [conversationId]: "" })); // Réinitialise la réponse pour cette conversation
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error.message);
      alert(
        "Une erreur s'est produite lors de l'envoi de la réponse. Veuillez réessayer."
      );
    }
  };
  const handleDelete = async (conversationId) => {
    const conversationRef = ref(
      database,
      `users/pro/${auth.currentUser.uid}/conversations/${conversationId}`
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
        Conversations Professionnel
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
