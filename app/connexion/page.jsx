"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, database } from "../../lib/firebase";
import { ref, get } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import styles from "../connexion/Connexion.module.css";

const theme = createTheme({
  palette: {
    primary: { main: "#FCFEF7" }, // fond clair
    secondary: { main: "#72B07E" }, // vert doux
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, fontSize: "2rem" },
    body1: { fontSize: "1rem", color: "#6F6561" },
  },
});

export default function MediaCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setResetEmailSent(false);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await user.reload();

      if (!user.emailVerified) {
        setError(
          "Veuillez vérifier votre adresse e-mail avant de vous connecter."
        );
        setLoading(false);
        return;
      }

      const roleRef = ref(database, `users/${user.uid}/role`);
      const snapshot = await get(roleRef);

      if (snapshot.exists()) {
        const role = snapshot.val();
        router.push(role === "pro" ? "/porfilepro" : "/accueil");
        setEmail("");
        setPassword("");
      } else {
        throw new Error("Rôle de l'utilisateur non trouvé");
      }
    } catch (error) {
      console.error("Firebase auth error:", error.code, error.message);
      setError(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setResetEmailSent(false);

    if (!email) {
      setError(
        "Veuillez entrer votre adresse e-mail pour réinitialiser le mot de passe."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (error) {
      console.error("Erreur de réinitialisation :", error);
      setError("Impossible d'envoyer l'e-mail de réinitialisation.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: theme.palette.primary.main,
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
        }}
      >
        {/* Colonne logo */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingRight: 6,
            "@media(max-width: 768px)": { display: "none" },
          }}
        >
          <Image
            src="/images/blob.png"
            alt="logo chien"
            width={350}
            height={350}
          />
        </Box>

        {/* Colonne formulaire */}
        <Card
          elevation={8}
          sx={{
            flex: 1,
            maxWidth: 450,
            borderRadius: 3,
            padding: 4,
            boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            backgroundColor: "#fff",
          }}
        >
          <CardContent>
            <Typography variant="h4" gutterBottom color="secondary">
              Connectez-vous
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Vous êtes propriétaire d'un chien à la recherche d'un éducateur
              canin compétent ? Ou êtes-vous un éducateur canin souhaitant
              offrir vos services ? Ne cherchez plus ! Notre plateforme est
              conçue pour mettre en relation les propriétaires de chiens avec
              des professionnels qualifiés.
            </Typography>

            <Box component="form" noValidate onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Adresse e-mail"
                margin="normal"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
                type="email"
              />

              <TextField
                fullWidth
                label="Mot de passe"
                margin="normal"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                required
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 1,
                }}
              >
                <Button
                  variant="text"
                  onClick={handlePasswordReset}
                  sx={{
                    color: theme.palette.secondary.main,
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  Mot de passe oublié ?
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  backgroundColor: theme.palette.secondary.main,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "#5a8d62",
                  },
                }}
              >
                {loading ? "Connexion..." : "Connexion"}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              )}

              {resetEmailSent && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  L'e-mail de réinitialisation a bien été envoyé à{" "}
                  <strong>{email}</strong>. Veuillez vérifier votre boîte de
                  réception.
                </Alert>
              )}

              <Typography
                variant="body2"
                sx={{
                  mt: 4,
                  textAlign: "center",
                  color: "#6F6561",
                }}
              >
                <Link href="./inscription" passHref legacyBehavior>
                  <a
                    style={{
                      color: theme.palette.secondary.main,
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.textDecoration = "underline")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.textDecoration = "none")
                    }
                  >
                    Si vous n'avez pas de compte ? Créez-en un
                  </a>
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
