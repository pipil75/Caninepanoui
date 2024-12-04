"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ResponsiveAppBar from "../navbar";
import { ref, get } from "firebase/database";
import { database } from "../../lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Importer l'authentification Firebase
import CookieAccepter from "../component/cookie/page";
import Header from "../../header";
export default function MultiActionAreaCard() {
  const [loading, setLoading] = useState(true); // Pour le chargement initial
  const [users, setUsers] = useState([]); // Pour stocker les utilisateurs
  const [authLoading, setAuthLoading] = useState(true); // Pour vérifier l'état de l'authentification
  const router = useRouter();
  const auth = getAuth();

  // Vérification de l'authentification de l'utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Si l'utilisateur n'est pas connecté, on le redirige vers la page 404
        router.push("/");
      } else {
        // L'utilisateur est connecté, on peut charger les données
        setAuthLoading(false); // L'authentification est vérifiée
      }
    });

    return () => unsubscribe(); // Nettoyage lors du démontage du composant
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
              id, // Ajouter l'ID de l'utilisateur
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
    <div>
      <ResponsiveAppBar /> {/* Barre de navigation si nécessaire */}
      <CookieAccepter />
      <h1>Educateur canin</h1>
      <Card
        sx={{
          maxWidth: "100vw",
          flexDirection: "row",
        }}
      >
        <CardContent>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              margin: "10px",
            }}
          >
            {users.length > 0 ? (
              users.map((user, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ccc",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <h3>Nom : {user.name}</h3>
                  <p>Email : {user.email}</p>
                  <p>SIRET : {user.siret || "Non fourni"}</p>
                  <img
                    src={user.image || "https://via.placeholder.com/150"}
                    alt={user.name}
                    width="150"
                  />
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleOpenUserDetail(user.uid)}
                    >
                      Détail
                    </Button>
                  </CardActions>
                </div>
              ))
            ) : (
              <p>Aucun utilisateur pro trouvé.</p>
            )}
          </Typography>
        </CardContent>
      </Card>
      <div>
        <Header />
      </div>
    </div>
  );
}
