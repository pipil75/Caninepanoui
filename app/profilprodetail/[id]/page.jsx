"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ref, get, push, set, update } from "firebase/database";
import {
  Box,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { ArrowBack, Email, CalendarToday, Payment } from "@mui/icons-material";
import { database, auth } from "../../../lib/firebase";
import ResponsiveAppBar from "../../navbar";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { sendMessageToBothSides } from "@/app/message/utils/page";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Récupérer l'ID depuis l'URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [showPayPalPopup, setShowPayPalPopup] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");

  useEffect(() => {
    if (id) {
      const fetchUserDetail = async () => {
        try {
          const userRef = ref(database, `users/${id}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUser(snapshot.val());
          } else {
            setUser(null); // Si aucune donnée trouvée
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des détails de l'utilisateur:",
            error
          );
          setUser(null);
        }
        setLoading(false);
      };
      fetchUserDetail();
    }
  }, [id]);

  // Fonction pour enregistrer un rendez-vous
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setConfirmationMessage("Utilisateur non authentifié.");
        return;
      }

      if (!date || !time) {
        setConfirmationMessage("Veuillez fournir une date et une heure.");
        return;
      }

      const appointmentData = {
        date: date,
        time: time,
        professionalId: id,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Utilisateur Anonyme",
        userEmail: currentUser.email,
      };

      // Enregistrer le rendez-vous sous l'utilisateur
      const userAppointmentRef = ref(
        database,
        `users/${currentUser.uid}/appointments`
      );
      await push(userAppointmentRef, appointmentData);

      // Enregistrer le rendez-vous sous le professionnel
      const professionalAppointmentRef = ref(
        database,
        `users/${id}/appointments`
      );
      await push(professionalAppointmentRef, appointmentData);

      setConfirmationMessage("Le rendez-vous a été enregistré avec succès !");
      setDate("");
      setTime("");
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement des données :",
        error.message
      );
      setConfirmationMessage("Erreur lors de l'enregistrement des données.");
    }
  };

  // Fonction pour envoyer un message
  const handleSendMessage = async () => {
    try {
      if (!message.trim()) {
        setConfirmationMessage("Le message ne peut pas être vide.");
        return;
      }

      const messageData = {
        message: message.trim(),
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || "Utilisateur",
        senderEmail: auth.currentUser.email,
        recipientId: user.uid,
        timestamp: new Date().toISOString(),
      };

      console.log("Données du message :", messageData);

      // Références Firebase
      const recipientRef = ref(database, `users/pro/${user.uid}/messages`);
      const senderRef = ref(
        database,
        `users/user/${auth.currentUser.uid}/messages`
      );

      // Générer une clé unique avec push()
      const messageKey = push(recipientRef).key;

      // Préparer les mises à jour avec des chemins relatifs valides
      const updates = {};
      updates[`users/pro/${user.uid}/messages/${messageKey}`] = messageData; // Chemin côté pro
      updates[`users/user/${auth.currentUser.uid}/messages/${messageKey}`] =
        messageData; // Chemin côté utilisateur

      // Appliquer les mises à jour avec update()
      await update(ref(database), updates);

      setConfirmationMessage("Message envoyé avec succès !");
      setMessage(""); // Réinitialisation du champ message
      setOpenMessageDialog(false); // Ferme la boîte de dialogue
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error.message);
      setConfirmationMessage(`Erreur : ${error.message}`);
    }
  };

  // Gestion des dialogues
  const handleCalendarIconClick = () => {
    setShowCalendarForm((prev) => !prev);
  };

  const handleMessageIconClick = () => {
    setOpenMessageDialog(true);
  };

  const handleDialogClose = () => {
    setOpenMessageDialog(false);
  };

  const handlePaymentIconClick = () => {
    setShowPayPalPopup(true);
  };

  const handlePopupClose = () => {
    setShowPayPalPopup(false);
    setBuyerEmail("");
  };

  if (loading) {
    return <p>Chargement des données...</p>;
  }

  if (!user) {
    return <p>Aucun utilisateur trouvé.</p>;
  }

  return (
    <div>
      <ResponsiveAppBar />
      <Card
        sx={{ maxWidth: 400, margin: "auto", boxShadow: 3, borderRadius: 2 }}
      >
        <CardMedia
          component="img"
          height="300"
          image={user.image || "https://via.placeholder.com/150"} // Remplacez par le chemin de votre image
          alt="Professional"
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            fontWeight="bold"
          >
            Détails du professionnel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Nom :</strong> {user.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Email :</strong> {user.email}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>SIRET :</strong> {user.siret || "Non fourni"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Description :</strong> {user.description || "Non fourni"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Experience:</strong> {user.experience || "Non fourni"}
          </Typography>
        </CardContent>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mb: 2 }}
        >
          <IconButton aria-label="Retour" onClick={() => router.back()}>
            <ArrowBack sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton aria-label="Message" onClick={handleMessageIconClick}>
            <Email sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton aria-label="Calendrier" onClick={handleCalendarIconClick}>
            <CalendarToday sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton aria-label="Paiement" onClick={handlePaymentIconClick}>
            <Payment sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
        {showCalendarForm && (
          <CardContent>
            <Box sx={{ textAlign: "center" }}>
              {confirmationMessage && (
                <Typography sx={{ color: "green", mb: 2 }}>
                  {confirmationMessage}
                </Typography>
              )}
              <form onSubmit={handleSubmit}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  required
                  fullWidth
                  type="time"
                  label="Heure"
                  InputLabelProps={{ shrink: true }}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ backgroundColor: "secondary.main" }}
                >
                  Enregistrer
                </Button>
              </form>
            </Box>
          </CardContent>
        )}
      </Card>

      {/* Dialog for PayPal Payment */}
      {showPayPalPopup && (
        <Dialog open={showPayPalPopup} onClose={handlePopupClose}>
          <DialogTitle>Paiement avec PayPal</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Effectuez un paiement de 10€ pour réserver ce professionnel.
            </DialogContentText>
            <PayPalScriptProvider
              options={{
                "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
              }}
            >
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          currency_code: "EUR",
                          value: "10.00",
                        },
                      },
                    ],
                  });
                }}
                onApprove={(data, actions) => {
                  return actions.order.capture().then((details) => {
                    const email = details.payer.email_address;
                    setBuyerEmail(email);
                    setConfirmationMessage(
                      `Paiement effectué avec succès ! Email : ${email}`
                    );
                    setShowPayPalPopup(false);
                  });
                }}
                onError={(err) => {
                  console.error("Erreur PayPal :", err);
                  setConfirmationMessage("Erreur lors du paiement.");
                }}
              />
            </PayPalScriptProvider>
            {buyerEmail && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                Email de l'acheteur : {buyerEmail}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePopupClose}>Fermer</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog for Sending a Message */}
      <Dialog open={openMessageDialog} onClose={handleDialogClose}>
        <DialogTitle>Envoyer un message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Envoyez un message à {user.name}.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {confirmationMessage && <p>{confirmationMessage}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Annuler</Button>
          <Button onClick={handleSendMessage}>Envoyer</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
