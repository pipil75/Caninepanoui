"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Image from "next/image";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { ref, get } from "firebase/database";
import { getAuth, deleteUser } from "firebase/auth";
import { auth, database } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const theme = createTheme({
  palette: {
    primary: { main: "#847774" },
    secondary: { main: "#FCFEF7" },
  },
  typography: {
    h3: { fontSize: "2.5rem", fontWeight: "bold" },
  },
});

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [images, setImages] = React.useState(null);
  const [role, setRole] = React.useState(null);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");
  const authInstance = getAuth();

  React.useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const imageRef = ref(database, `users/${userId}/image`);
      get(imageRef).then((snapshot) => {
        if (snapshot.exists()) setImages(snapshot.val());
      });

      const roleRef = ref(database, `users/${userId}/role`);
      get(roleRef).then((snapshot) => {
        if (snapshot.exists()) setRole(snapshot.val());
      });
    }
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavigate = (path) => {
    router.push(path);
    handleCloseNavMenu();
  };

  const handleLogout = () => {
    auth.signOut();
    router.push("/connexion");
  };

  const handleDeleteAccount = async () => {
    const user = authInstance.currentUser;
    if (!user) return alert("Aucun utilisateur connecté");

    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
    );
    if (!confirmDelete) return;

    try {
      await deleteUser(user);
      alert("Compte supprimé avec succès !");
      router.push("/connexion");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur lors de la suppression du compte. Réessayez.");
    }
  };

  const menuItems = [
    { label: "Accueil", path: "/accueil", visible: role === "user" },
    { label: "Mon profil", path: "/profil", visible: true },
    { label: "Messages", path: "/message", visible: !!role },
    { label: "Déconnexion", path: null, visible: true, action: handleLogout },
    {
      label: "Supprimer mon compte",
      path: null,
      visible: true,
      action: handleDeleteAccount,
    },
    { label: "Accueil", path: "/porfilepro", visible: role === "pro" },
    { label: "Mes rendez-vous", path: "/rdvuser", visible: role === "user" },
  ];

  const handleProfileClick = () => {
    router.push(role === "pro" ? "/porfilepro" : "/accueil");
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo */}
            <Box
              onClick={handleProfileClick}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <Image
                alt="logo chien"
                width={isMobile ? 50 : 100}
                height={isMobile ? 50 : 100}
                src="/images/blob.png"
              />
            </Box>

            {/* Desktop Navigation */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "space-around",
              }}
            >
              {menuItems.map(
                (item, index) =>
                  item.visible && (
                    <Button
                      key={index}
                      onClick={() =>
                        item.action ? item.action() : handleNavigate(item.path)
                      }
                      sx={{
                        my: 2,
                        color: theme.palette.secondary.main,
                        backgroundColor: theme.palette.primary.main,
                        "&:hover": { backgroundColor: "#6c635e" },
                        marginLeft: 2,
                        borderRadius: "8px",
                      }}
                    >
                      {item.label}
                    </Button>
                  )
              )}
            </Box>

            {/* Mobile Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <Avatar sx={{ bgcolor: "#847774" }} alt="Menu">
                  ☰
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
              >
                {menuItems.map(
                  (item, index) =>
                    item.visible && (
                      <MenuItem
                        key={index}
                        onClick={() =>
                          item.action
                            ? item.action()
                            : handleNavigate(item.path)
                        }
                      >
                        {item.label}
                      </MenuItem>
                    )
                )}
              </Menu>
            </Box>

            {/* Avatar */}
            <Box
              onClick={handleProfileClick}
              sx={{ flexGrow: 0, cursor: "pointer" }}
            >
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.secondary.main,
                }}
                src={images}
                alt="Photo de profil"
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}

export default ResponsiveAppBar;
