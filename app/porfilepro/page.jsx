"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { database } from "../../lib/firebase";
import { Card, CardContent, Typography, List, ListItem } from "@mui/material";
import ResponsiveAppBar from "../navbar";
import CookieAccepter from "../component/cookie/page";

export default function ProfessionalAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // Pour l'état de l'authentification
  const auth = getAuth();

  useEffect(() => {
    // Configurer la persistance de session
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Vérifier l'état de l'utilisateur
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // Si l'utilisateur est connecté, récupérer les rendez-vous
            setAuthLoading(false);
            const fetchAppointments = async () => {
              try {
                const professionalAppointmentsRef = ref(
                  database,
                  `users/${user.uid}/appointments`
                );
                const snapshot = await get(professionalAppointmentsRef);
                if (snapshot.exists()) {
                  const appointmentsData = snapshot.val();
                  const appointmentsList = Object.keys(appointmentsData).map(
                    (key) => ({
                      id: key,
                      ...appointmentsData[key],
                    })
                  );
                  setAppointments(appointmentsList);
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
            // Si l'utilisateur n'est pas connecté
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
      <List>
        {appointments.map((appointment) => (
          <ListItem key={appointment.id}>
            <Card sx={{ width: "100%", mb: 2 }}>
              <CardContent>
                <Typography>Email: {appointment.userEmail}</Typography>
                <Typography>Date: {appointment.date}</Typography>
                <Typography>Heure: {appointment.time}</Typography>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    </div>
  );
}
