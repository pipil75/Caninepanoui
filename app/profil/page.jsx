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
      // On pointe vers le fichier précis dans le sous-dossier uid
      const imgRef = storageRef(storage, `images/${uid}/profile.jpg`);
      const url = await getDownloadURL(imgRef);
      setProfileImage(url);
    } catch (error) {
      console.log("Pas d'image de profil trouvée.");
      setProfileImage(""); // reset si pas d'image
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

      // Met à jour uniquement experience et prix si role === "pro"
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
        // Upload dans images/{uid}/profile.jpg
        const imgRef = storageRef(storage, `images/${uid}/profile.jpg`);
        await uploadBytes(imgRef, imageFile);
        const url = await getDownloadURL(imgRef);
        setProfileImage(url + "?t=" + new Date().getTime()); // cache busting
      }

      setConfirmationMessage("Profil mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur mise à jour profil :", err.message);
      setErrorMessage("Erreur : " + err.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveAppBar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: "64px",
          boxSizing: "border-box",
          minHeight: "calc(100vh - -45px)",
        }}
      >
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
            {profileImage && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <img
                  src={profileImage}
                  alt="Profil"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
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
                sx={{ mt: 1 }}
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
      </Box>
      <Box sx={{ width: "100%", mt: 4 }}>
        <Header />
      </Box>
    </ThemeProvider>
  );
}
