"use client";
import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { createTheme, ThemeProvider } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database, storage } from "../../lib/firebase";
import { Select, MenuItem } from "@mui/material";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import styles from "../connexion/Connexion.module.css";
import { useRouter } from "next/navigation";

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
  const [image, setImage] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [adresse, setAdressse] = useState("");
  const [codepostal, setCodepostal] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // ✅
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
        acceptedTerms: true, // ✅ Enregistre le consentement
      });

      await sendEmailVerification(user);
      setConfirmationMessage("Inscription réussie ! Vérifiez votre e-mail.");

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
        <Image
          alt="logo chien"
          width={300}
          height={300}
          src="/images/blob.png"
        />

        <Card sx={{ maxWidth: 600, backgroundColor: "primary.main" }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Bienvenue !
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Créez votre compte pour rejoindre notre communauté 🐾
          </Typography>
          <CardContent>
            <Typography
              variant="h3"
              sx={{ color: theme.palette.secondary.main }}
            >
              Inscription
            </Typography>
            {error && (
              <Typography sx={{ color: "error.main" }}>{error}</Typography>
            )}
            {confirmationMessage && (
              <Typography sx={{ color: "success.main" }}>
                {confirmationMessage}
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Box
              component="form"
              onSubmit={handleRegister}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                value={name}
                required
                fullWidth
                label="Nom"
                variant="standard"
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                value={adresse}
                required
                fullWidth
                label="Adresse"
                variant="standard"
                onChange={(e) => setAdressse(e.target.value)}
              />
              <TextField
                value={codepostal}
                required
                fullWidth
                label="Code postal"
                variant="standard"
                onChange={(e) => setCodepostal(e.target.value)}
              />
              <TextField
                value={email}
                required
                fullWidth
                label="Adresse e-mail"
                type="email"
                variant="standard"
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                value={password}
                required
                fullWidth
                label="Mot de passe"
                type="password"
                variant="standard"
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                value={confirmPassword}
                required
                fullWidth
                label="Confirmer le mot de passe"
                type="password"
                variant="standard"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                variant="standard"
                fullWidth
                sx={{ mt: 2 }}
              >
                <MenuItem value="user">Utilisateur</MenuItem>
                <MenuItem value="pro">Professionnel</MenuItem>
              </Select>
              {role === "pro" && (
                <TextField
                  value={siret}
                  required
                  fullWidth
                  label="Numéro SIRET"
                  variant="standard"
                  onChange={(e) => setSiret(e.target.value)}
                  sx={{ mt: 2 }}
                />
              )}
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                style={{ marginTop: "1rem" }}
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
              <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  id="terms"
                />
                <label
                  htmlFor="terms"
                  style={{ marginLeft: "8px", fontSize: "14px" }}
                >
                  J'accepte les{" "}
                  <a
                    href="/conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    conditions d'utilisation
                  </a>
                </label>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{ mt: 2, mb: 1, backgroundColor: "secondary.main" }}
              >
                {isLoading ? "Chargement..." : "S'inscrire"}
              </Button>
            </Box>
          </CardActions>
        </Card>
      </div>
    </ThemeProvider>
  );
};

export default MediaInscription;
