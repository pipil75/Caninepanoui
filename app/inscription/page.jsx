"use client";
import * as React from "react";
import {
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../../lib/firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import styles from "../connexion/Connexion.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";

const theme = createTheme({
  palette: {
    primary: { main: "#FCFEF7", contrastText: "#000000" },
    secondary: { main: "#72B07E", contrastText: "#FFFFFF" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
  },
});

const MediaInscription = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [siret, setSiret] = useState("");
  const [image, setImage] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [adresse, setAdressse] = useState("");
  const [codepostal, setCodepostal] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();
  const storage = getStorage();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Veuillez fournir une adresse e-mail valide.");
      return;
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      setError(
        "Mot de passe faible. Il doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."
      );
      return;
    }

    if (role === "pro" && !/^\d{14}$/.test(siret)) {
      setError("Le numéro SIRET doit contenir exactement 14 chiffres.");
      return;
    }

    if (!acceptedTerms) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      let imageUrl = "";
      if (image) {
        const imageRef = storageRef(
          storage,
          `images/${user.uid}/${Date.now()}_${image.name}`
        );
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      } else {
        setError("Veuillez sélectionner une image.");
        setIsLoading(false);
        return;
      }

      const useRef = ref(database, `users/${user.uid}`);
      await set(useRef, {
        adresse,
        codepostal,
        email,
        image: imageUrl,
        name,
        role,
        siret: role === "pro" ? siret : "",
        uid: user.uid,
        acceptedTerms: true,
      });

      await sendEmailVerification(user);
      setConfirmationMessage("Inscription réussie ! Vérifiez votre e-mail.");

      // Réinitialise le formulaire
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setRole("user");
      setSiret("");
      setImage(null);
      setError(null);
      setAdressse("");
      setCodepostal("");
      setAcceptedTerms(false);
      setImagePreview(null);

      setTimeout(() => router.push("/connexion"), 3000);
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("Cet e-mail est déjà utilisé.");
          break;
        case "auth/weak-password":
          setError("Mot de passe trop faible.");
          break;
        default:
          setError("Erreur : " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setError("Aucune image sélectionnée.");
      return;
    }

    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Seules les images JPEG, PNG ou WebP sont acceptées.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop grande (max 5MB).");
      return;
    }

    setError("");
    setImage(file);

    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target.result);
    reader.onerror = () => setError("Erreur lors de la lecture du fichier.");
    reader.readAsDataURL(file);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.container}>
        <Link href="/">
          <Image
            alt="logo chien"
            width={350}
            height={350}
            src="/images/blob.png"
            style={{ marginBottom: "1rem" }}
          />
        </Link>
        <Card
          sx={{
            maxWidth: 600,
            backgroundColor: "#ffffff",
            boxShadow: 3,
            borderRadius: 2,
            p: 5,
          }}
        >
          <Typography variant="h4" fontWeight={700} align="center" gutterBottom>
            Créez votre compte
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Rejoignez notre communauté 🐾
          </Typography>

          {error && (
            <Typography sx={{ color: "error.main", mb: 2 }}>{error}</Typography>
          )}
          {confirmationMessage && (
            <Typography sx={{ color: "success.main", mb: 2 }}>
              {confirmationMessage}
            </Typography>
          )}

          <CardActions>
            <Box
              component="form"
              onSubmit={handleRegister}
              noValidate
              sx={{
                width: "100%",
                maxWidth: 420,
                margin: "0 auto",
                padding: 2,
              }}
            >
              {/* Section Infos personnelles */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Informations personnelles
              </Typography>
              <TextField
                sx={{ mt: 2, mb: 2 }}
                value={name}
                required
                fullWidth
                label="Nom"
                variant="standard"
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                sx={{ mb: 2 }}
                value={adresse}
                required
                fullWidth
                label="Adresse"
                variant="standard"
                onChange={(e) => setAdressse(e.target.value)}
              />
              <TextField
                sx={{ mb: 2 }}
                value={codepostal}
                required
                fullWidth
                label="Code postal"
                variant="standard"
                onChange={(e) => setCodepostal(e.target.value)}
              />

              {/* Section Infos connexion */}
              <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
                Informations de connexion
              </Typography>
              <TextField
                sx={{ mb: 2 }}
                value={email}
                required
                fullWidth
                label="Adresse e-mail"
                type="email"
                variant="standard"
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                sx={{ mb: 2 }}
                value={password}
                required
                fullWidth
                label="Mot de passe"
                type="password"
                variant="standard"
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                sx={{ mb: 2 }}
                value={confirmPassword}
                required
                fullWidth
                label="Confirmer le mot de passe"
                type="password"
                variant="standard"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Select
                sx={{ mb: 2 }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                variant="standard"
                fullWidth
              >
                <MenuItem value="user">Utilisateur</MenuItem>
                <MenuItem value="pro">Professionnel</MenuItem>
              </Select>
              {role === "pro" && (
                <TextField
                  sx={{ mb: 2 }}
                  value={siret}
                  required
                  fullWidth
                  label="Numéro SIRET"
                  variant="standard"
                  onChange={(e) => setSiret(e.target.value)}
                />
              )}

              {/* Image upload */}
              <Box sx={{ mt: 3, mb: 2 }}>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <Box mt={2}>
                    <Typography variant="body2">Aperçu de l'image :</Typography>
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Acceptation des conditions */}
              <Box
                display="flex"
                alignItems="center"
                sx={{ mt: 2, mb: 3, fontSize: "14px" }}
              >
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  id="terms"
                  style={{ marginRight: 8 }}
                />
                <label htmlFor="terms">
                  J'accepte les{" "}
                  <Link href="/conditions" legacyBehavior>
                    <a style={{ color: "#72B07E" }}>conditions d'utilisation</a>
                  </Link>
                  .
                </label>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 1 }}
              >
                {isLoading ? "Inscription en cours..." : "S'inscrire"}
              </Button>
            </Box>
          </CardActions>
        </Card>
      </div>
    </ThemeProvider>
  );
};

export default MediaInscription;
