"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { auth, database, storage } from "../lib/firebase"; // adapte le chemin si besoin
import { ref as dbRef, get } from "firebase/database";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import {
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const theme = createTheme({
  palette: {
    primary: { main: "#847774" },
    secondary: { main: "#FCFEF7" },
  },
  typography: {
    h3: { fontSize: "2rem", fontWeight: "bold" },
  },
});

export default function ResponsiveAppBar() {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState(null);
  const [role, setRole] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // Charge le rôle et l'image à l'authentification
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Récupère le rôle depuis Realtime DB
    get(dbRef(database, `users/${user.uid}/role`))
      .then((snap) => {
        if (snap.exists()) setRole(snap.val());
      })
      .catch(() => setRole(null));

    // Récupère l'URL de l'image depuis Storage
    const imgRef = storageRef(storage, `images/${user.uid}/profile.jpg`);
    getDownloadURL(imgRef)
      .then((url) => setProfileImage(url))
      .catch(() => setProfileImage(null));
  }, []);

  // Ouvre / ferme menu
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/connexion");
  };

  // Supprimer compte (avec demande mot de passe)
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Aucun utilisateur connecté.");

    const password = prompt(
      "Veuillez entrer votre mot de passe pour confirmer la suppression:"
    );
    if (!password) return alert("Suppression annulée.");

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await get(dbRef(database, `users/${user.uid}`)).then((snap) => {
        if (snap.exists()) {
          return dbRef(database, `users/${user.uid}`);
        } else {
          throw new Error("Utilisateur introuvable en base.");
        }
      });
      // Suppression en base
      await dbRef(database, `users/${user.uid}`).remove();
      // Suppression compte Firebase Auth
      await deleteUser(user);
      await signOut(auth);
      router.push("/connexion");
      alert("Compte supprimé avec succès !");
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  };

  // Menu items selon rôle
  const menuItems = [
    { label: "Accueil", path: role === "pro" ? "/porfilepro" : "/accueil" },
    { label: "Mon profil", path: "/profil" },
    { label: "Messages", path: "/message" },
    { label: "Mes rendez-vous", path: "/rdvuser", visible: role === "user" },
  ];

  // Navigation
  const handleNavigate = (path) => {
    router.push(path);
    handleMenuClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="static"
        sx={{ backgroundColor: theme.palette.primary.main }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "around", // centre horizontalement le groupe de boutons
          }}
        >
          {/* Logo */}
          <Box
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() =>
              router.push(role === "pro" ? "/porfilepro" : "/accueil")
            }
          >
            <img src="/images/blob.png" alt="Logo" style={{ height: 60 }} />
          </Box>

          {/* Boutons de menu */}
          <box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center", // centre horizontalement le groupe de boutons
              alignItems: "around",
            }}
          >
            {" "}
            {menuItems.map(
              (item, i) =>
                (item.visible === undefined || item.visible) && (
                  <Button
                    key={i}
                    color="secondary"
                    onClick={() => handleNavigate(item.path)}
                    sx={{ textTransform: "none", mx: 1, fontWeight: 600 }}
                  >
                    {item.label}
                  </Button>
                )
            )}
          </box>

          {/* Déconnexion */}
          <Button
            color="secondary"
            onClick={handleLogout}
            sx={{ textTransform: "none", mx: 1, fontWeight: 600 }}
          >
            Déconnexion
          </Button>

          {/* Supprimer compte */}
          <Button
            color="secondary"
            onClick={handleDeleteAccount}
            sx={{ textTransform: "none", mx: 1, fontWeight: 600 }}
          >
            Supprimer mon compte
          </Button>

          {/* Avatar */}
          <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
            <Avatar
              src={profileImage || undefined}
              alt="Avatar"
              sx={{ width: 56, height: 56 }}
            />
          </IconButton>

          {/* Menu déroulant */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() =>
                handleNavigate(role === "pro" ? "/porfilepro" : "/profil")
              }
            >
              Mon profil
            </MenuItem>
            <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
