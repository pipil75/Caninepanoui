"use client";
import React, { useEffect, useState } from "react";
import { ref, get, remove } from "firebase/database";
import { auth, database } from "../../lib/firebase";
import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  Avatar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ResponsiveAppBar from "../navbar";
import { Bolt } from "@mui/icons-material";

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes
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
        } else {
          setAppointments([]);
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

      // Refresh the appointments list
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
      <Typography
        variant="h2"
        sx={{
          color: "#6F6561",
          fontSize: { xs: "1rem", md: "1.1rem" },
          fontWeight: "bold",
        }}
      >
        {" "}
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
                justifyContent: "flex-start", // Align left by default
                "@media (max-width: 600px)": {
                  justifyContent: "center", // Center on mobile
                },
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  padding: 2,
                  flexWrap: "wrap",
                  "@media (max-width: 600px)": {
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  },
                }}
              >
                <Avatar
                  src={appointment.proImage || "/default-profile.png"}
                  alt="User Profile"
                  sx={{
                    width: 60,
                    height: 60,
                    marginRight: 2,
                    "@media (max-width: 600px)": {
                      width: 50,
                      height: 50,
                      marginBottom: 1,
                    },
                  }}
                />
                <CardContent sx={{ flex: 1, padding: "8px 0" }}>
                  <Typography variant="body1">
                    Email: {appointment.proEmail}
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
                    "@media (max-width: 600px)": {
                      width: "100%",
                      marginTop: 1,
                    },
                  }}
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
};

export default UserAppointments;
