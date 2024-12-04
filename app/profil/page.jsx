"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Card } from "@mui/material";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { auth, database } from "../../lib/firebase";
import { ref, update, get } from "firebase/database";
import { updatePassword, onAuthStateChanged } from "firebase/auth";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FCFEF7",
    },
    secondary: {
      main: "#847774",
    },
  },
});

export default function Cardprofil() {
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserProfile(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setName(userData.name || "");
        setEmail(userData.email || "");
        setRole(userData.role || "user");
        setDescription(userData.description || "");
        setExperience(userData.experience || "");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du profil :",
        error.message
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setConfirmationMessage("");

    if (!currentUser) {
      setErrorMessage("Erreur : Aucun utilisateur connecté.");
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const userRef = ref(database, `users/${currentUser.uid}`);
      await update(userRef, {
        name,
        email,
        description,
        experience: role === "pro" ? experience : "",
      });

      if (password) {
        await updatePassword(currentUser, password);
        setConfirmationMessage(
          "Le mot de passe a été mis à jour avec succès !"
        );
      } else {
        setConfirmationMessage(
          "Les informations ont été mises à jour avec succès !"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error.message);
      setErrorMessage("Erreur : " + error.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <Card sx={{ maxWidth: 600, backgroundColor: "primary.main" }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{ color: theme.palette.secondary.main }}
            >
              Informations du profil
            </Typography>
            {confirmationMessage && (
              <Typography variant="body1" sx={{ color: "green", mt: 2 }}>
                {confirmationMessage}
              </Typography>
            )}
            {errorMessage && (
              <Typography variant="body1" sx={{ color: "red", mt: 2 }}>
                {errorMessage}
              </Typography>
            )}
          </CardContent>
          <CardActions>
            {currentUser ? (
              <Box
                component="form"
                noValidate
                sx={{ mt: 1 }}
                onSubmit={handleSubmit}
              >
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Nom"
                  autoComplete="name"
                  variant="standard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  autoComplete="email"
                  variant="standard"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {role === "pro" && (
                  <TextField
                    fullWidth
                    id="experience"
                    label="Expérience"
                    autoComplete="experience"
                    variant="standard"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                )}

                <TextField
                  fullWidth
                  id="description"
                  label="Description"
                  autoComplete="description"
                  variant="standard"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <TextField
                  fullWidth
                  id="password"
                  label="Nouveau mot de passe"
                  type="password"
                  variant="standard"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                  fullWidth
                  id="confirmPassword"
                  label="Confirmez le mot de passe"
                  type="password"
                  variant="standard"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, backgroundColor: "secondary.main" }}
                >
                  Enregistrer
                </Button>
              </Box>
            ) : (
              <Typography variant="body1" sx={{ color: "red" }}>
                Veuillez vous connecter pour accéder à votre profil.
              </Typography>
            )}
          </CardActions>
        </Card>
      </div>
    </ThemeProvider>
  );
}
