"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  CssBaseline,
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
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState({}); // Réponses par conversation ID

  useEffect(() => {
    let unsubscribeAuth = null;
    let unsubscribeRTDB = null;

    const init = async () => {
      try {
        // Persistance locale
        await setPersistence(auth, browserLocalPersistence);

        // Écoute l'état d'auth puis branche la DB
        unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          if (!user) {
            router.push("/");
            return;
          }

          const proId = user.uid;
          const conversationsRef = ref(
            database,
            `users/pro/${proId}/conversations`
          );

          // Écoute temps réel des conversations
          unsubscribeRTDB = onValue(conversationsRef, (snapshot) => {
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
              setConversations(conversationsArray);
            } else {
              setConversations([]);
            }
            setLoading(false);
          });
        });
      } catch (e) {
        console.error("Erreur d'initialisation:", e);
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribeRTDB) unsubscribeRTDB(); // détache l'écoute RTDB
      if (unsubscribeAuth) unsubscribeAuth(); // détache l'écoute auth
    };
  }, [router]);

  const handleReplyChange = (conversationId, value) => {
    setReply((prev) => ({ ...prev, [conversationId]: value }));
  };

  const handleReplySubmit = async (conversation) => {
    const conversationId = conversation.id;
    const recipientId = conversation.recipientId;

    if (!reply[conversationId]?.trim()) {
      alert("La réponse ne peut pas être vide.");
      return;
    }

    const messageData = {
      message: reply[conversationId].trim(),
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || "Professionnel",
      timestamp: new Date().toISOString(),
    };

    try {
      const newMsgRefPath = `users/pro/${auth.currentUser.uid}/conversations/${conversationId}/messages`;
      const newMessageKey = push(ref(database, newMsgRefPath)).key;

      const updates = {};
      updates[`${newMsgRefPath}/${newMessageKey}`] = messageData;
      updates[
        `users/user/${recipientId}/conversations/${conversationId}/messages/${newMessageKey}`
      ] = messageData;

      await update(ref(database), updates);
      setReply((prev) => ({ ...prev, [conversationId]: "" }));
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error.message);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  const handleDelete = async (conversationId) => {
    try {
      await remove(
        ref(
          database,
          `users/pro/${auth.currentUser.uid}/conversations/${conversationId}`
        )
      );
      alert("Conversation supprimée !");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error.message);
      alert("Une erreur s'est produite lors de la suppression.");
    }
  };

  if (loading) {
    return <p>Chargement des conversations...</p>;
  }

  return (
    // 👇 Wrapper pleine hauteur avec flex column pour sticky footer
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <CssBaseline />
      <ResponsiveAppBar />

      {/* Contenu principal qui pousse le footer en bas */}
      <Box
        component="main"
        sx={{ flex: 1, px: { xs: 2, md: 8 }, py: { xs: 3, md: 6 } }}
      >
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

                    {/* Messages */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1">Messages :</Typography>
                      {conversation.messages.map((msg) => (
                        <Box
                          key={msg.id}
                          sx={{
                            border: "1px solid #ddd",
                            borderRadius: 2,
                            p: 1.2,
                            mb: 1,
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
                            Envoyé le :{" "}
                            {new Date(msg.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Réponse */}
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Répondre..."
                        value={reply[conversation.id] || ""}
                        onChange={(e) =>
                          handleReplyChange(conversation.id, e.target.value)
                        }
                      />
                      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
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
      </Box>

      {/* Footer sticky : ton composant Header utilisé comme footer */}
      <Box component="footer" sx={{ mt: "auto", width: "100%" }}>
        <Header />
      </Box>
    </Box>
  );
}
