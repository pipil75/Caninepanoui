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
        backgroundColor: "#6F6561", // Couleur de fond derrière les cartes
        minHeight: "100vh", // Prend toute la hauteur de l'écran
        padding: "65px",
        display: "flex", // Utilisation de flexbox pour organiser le contenu
        flexDirection: "column", // Aligner les éléments en colonne
        justifyContent: "space-between", // Laisser de l'espace entre les sections
      }}
    >
      {/* Barre de navigation */}
      <ResponsiveAppBar />
      <CookieAccepter />

      {/* Titre principal */}
      <Typography
        variant="h3"
        align="center"
        sx={{
          color: "#FFFFFF", // Texte en blanc pour le contraste
          fontWeight: "bold",
          fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.3rem" }, // Plus petit sur mobile
          lineHeight: 1.4, // Réduction de l'espacement entre les lignes
          maxWidth: "80%", // Réduire la largeur pour que le texte ne prenne pas toute la largeur de l'écran
          margin: "0 auto", // Centrer le texte
          paddingX: 2, // Ajout d'un peu de padding horizontal pour éviter le texte trop collé aux bords
        }}
      >
        <h3>
          Bienvenue sur notre plateforme ! Ici, vous trouverez une liste
          complète des éducateurs disponibles pour vous accompagner dans vos
          besoins. Que ce soit pour du soutien, des conseils ou un suivi
          personnalisé, chaque éducateur propose des compétences spécifiques
          pour vous aider à atteindre vos objectifs. N'hésitez pas à explorer
          les profils pour découvrir leurs domaines d'expertise et à les
          contacter pour toute question !
        </h3>
      </Typography>

      {/* Conteneur des cartes */}
      <Grid
        marginBottom={10}
        marginTop={4}
        container
        spacing={2} // Ajusté pour moins d'espace entre les cartes
        justifyContent="center"
        sx={{ flexWrap: "wrap" }} // Permet de gérer les cartes qui se replient bien sur les petits écrans
      >
        {users.length > 0 ? (
          users.map((user, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  backgroundColor: "#FCFEF7", // Couleur de fond des cartes
                  borderRadius: "12px",
                  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)", // Effet d'ombre
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0px 12px 25px rgba(0, 0, 0, 0.2)",
                  },
                  padding: "16px",
                  maxWidth: "100%",
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: "#333333" }} // Texte sombre pour un bon contraste
                  >
                    Nom : {user.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555555" }}>
                    Email : {user.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555555" }}>
                    SIRET : {user.siret || "Non fourni"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555555" }}>
                    adresse: {user.codepostal || "Non fourni"}
                  </Typography>
                  <Box
                    component="img"
                    src={user.image || "https://via.placeholder.com/150"}
                    alt={user.name}
                    sx={{
                      width: "150px",
                      height: "150px",
                      margin: "20px auto",
                      borderRadius: "8px",
                    }}
                  />
                </CardContent>
                {/* Bouton Détail */}
                <CardActions sx={{ justifyContent: "center" }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: "#847774", // Couleur principale des boutons
                      color: "#FFFFFF",
                      "&:hover": {
                        backgroundColor: "#6F6561", // Légèrement plus sombre au survol
                      },
                    }}
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
