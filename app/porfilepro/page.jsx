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
} from "@mui/material";
import ResponsiveAppBar from "../navbar";
import CookieAccepter from "../component/cookie/page";

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

                  console.log("Rendez-vous récupérés :", appointmentsList); // 🔍 Debug

                  // Vérifier si les dates sont bien interprétées
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Ignore l'heure

                  appointmentsList = appointmentsList.filter((appointment) => {
                    const appointmentDate = new Date(appointment.date);
                    appointmentDate.setHours(0, 0, 0, 0); // Ignore l'heure

                    console.log(
                      `Comparaison : ${appointment.date} >= ${
                        today.toISOString().split("T")[0]
                      }`
                    );

                    return appointmentDate >= today;
                  });

                  console.log("Rendez-vous après filtrage :", appointmentsList); // 🔍 Debug

                  // Récupérer les images des utilisateurs
                  const appointmentsWithImages = await Promise.all(
                    appointmentsList.map(async (appointment) => {
                      if (appointment.userId) {
                        const userImageRef = ref(
                          database,
                          `users/${appointment.userId}/image`
                        );
                        const userImageSnapshot = await get(userImageRef);
                        if (userImageSnapshot.exists()) {
                          return {
                            ...appointment,
                            userImage: userImageSnapshot.val(),
                          };
                        }
                      }
                      return { ...appointment, userImage: null };
                    })
                  );

                  setAppointments(appointmentsWithImages);
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
      setAppointments((prevAppointments) =>
        prevAppointments.filter(
          (appointment) => appointment.id !== appointmentId
        )
      );
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
    <div>
      <ResponsiveAppBar />
      <CookieAccepter />
      <Typography variant="h4" gutterBottom>
        Mes Rendez-vous
      </Typography>
      {appointments.length === 0 ? (
        <Typography variant="h6" color="textSecondary">
          Aucun rendez-vous à venir.
        </Typography>
      ) : (
        <List>
          {appointments.map((appointment) => (
            <ListItem key={appointment.id}>
              <Card
                sx={{
                  width: "100%",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  padding: 2,
                }}
              >
                <Avatar
                  src={appointment.userImage || "/default-profile.png"}
                  alt="User Profile"
                  sx={{ width: 60, height: 60, marginRight: 2 }}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography>Email: {appointment.userEmail}</Typography>
                  <Typography>Date: {appointment.date}</Typography>
                  <Typography>Heure: {appointment.time}</Typography>
                </CardContent>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteAppointment(appointment.id)}
                >
                  Supprimer
                </Button>
              </Card>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}
