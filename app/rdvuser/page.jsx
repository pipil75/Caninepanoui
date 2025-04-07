"use client";
import React, { useEffect, useState } from "react";
import { ref, get, remove } from "firebase/database";
import { auth, database } from "../../lib/firebase";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import ResponsiveAppBar from "../navbar";
const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est bien connecté
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      const appointmentsRef = ref(database, `users/${userId}/appointments`);

      get(appointmentsRef).then((snapshot) => {
        if (snapshot.exists()) {
          setAppointments(
            Object.entries(snapshot.val()).map(([id, data]) => ({
              id,
              ...data,
            }))
          );
        }
      });
    }
  }, [userId]);

  const handleDeleteAppointment = async (appointmentId) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer ce rendez-vous ?"
    );
    if (!confirmDelete) return;

    try {
      await remove(
        ref(database, `users/${userId}/appointments/${appointmentId}`)
      );

      // Recharger la liste des rendez-vous après suppression
      const updatedSnapshot = await get(
        ref(database, `users/${userId}/appointments`)
      );
      if (updatedSnapshot.exists()) {
        setAppointments(
          Object.entries(updatedSnapshot.val()).map(([id, data]) => ({
            id,
            ...data,
          }))
        );
      } else {
        setAppointments([]);
      }

      alert("Rendez-vous supprimé !");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur lors de la suppression du rendez-vous.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ResponsiveAppBar />
      <h2>Mes Rendez-vous</h2>
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <Card
            key={appointment.id}
            style={{ marginBottom: "15px", padding: "10px" }}
          >
            <CardContent>
              <Typography variant="h6">{appointment.title}</Typography>
              <Typography variant="body1">Date: {appointment.date}</Typography>
              <Typography variant="body2">Heure: {appointment.time}</Typography>
              <Typography variant="body2">
                Non du Professionel: {appointment.proName}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDeleteAppointment(appointment.id)}
                style={{ marginTop: "10px" }}
              >
                Supprimer
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>Aucun rendez-vous trouvé.</p>
      )}
    </div>
  );
};

export default UserAppointments;
