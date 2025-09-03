"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { ref, get, remove } from "firebase/database";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { database } from "../../lib/firebase";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Avatar,
  Button,
  Box,
  CssBaseline,
} from "@mui/material";
import ResponsiveAppBar from "../navbar";
import CookieAccepter from "../component/cookie/page";
import Header from "../header";

export default function ProfessionalAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setAuthLoading(false);
            const fetchAppointments = async () => {
              try {
                const professionalAppointmentsRef = ref(
                  database,
                  `users/${user.uid}/appointments`
                );
                const snapshot = await get(professionalAppointmentsRef);

                if (snapshot.exists()) {
                  let appointmentsData = snapshot.val();
                  let appointmentsList = Object.keys(appointmentsData).map(
                    (key) => ({
                      id: key,
                      ...appointmentsData[key],
                    })
                  );

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  appointmentsList = appointmentsList.filter((appointment) => {
                    const appointmentDate = new Date(appointment.date);
                    appointmentDate.setHours(0, 0, 0, 0);
                    return appointmentDate >= today;
                  });

                  // Récupère l'image du client si stockée en DB (champ "image")
                  const withImages = await Promise.all(
                    appointmentsList.map(async (a) => {
                      if (a.userId) {
                        const userImageRef = ref(
                          database,
                          `users/${a.userId}/image`
                        );
                        const imgSnap = await get(userImageRef);
                        if (imgSnap.exists()) {
                          return { ...a, userImage: imgSnap.val() };
                        }
                      }
                      return { ...a, userImage: null };
                    })
                  );

                  setAppointments(withImages);
                } else {
                  setAppointments([]);
                }
              } catch (error) {
                console.error(
                  "Erreur lors de la récupération des rendez-vous :",
                  error.message
                );
                setAppointments([]);
              }
              setLoading(false);
            };
            fetchAppointments();
          } else {
            setAuthLoading(false);
            setLoading(false);
          }
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la configuration de la persistance :",
          error.message
        );
        setAuthLoading(false);
        setLoading(false);
      });
  }, [auth]);

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await remove(
        ref(
          database,
          `users/${auth.currentUser.uid}/appointments/${appointmentId}`
        )
      );
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du rendez-vous :",
        error.message
      );
    }
  };

  if (authLoading || loading) {
    return <p>Chargement des données...</p>;
  }

  return (
    // Wrapper pleine hauteur + flex column => footer sticky
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

      {/* Contenu principal (pousse le footer) */}
      <Box
        component="main"
        sx={{ flex: 1, px: { xs: 2, md: 8 }, py: { xs: 3, md: 6 } }}
      >
        <CookieAccepter />

        <Typography
          variant="h5"
          align="center"
          sx={{
            color: "#847774",
            maxWidth: "85%",
            lineHeight: 1.6,
            mb: 4,
            mx: "auto",
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
          }}
        >
          Hello et bienvenue dans ton espace pro ! Ici, tout est pensé pour te
          faciliter la vie : tu peux consulter tes rendez-vous, lire les
          messages de tes clients.
        </Typography>

        <Typography variant="h6" gutterBottom>
          Mes Rendez-vous
        </Typography>

        {appointments.length === 0 ? (
          <Typography variant="h6" color="textSecondary">
            Aucun rendez-vous à venir.
          </Typography>
        ) : (
          <List>
            {appointments.map((appointment) => (
              <ListItem
                key={appointment.id}
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  "@media (max-width: 600px)": { justifyContent: "center" },
                }}
              >
                <Card
                  sx={{
                    width: "100%",
                    maxWidth: 400,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    flexWrap: "wrap",
                    "@media (max-width: 600px)": {
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    },
                  }}
                >
                  <Avatar
                    src={appointment.userImage || "/default-profile.png"}
                    alt="User Profile"
                    sx={{
                      width: 60,
                      height: 60,
                      mr: 2,
                      "@media (max-width: 600px)": {
                        width: 50,
                        height: 50,
                        mb: 1,
                        mr: 0,
                      },
                    }}
                  />
                  <CardContent sx={{ flex: 1, p: "8px 0" }}>
                    <Typography variant="body1">
                      Email: {appointment.userEmail}
                    </Typography>
                    <Typography variant="body1">
                      Date: {appointment.date}
                    </Typography>
                    <Typography variant="body1">
                      Heure: {appointment.time}
                    </Typography>
                  </CardContent>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteAppointment(appointment.id)}
                    sx={{
                      "@media (max-width: 600px)": { width: "100%", mt: 1 },
                    }}
                  >
                    Supprimer
                  </Button>
                </Card>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Footer sticky */}
      <Box component="footer" sx={{ mt: "auto", width: "100%" }}>
        <Header />
      </Box>
    </Box>
  );
}
