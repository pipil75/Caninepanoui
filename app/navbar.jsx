"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import {
  ref as dbRef,
  get,
  update as dbUpdate,
  onValue,
} from "firebase/database";
import {
  ref as storageRef,
  getDownloadURL,
  listAll,
  deleteObject,
  getMetadata,
} from "firebase/storage";
import {
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const theme = createTheme({
  palette: { primary: { main: "#847774" }, secondary: { main: "#FCFEF7" } },
  typography: { button: { textTransform: "none", fontWeight: 700 } },
});

// Ajoute/remplace ?v=... pour casser le cache
function addV(url, v) {
  try {
    const u = new URL(url);
    u.searchParams.set("v", String(v || Date.now()));
    return u.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${encodeURIComponent(v || Date.now())}`;
  }
}

// Essaie en priorité la photo "profile/profil" du Storage, sinon l’URL stockée en DB
async function resolveAvatarUrl({ uid, dbUrlOrPath }) {
  const candidates = [
    `images/${uid}/profile.jpg`,
    `images/${uid}/profile.png`,
    `Images/${uid}/profile.jpg`,
    `Images/${uid}/profil.png`, // si tu as nommé "profil.png"
  ];

  // 1) Priorité : fichiers fixes dans le Storage
  for (const p of candidates) {
    try {
      const r = storageRef(storage, p);
      const [url, meta] = await Promise.all([
        getDownloadURL(r),
        getMetadata(r).catch(() => ({})),
      ]);
      const v = meta?.generation || meta?.updated || Date.now();
      return addV(url, v);
    } catch {
      // on tente le prochain
    }
  }

  // 2) Fallback : ce qui est en DB (URL complète)
  if (dbUrlOrPath && /^https?:\/\//i.test(dbUrlOrPath)) {
    return addV(dbUrlOrPath, Date.now());
  }

  // 3) Fallback : ce qui est en DB (chemin Storage)
  if (dbUrlOrPath && !/^https?:\/\//i.test(dbUrlOrPath)) {
    try {
      const r = storageRef(storage, dbUrlOrPath);
      const [url, meta] = await Promise.all([
        getDownloadURL(r),
        getMetadata(r).catch(() => ({})),
      ]);
      const v = meta?.generation || meta?.updated || Date.now();
      return addV(url, v);
    } catch {}
  }

  return ""; // pas d’avatar
}

export default function ResponsiveAppBar() {
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [dbImageVal, setDbImageVal] = useState(null); // valeur DB users/{uid}/image
  const [avatarMenuEl, setAvatarMenuEl] = useState(null);
  const [mobileMenuEl, setMobileMenuEl] = useState(null);

  // Recalcule et met à jour l’avatar
  const refreshAvatar = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    const url = await resolveAvatarUrl({
      uid: user.uid,
      dbUrlOrPath: dbImageVal,
    });
    setProfileImage(url || null);
  }, [dbImageVal]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Rôle (lecture simple)
    get(dbRef(database, `users/${user.uid}/role`))
      .then((snap) => snap.exists() && setRole(snap.val()))
      .catch(() => setRole(null));

    // Écoute en temps réel du champ image (URL ou chemin)
    const imgRef = dbRef(database, `users/${user.uid}/image`);
    const off = onValue(imgRef, (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setDbImageVal(val);
    });

    // Premier rendu : on force une résolution (avant même un event DB)
    refreshAvatar();

    // Rafraîchir quand l’onglet reprend le focus (utile si seul le Storage a changé)
    const onFocus = () => refreshAvatar();
    window.addEventListener("focus", onFocus);

    return () => {
      off();
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshAvatar]);

  // Met à jour l’avatar dès que la DB change
  useEffect(() => {
    refreshAvatar();
  }, [dbImageVal, refreshAvatar]);

  const handleNavigate = (path) => {
    router.push(path);
    setAvatarMenuEl(null);
    setMobileMenuEl(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/connexion");
  };

  // (facultatif) suppression DB + Storage + Auth
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Aucun utilisateur connecté.");
    const password = prompt("Entrez votre mot de passe pour confirmer :");
    if (!password) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      const uid = user.uid;

      // Supprimer branches DB
      const updates = {};
      updates[`users/${uid}`] = null;
      updates[`users/user/${uid}`] = null;
      updates[`users/pro/${uid}`] = null;
      await dbUpdate(dbRef(database), updates);

      // Nettoyer Storage (optionnel)
      try {
        const folderRef = storageRef(storage, `images/${uid}`);
        const res = await listAll(folderRef);
        await Promise.all(res.items.map((it) => deleteObject(it)));
      } catch {}

      await deleteUser(user);
      await signOut(auth);
      router.push("/connexion");
      alert("Compte et données supprimés.");
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
            {/* Gauche : hamburger + logo */}
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
