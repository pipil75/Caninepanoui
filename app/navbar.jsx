"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { auth, database, storage } from "../lib/firebase";
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
    primary: { main: "#847774" }, // fond comme le footer
    secondary: { main: "#FCFEF7" }, // texte clair
  },
  typography: {
    button: { textTransform: "none", fontWeight: 700 },
  },
});

export default function ResponsiveAppBar() {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState(null);
  const [role, setRole] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    get(dbRef(database, `users/${user.uid}/role`))
      .then((snap) => snap.exists() && setRole(snap.val()))
      .catch(() => setRole(null));

    const imgRef = storageRef(storage, `images/${user.uid}/profile.jpg`);
    getDownloadURL(imgRef)
      .then((url) => setProfileImage(url))
      .catch(() => setProfileImage(null));
  }, []);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNavigate = (path) => {
    router.push(path);
    handleMenuClose();
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/connexion");
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Aucun utilisateur connecté.");
    const password = prompt("Entrez votre mot de passe pour confirmer :");
    if (!password) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      await signOut(auth);
      router.push("/connexion");
      alert("Compte supprimé.");
    } catch (e) {
      alert("Erreur : " + e.message);
    }
  };

  const menuItems = [
    { label: "Accueil", path: role === "pro" ? "/porfilepro" : "/accueil" },
    { label: "Mon profil", path: "/profil" },
    { label: "Messages", path: "/message" },
    { label: "Mes rendez-vous", path: "/rdvuser", visible: role === "user" },
  ];

  // Liens compacts (même typo que le footer)
  const linkSx = {
    color: "secondary.main",
    fontWeight: 700,
    fontSize: { xs: "0.9rem", md: "1rem" },
    "&:hover": { opacity: 0.9, bgcolor: "transparent" },
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" sx={{ bgcolor: "primary.main" }}>
        <Toolbar
          variant="dense"
          sx={{
            minHeight: 52,
            px: { xs: 1.5, md: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          {/* Logo à gauche (compact) */}
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() =>
              handleNavigate(role === "pro" ? "/porfilepro" : "/accueil")
            }
          >
            <img src="/images/blob.png" alt="Logo" style={{ height: 38 }} />
          </Box>

          {/* CENTRE : liens répartis en space-around */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "space-around", // <= ce que tu voulais
              alignItems: "center",
              mx: { xs: 1, md: 2 },
            }}
          >
            {menuItems.map(
              (item, i) =>
                (item.visible === undefined || item.visible) && (
                  <Button
                    key={i}
                    onClick={() => handleNavigate(item.path)}
                    sx={linkSx}
                    disableRipple
                  >
                    {item.label}
                  </Button>
                )
            )}
            <Button onClick={handleLogout} sx={linkSx} disableRipple>
              Déconnexion
            </Button>
            <Button onClick={handleDeleteAccount} sx={linkSx} disableRipple>
              Supprimer mon compte
            </Button>
          </Box>

          {/* Avatar à droite (compact) */}
          <IconButton onClick={handleMenuOpen} sx={{ ml: 0.5 }}>
            <Avatar
              src={profileImage || undefined}
              alt="Avatar"
              sx={{ width: 38, height: 38 }}
            />
          </IconButton>

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
