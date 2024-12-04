"use client";
import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, database } from "../../lib/firebase";
import { ref, get } from "firebase/database";
import Image from "next/image";
import Link from "next/link";

import "../global.css";

const theme = createTheme({
  palette: {
    primary: { main: "#FCFEF7" },
    secondary: { main: "#72B07E" },
  },
  typography: { h3: { fontSize: "2.5rem", fontWeight: "bold" } },
});

export default function MediaCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérification si l'utilisateur est déjà connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;

        // Récupération du rôle de l'utilisateur connecté
        const userRoleRef = ref(database, `users/${userId}/role`);
        const snapshot = await get(userRoleRef);

        if (snapshot.exists()) {
          const role = snapshot.val();
          router.push(role === "pro" ? "/porfilepro" : "/accueil");
          // Affiche la popup si l'utilisateur est connecté
        } else {
          setError("Rôle de l'utilisateur introuvable.");
        }
      }
      setLoading(false); // Arrêter le chargement après vérification
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, [auth, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Vérifiez le rôle de l'utilisateur
      const userRoleRef = ref(database, `users/${userId}/role`);
      const snapshot = await get(userRoleRef);

      if (snapshot.exists()) {
        const role = snapshot.val();
        router.push(role === "pro" ? "/porfilepro" : "/accueil");
      } else {
        throw new Error("Rôle de l'utilisateur non trouvé");
      }
    } catch (error) {
      setError("Erreur d'authentification. Vérifiez vos identifiants.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Typography variant="h5">Chargement...</Typography>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <Image
          alt="logo chien"
          width={300}
          height={300}
          src="/images/blob.png"
        />
        <Card sx={{ maxWidth: 600, backgroundColor: "primary.main" }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{ color: theme.palette.secondary.main }}
            >
              Connectez-vous
            </Typography>
          </CardContent>
          <CardActions>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                required
                fullWidth
                id="email"
                label="Adresse e-mail"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                variant="standard"
                margin="normal"
              />
              <TextField
                required
                fullWidth
                id="password"
                label="Mot de passe"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                variant="standard"
                margin="normal"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  mb: 1,
                  backgroundColor: "secondary.main",
                }}
                disabled={loading}
              >
                {loading ? "Connexion..." : "Connexion"}
              </Button>
              {error && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </Box>
          </CardActions>
          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            <Link href="./inscription" passHref>
              Si vous n'avez pas de compte ? Créez-en un
            </Link>
          </Typography>
        </Card>
      </div>
    </ThemeProvider>
  );
}
