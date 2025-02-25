"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../../lib/firebase";
import { ref, get } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import styles from "../connexion/Connexion.module.css";

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
  const [loading, setLoading] = useState(false); // Par défaut, pas en chargement

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
      // Réinitialiser les champs après la tentative de connexion
      setEmail("");
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Typography
        variant="h5 small"
        align="center"
        sx={{
          color: "#6F6561", // Texte en blanc pour le contraste
          fontFamily: "arial",
          marginTop: 30,
          fontSize: "10px",
        }}
      >
        <h1>
          Vous êtes propriétaire d'un chien à la recherche d'un éducateur canin
          compétent ?<br /> Ou êtes-vous un éducateur canin souhaitant offrir
          vos services ? <br /> Ne cherchez plus !<br /> Notre plateforme est
          conçue pour mettre en relation les propriétaires de chiens avec des
          professionnels qualifiés.
        </h1>
      </Typography>
      <div className={styles.container}>
        <Image
          alt="logo chien"
          width={300}
          height={300}
          src="/images/blob.png"
        />

        <Card
          sx={{ maxWidth: 600, backgroundColor: theme.palette.primary.main }}
        >
          <CardContent>
            <Typography
              sx={{ color: theme.palette.secondary.main, fontSize: "30px" }}
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
                autoComplete="off" // Désactiver l'autocomplétion
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
                autoComplete="off" // Désactiver l'autocomplétion
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
                  backgroundColor: theme.palette.secondary.main,
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
