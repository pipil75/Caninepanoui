"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import ResponsiveAppBar from "../navbar";
import { ref, get } from "firebase/database";
import { database } from "../../lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"; // Importer l'authentification Firebase
import CookieAccepter from "../component/cookie/page";
import Header from "../header";
export default function MultiActionAreaCard() {
  const [loading, setLoading] = useState(true); // Pour le chargement initial
  const [users, setUsers] = useState([]); // Pour stocker les utilisateurs
  const [authLoading, setAuthLoading] = useState(true); // Pour vérifier l'état de l'authentification
  const router = useRouter();
  const auth = getAuth();

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
      });
  }, [auth, router]);

  // Fonction pour récupérer les utilisateurs depuis Firebase
  useEffect(() => {
    if (!authLoading) {
      // Si l'utilisateur est authentifié, on récupère les utilisateurs
      const fetchUsers = async () => {
        const usersRef = ref(database, "users");
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const proUsers = Object.entries(data)
            .map(([id, user]) => ({
              ...user, // Conserver les autres propriétés de l'utilisateur
              id,
            }))
            .filter((user) => user.role === "pro"); // Filtrer les utilisateurs pros
          setUsers(proUsers);
        } else {
          setUsers([]); // Si aucune donnée n'est trouvée
        }
        setLoading(false); // Fin du chargement des données
      };

      fetchUsers();
    }
  }, [authLoading]); // Exécuter uniquement après la vérification de l'authentification

  // Gestion du chargement de l'authentification
  if (authLoading) {
    return <p>Vérification de l'authentification...</p>;
  }

  // Gestion du chargement des utilisateurs
  if (loading) {
    return <p>Chargement des données...</p>;
  }

  // Fonction pour afficher le détail d'un utilisateur pro
  const handleOpenUserDetail = (userId) => {
    router.push(`/profilprodetail/${userId}`); // Passer l'ID de l'utilisateur dans l'URL
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: "20px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <ResponsiveAppBar />
      <CookieAccepter />

      <Typography
        variant="h1"
        align="center"
        sx={{
          color: "#847774",
          fontWeight: "bold",
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2rem" },
          maxWidth: "90%",
          marginBottom: 3,
          lineHeight: 1.5,
        }}
      >
        Bienvenue sur notre plateforme !
      </Typography>
      <Typography
        variant="h5"
        align="center"
        sx={{
          color: "#847774",
          maxWidth: "85%",
          lineHeight: 1.6,
          marginBottom: 4,
          fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
        }}
      >
        Ici, vous trouverez une liste complète des éducateurs disponibles pour
        vous accompagner dans vos besoins. Que ce soit pour du soutien, des
        conseils ou un suivi personnalisé, chaque éducateur propose des
        compétences spécifiques pour vous aider à atteindre vos objectifs.
        N'hésitez pas à explorer les profils pour découvrir leurs domaines
        d'expertise et à les contacter pour toute question !
      </Typography>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        sx={{ width: "100%", maxWidth: "1200px" }}
      >
        {users.length > 0 ? (
          users.map((user, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  backgroundColor: "#FCFEF7",
                  borderRadius: "15px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  padding: "15px",
                  textAlign: "center",
                  marginBottom: "150px",
                  cursor: "pointer",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: "#333" }}
                  >
                    {user.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {user.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {user.codepostal}
                  </Typography>
                  <Box
                    component="img"
                    src={user.image || "https://via.placeholder.com/150"}
                    alt={user.name}
                    sx={{
                      width: "120px",
                      height: "120px",
                      margin: "15px auto",
                      borderRadius: "50%",
                    }}
                  />
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#847774", color: "#fff" }}
                    onClick={() => handleOpenUserDetail(user.uid)}
                  >
                    Détail
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography
            align="center"
            sx={{ color: "#FFFFFF", fontSize: "1.2rem" }}
          >
            Aucun utilisateur pro trouvé.
          </Typography>
        )}
      </Grid>
      <Header />
    </Box>
  );
}
