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
  ThemeProvider,
  createTheme,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { auth, database, storage } from "../lib/firebase";
import { ref as dbRef, get, update as dbUpdate } from "firebase/database"; // ⬅️ update importé
import {
  ref as storageRef,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage"; // ⬅️ pour vider le dossier image (optionnel)
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
  typography: { button: { textTransform: "none", fontWeight: 700 } },
});

export default function ResponsiveAppBar() {
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [avatarMenuEl, setAvatarMenuEl] = useState(null);
  const [mobileMenuEl, setMobileMenuEl] = useState(null);

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

  const handleNavigate = (path) => {
    router.push(path);
    setAvatarMenuEl(null);
    setMobileMenuEl(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/connexion");
  };

  // ⬇️ ⬇️ SUPPRESSION TOTALE : DB + Storage (optionnel) + Auth
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Aucun utilisateur connecté.");

    const password = prompt("Entrez votre mot de passe pour confirmer :");
    if (!password) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      const uid = user.uid;

      // 1) Supprimer les données dans la Realtime DB (multi-path update à null)
      const updates = {};
      updates[`users/${uid}`] = null; // profil + sous-noeuds (appointments, etc.)
      updates[`users/user/${uid}`] = null; // conversations côté "user"
      updates[`users/pro/${uid}`] = null; // conversations côté "pro"
      await dbUpdate(dbRef(database), updates);

      // 2) (Optionnel) Vider le dossier images/{uid} dans Storage
      try {
        const folderRef = storageRef(storage, `images/${uid}`);
        const res = await listAll(folderRef);
        await Promise.all(res.items.map((it) => deleteObject(it)));
      } catch (e) {
        // Non bloquant si l'utilisateur n'a pas d'images
        console.warn("Nettoyage Storage ignoré :", e?.message || e);
      }

      // 3) Supprimer le compte Auth
      await deleteUser(user);

      // 4) Déconnexion + redirection
      await signOut(auth);
      router.push("/connexion");
      alert("Compte et données supprimés.");
    } catch (e) {
      alert("Erreur : " + e.message);
    }
  };
  // ⬆️ ⬆️

  const menuItems = [
    { label: "Accueil", path: role === "pro" ? "/porfilepro" : "/accueil" },
    { label: "Mon profil", path: "/profil" },
    { label: "Messages", path: "/message" },
    { label: "Mes rendez-vous", path: "/rdvuser", visible: role === "user" },
  ];

  const linkSx = {
    color: "secondary.main",
    fontWeight: 700,
    fontSize: { xs: "0.95rem", md: "1rem" },
    "&:hover": { opacity: 0.9, bgcolor: "transparent" },
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" sx={{ bgcolor: "primary.main" }}>
        <Container maxWidth="lg" disableGutters>
          <Toolbar
            sx={{
              minHeight: { xs: 56, md: 60 },
              px: { xs: 1.25, md: 2.5 },
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
            }}
          >
            {/* Groupe gauche : hamburger + logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <IconButton
                aria-label="menu"
                onClick={(e) => setMobileMenuEl(e.currentTarget)}
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  color: "secondary.main",
                }}
              >
                <MenuIcon />
              </IconButton>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() =>
                  handleNavigate(role === "pro" ? "/porfilepro" : "/accueil")
                }
              >
                <img src="/images/blob.png" alt="Logo" style={{ height: 34 }} />
              </Box>
            </Box>

            {/* Centre (desktop) */}
            <Box
              sx={{
                flex: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "space-around",
                alignItems: "center",
                mx: 2,
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

            {/* Spacer mobile */}
            <Box sx={{ flexGrow: 1, display: { xs: "block", md: "none" } }} />

            {/* Avatar */}
            <IconButton
              onClick={(e) => setAvatarMenuEl(e.currentTarget)}
              sx={{ ml: 0.5 }}
            >
              <Avatar
                src={profileImage || undefined}
                alt="Avatar"
                sx={{ width: 34, height: 34 }}
              />
            </IconButton>

            {/* Menu avatar */}
            <Menu
              anchorEl={avatarMenuEl}
              open={Boolean(avatarMenuEl)}
              onClose={() => setAvatarMenuEl(null)}
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

            {/* Menu mobile */}
            <Menu
              anchorEl={mobileMenuEl}
              open={Boolean(mobileMenuEl)}
              onClose={() => setMobileMenuEl(null)}
              PaperProps={{ sx: { minWidth: 230 } }}
            >
              {menuItems.map(
                (item, i) =>
                  (item.visible === undefined || item.visible) && (
                    <MenuItem key={i} onClick={() => handleNavigate(item.path)}>
                      {item.label}
                    </MenuItem>
                  )
              )}
              <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
              <MenuItem onClick={handleDeleteAccount}>
                Supprimer mon compte
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}
