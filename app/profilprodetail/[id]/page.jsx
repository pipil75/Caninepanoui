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
import styles from "../Profil.module.css";
export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Récupérer l'ID depuis l'URL
  const [user, setUser] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [showPayPalPopup, setShowPayPalPopup] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const initialOptions = {
    "client-id":
      "AWuwTPoxttVt936EYkc_kjNKTrusQxjaGSlFGbDRW2RKgeODFTuK7n2lIsUKcwF0KgOuwbvk1XG-hSGF",
    "enable-funding": "venmo",
    "disable-funding": "",
    "buyer-country": "FR",
    currency: "EUR",
    "data-page-type": "product-details",
    components: "buttons",
    "data-sdk-integration-source": "developer-studio",
  };
  useEffect(() => {
    if (id) {
      const fetchUserDetail = async () => {
        try {
          // Récupérer les informations de l'utilisateur (le professionnel)
          const userRef = ref(database, `users/${id}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUser(snapshot.val());
          } else {
            setUser(null); // Si aucune donnée trouvée
          }

          // Récupérer les informations du professionnel
          const professionalRef = ref(database, `users/${id}`);
          const professionalSnapshot = await get(professionalRef);
          if (professionalSnapshot.exists()) {
            setProfessional(professionalSnapshot.val());
          } else {
            setProfessional(null); // Si aucune donnée trouvée
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des détails:", error);
          setUser(null);
          setProfessional(null);
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
      // Référence aux rendez-vous existants de l'utilisateur
      const userAppointmentsRef = ref(
        database,
        `users/${currentUser.uid}/appointments`
      );

      // Récupération des rendez-vous existants
      const userAppointmentsSnapshot = await get(userAppointmentsRef);

      // Vérifie si des rendez-vous existent
      if (userAppointmentsSnapshot.exists()) {
        const existingAppointments = userAppointmentsSnapshot.val();

        // Debugging pour vérifier les données
        console.log("Rendez-vous existants :", existingAppointments);

        const isConflict = Object.values(existingAppointments).some(
          (appointment) =>
            appointment.date === date && appointment.time === time
        );

        if (isConflict) {
          setConfirmationMessage(
            <span style={{ color: "red" }}>
              Un rendez-vous existe déjà à cette date et heure.
            </span>
          );
          return;
        }
      } else {
        console.log("Aucun rendez-vous existant trouvé pour cet utilisateur.");
      }

      const appointmentData = {
        date: date,
        time: time,
        professionalId: id,

        userId: currentUser.uid,
        userName: currentUser.displayName || "Utilisateur Anonyme",
        userEmail: currentUser.email,
        proName: professional?.name || "Professionnel Anonyme",
        proEmail: user && user.email ? user.email : "",
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

      // Références Firebase pour les conversations
      const userConversationsRef = ref(
        database,
        `users/user/${auth.currentUser.uid}/conversations`
      );
      const recipientConversationsRef = ref(
        database,
        `users/pro/${user.uid}/conversations`
      );

      // Vérifier si une conversation existe déjà
      const userConversationsSnapshot = await get(userConversationsRef);
      let conversationId = null;

      if (userConversationsSnapshot.exists()) {
        const conversations = userConversationsSnapshot.val();
        // Rechercher une conversation avec cet utilisateur
        for (const key in conversations) {
          if (conversations[key].recipientId === user.uid) {
            conversationId = key;
            break;
          }
        }
      }

      if (conversationId) {
        // Si la conversation existe, ajouter le message dans la conversation existante
        const messageRef = ref(
          database,
          `users/user/${auth.currentUser.uid}/conversations/${conversationId}/messages`
        );
        const newMessageKey = push(messageRef).key;

        const updates = {};
        updates[
          `users/user/${auth.currentUser.uid}/conversations/${conversationId}/messages/${newMessageKey}`
        ] = messageData;
        updates[
          `users/pro/${user.uid}/conversations/${conversationId}/messages/${newMessageKey}`
        ] = messageData;

        await update(ref(database), updates);
      } else {
        // Si aucune conversation n'existe, créer une nouvelle conversation
        conversationId = push(userConversationsRef).key;

        const updates = {};
        updates[
          `users/user/${auth.currentUser.uid}/conversations/${conversationId}`
        ] = {
          recipientId: user.uid,
          recipientName: user.displayName || "Professionnel",
          messages: {
            [push(ref(database)).key]: messageData,
          },
        };
        updates[`users/pro/${user.uid}/conversations/${conversationId}`] = {
          recipientId: auth.currentUser.uid,
          recipientName: auth.currentUser.displayName || "Utilisateur",
          messages: {
            [push(ref(database)).key]: messageData,
          },
        };

        await update(ref(database), updates);
      }

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
      <div className={styles.card}>
        <Card
          sx={{ maxWidth: 400, margin: "auto", boxShadow: 3, borderRadius: 2 }}
        >
          <CardMedia
            component="img"
            height="300"
            image={user.image || "https://via.placeholder.com/150"} // Remplacez par le chemin de votre image
            alt="Professional"
          />
          <div className={styles.cardcontent}>
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
                <strong>Description :</strong>{" "}
                {user.description || "Non fourni"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Experience:</strong> {user.experience || "Non fourni"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Prix:</strong> {user.prix || "Non fourni"}
              </Typography>
            </CardContent>
          </div>
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
            <IconButton
              aria-label="Calendrier"
              onClick={handleCalendarIconClick}
            >
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
                Effectuez un paiement pour réserver ce professionnel.
              </DialogContentText>

              <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                  style={{
                    shape: "rect",
                    layout: "vertical",
                    color: "gold",
                    label: "paypal",
                  }}
                  createOrder={async () => {
                    try {
                      const response = await fetch("/api/orders", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          amount: "60.00",
                          currency: "EUR",
                          payeeEmail: user.email,
                        }),
                      });

                      const orderData = await response.json();
                      console.log("order data : ", orderData);

                      if (orderData.id) {
                        return orderData.id;
                      } else {
                        const errorDetail = orderData?.details?.[0];
                        const errorMessage = errorDetail
                          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                          : JSON.stringify(orderData);

                        throw new Error(errorMessage);
                      }
                    } catch (error) {
                      console.error(error);
                      setMessage(
                        `Could not initiate PayPal Checkout...${error}`
                      );
                    }
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      const response = await fetch(
                        `/api/orders/${data.orderID}/capture`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      const orderData = await response.json();
                      const errorDetail = orderData?.details?.[0];

                      if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                        return actions.restart();
                      } else if (errorDetail) {
                        throw new Error(
                          `${errorDetail.description} (${orderData.debug_id})`
                        );
                      } else {
                        const transaction =
                          orderData.purchase_units[0].payments.captures[0];
                        setMessage(
                          `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`
                        );
                        console.log(
                          "Capture result",
                          orderData,
                          JSON.stringify(orderData, null, 2)
                        );
                      }
                    } catch (error) {
                      console.error(error);
                      setMessage(
                        `Sorry, your transaction could not be processed...${error}`
                      );
                    }
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
    </div>
  );
}
