"use client";
import * as React from "react";
import {
  Box,
  TextField,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import { useState, useEffect } from "react";
import { auth, database, storage } from "../../lib/firebase";
import { ref as dbRef, get, update } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { updatePassword, onAuthStateChanged } from "firebase/auth";
import ResponsiveAppBar from "../navbar";
import Header from "../header";

const theme = createTheme({
  palette: {
    primary: { main: "#FCFEF7" },
    secondary: { main: "#847774" },
  },
});

export default function Cardprofil() {
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [experience, setExperience] = useState("");
  const [prix, setPrix] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserProfile(user.uid);
        fetchProfileImage(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const userRef = dbRef(database, `users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setName(data.name || "");
        setEmail(data.email || "");
        setRole(data.role || "user");
        setExperience(data.experience || "");
        setPrix(data.prix || "");
      }
    } catch (error) {
      console.error("Erreur récupération profil :", error.message);
    }
  };

  const fetchProfileImage = async (uid) => {
    try {
      const imgRef = storageRef(storage, `images/${uid}/profile.jpg`);
      const url = await getDownloadURL(imgRef);
      setProfileImage(url);
    } catch {
      setProfileImage("");
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
      const uid = currentUser.uid;
      const userRef = dbRef(database, `users/${uid}`);

      await update(userRef, {
        name,
        email,
        experience: role === "pro" ? experience : "",
        prix: role === "pro" ? prix : "",
      });

      if (password) {
        await updatePassword(currentUser, password);
      }

      if (imageFile) {
        const imgRef = storageRef(storage, `images/${uid}/profile.jpg`);
        await uploadBytes(imgRef, imageFile, {
          cacheControl: "public, max-age=0, must-revalidate",
        });
        const url = await getDownloadURL(imgRef);
        setProfileImage(
          `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`
        );
      }

      setConfirmationMessage("Profil mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur mise à jour profil :", err.message);
      setErrorMessage("Erreur : " + err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <CssBaseline />
      <ResponsiveAppBar />

      {/* Contenu principal : ajoute de l'espace sous la navbar */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          px: 2,
          mt: { xs: 6, sm: 8, md: 10 }, // <— espace entre navbar et la card
        }}
      >
        {/* Le thème personnalisé ne s'applique qu'à la carte, pas au Header */}
        <ThemeProvider theme={theme}>
          <Card
            sx={{
              maxWidth: 600,
              width: "100%",
              bgcolor: "primary.main",
              boxShadow: 4,
              borderRadius: 2,
            }}
          >
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

              {profileImage && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <img
                    src={profileImage}
                    alt="Profil"
                    style={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "cover",
                    }}
                  />
                </Box>
              )}
            </CardContent>

            <CardActions>
              {currentUser ? (
                <Box
                  component="form"
                  noValidate
                  sx={{ mt: 1, width: "100%", px: 2 }}
                  onSubmit={handleSubmit}
                >
                  <TextField
                    required
                    fullWidth
                    label="Nom"
                    variant="standard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    variant="standard"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {role === "pro" && (
                    <>
                      <TextField
                        fullWidth
                        label="Expérience"
                        variant="standard"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Prix prestation"
                        variant="standard"
                        value={prix}
                        onChange={(e) => setPrix(e.target.value)}
                      />
                    </>
                  )}

                  <TextField
                    fullWidth
                    label="Nouveau mot de passe"
                    type="password"
                    variant="standard"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Confirmez le mot de passe"
                    type="password"
                    variant="standard"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mt: 2, mb: 1 }}
                  >
                    Télécharger une nouvelle image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </Button>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2, bgcolor: "secondary.main" }}
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
        </ThemeProvider>
      </Box>

      {/* Footer (Header) — en dehors du ThemeProvider pour garder la même écriture partout */}
      <Box component="footer" sx={{ mt: "auto", width: "100%" }}>
        <Header />
      </Box>
    </Box>
  );
}
