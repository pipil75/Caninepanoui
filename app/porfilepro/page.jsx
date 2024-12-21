"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database, auth } from "../../lib/firebase";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ResponsiveAppBar from "../navbar";
import CookieAccepter from "../component/cookie/page";
export default function ProfessionalAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const fetchAppointments = async () => {
        try {
          const professionalAppointmentsRef = ref(
            database,
            `users/${currentUser.uid}/appointments`
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
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <p>Chargement des données...</p>;
  }

  if (appointments.length === 0) {
    return <p>Aucun rendez-vous trouvé.</p>;
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
