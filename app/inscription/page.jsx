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
} from "firebase/storage";
import styles from "../connexion/Connexion.module.css";
import { useRouter } from "next/navigation";
const theme = createTheme({
  palette: {
    primary: {
      main: "#FCFEF7", // Couleur principale avec bon contraste
      contrastText: "#000000", // Texte foncé pour un meilleur contraste
    },
    secondary: {
      main: "#72B07E", // Couleur secondaire
      contrastText: "#FFFFFF", // Texte clair pour bon contraste
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Désactiver les majuscules par défaut
          fontWeight: 600, // Rendre le texte plus lisible
        },
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
  const auth = getAuth();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation des mots de passe
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Veuillez fournir une adresse e-mail valide.");
      return;
    }

    // Validation du SIRET si "pro"
    if (role === "pro" && !/^\d{14}$/.test(siret)) {
      setError("Le numéro SIRET doit contenir exactement 14 chiffres.");
      return;
    }

    try {
      setIsLoading(true); // Démarre le chargement

      // Création de l'utilisateur Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      // Téléchargement de l'image si elle existe
      // Téléchargement de l'image si elle existe
      let imageUrl = "";
      if (image) {
        try {
          const imageRef = storageRef(
            storage,
            `images/${userCredential.user.uid}/${image.name}`
          );
          await uploadBytes(imageRef, image);
          imageUrl = await getDownloadURL(imageRef);
        } catch (error) {
          setError(
            "Erreur lors du téléchargement de l'image : " + error.message
          );
          return; // Stoppe l'inscription si l'upload échoue
        }
      }

      // Sauvegarde des données utilisateur dans Firebase Database
      const useRef = ref(database, `users/${userCredential.user.uid}`);
      await set(useRef, {
        adresse: adresse,
        codepostal: codepostal,
        email: email,
        image: imageUrl,
        name: name,
        role: role,
        siret: role === "pro" ? siret : "",
        uid: userCredential.user.uid,
      });

      // Envoi de l'email de vérification
      await sendEmailVerification(userCredential.user);
      setConfirmationMessage(
        "Inscription réussie ! Un e-mail de vérification a été envoyé."
      );

      // Réinitialisation des champs
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
      console.log("Redirection vers /connexion");
      router.push("/connexion");
    } catch (error) {
      // Gestion des erreurs Firebase
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("Cet e-mail est déjà utilisé.");
          break;
        case "auth/weak-password":
          setError(
            "Le mot de passe est trop faible. Utilisez au moins 6 caractères."
          );
          break;
        default:
          setError("Une erreur est survenue : " + error.message);
      }
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]; // Formats d'image légers autorisés

    if (file) {
      // Vérifier le type de fichier
      if (!allowedTypes.includes(file.type)) {
        setError("Seules les images JPEG, PNG ou WebP sont acceptées.");
        return;
      }

      // Vérifier la taille du fichier
      if (file.size > 5 * 1024 * 1024) {
        // 5 MB max
        setError("La taille de l'image ne doit pas dépasser 5 MB.");
        return;
      }

      // Si tout est valide, continuez le traitement
      setError(""); // Effacer les erreurs précédentes

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result); // Afficher l'aperçu de l'image
      };

      reader.onerror = (error) => {
        setError("Erreur lors de la lecture du fichier.");
      };

      reader.readAsDataURL(file);
    } else {
      setError("Aucun fichier sélectionné.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.container}>
        <Image
          component="img"
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
              <div>
                <TextField
                  value={name}
                  required
                  fullWidth
                  id="displayName"
                  label="Nom"
                  name="nom"
                  autoComplete="name"
                  variant="standard"
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  value={adresse}
                  required
                  fullWidth
                  id="adresse"
                  label="Adresse"
                  name="adresse"
                  autoComplete="adresse"
                  variant="standard"
                  onChange={(e) => setAdressse(e.target.value)}
                />
                <TextField
                  value={codepostal}
                  required
                  fullWidth
                  id="codepostal"
                  label="Code postal"
                  name="code postal"
                  autoComplete="code postal"
                  variant="standard"
                  onChange={(e) => setCodepostal(e.target.value)}
                />
                <TextField
                  value={email}
                  required
                  fullWidth
                  id="email"
                  label=" entrée une Adresse e-mail paypal pro pour les professionels "
                  name="email"
                  autoComplete="email"
                  variant="standard"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!emailRegex.test(e.target.value)) {
                      setError("Adresse e-mail invalide.");
                    } else {
                      setError(null);
                    }
                  }}
                />
                <TextField
                  value={password}
                  required
                  fullWidth
                  id="password"
                  label="Mot de passe"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  variant="standard"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                  value={confirmPassword}
                  required
                  fullWidth
                  id="confirmPassword"
                  label="Confirmez le mot de passe"
                  name="confirmPassword"
                  type="password"
                  autoComplete="current-password"
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
                    id="siret"
                    label="Numéro SIRET"
                    name="siret"
                    autoComplete="siret"
                    variant="standard"
                    onChange={(e) => setSiret(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp" // Restreint les types de fichiers
                  onChange={handleImageChange}
                />
                ;
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ mt: 2, mb: 1, backgroundColor: "secondary.main" }}
                >
                  {isLoading ? "Chargement..." : "S'inscrire"}
                </Button>
              </div>
            </Box>
          </CardActions>
        </Card>
      </div>
    </ThemeProvider>
  );
};

export default MediaInscription;
