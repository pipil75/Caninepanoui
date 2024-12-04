"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Image from "next/image";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { ref, get } from "firebase/database";
import { auth, database } from "../lib/firebase"; // Assurez-vous que le chemin est correct
import { useRouter } from "next/navigation";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#847774",
    },
  },
  typography: {
    h3: {
      fontSize: "2.5rem",
      fontWeight: "bold",
    },
  },
});

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [images, setImages] = React.useState(null);
  const [role, setRole] = React.useState(null); // Ajouter un état pour le rôle
  const router = useRouter();

  React.useEffect(() => {
    // Récupérer l'image de profil depuis Firebase
    const userId = auth.currentUser?.uid;
    if (userId) {
      const imageRef = ref(database, `users/${userId}/image`);
      get(imageRef).then((snapshot) => {
        if (snapshot.exists()) {
          const imageUrl = snapshot.val();
          console.log("URL de l'image de profil :", imageUrl);
          setImages(imageUrl); // Mettre à jour l'état avec l'URL de l'image
        }
      });

      // Récupérer le rôle de l'utilisateur depuis Firebase
      const roleRef = ref(database, `users/${userId}/role`);
      get(roleRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userRole = snapshot.val();
          setRole(userRole);
        }
      });
    }
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    router.push("/profil");
  };

  const handleLogout = () => {
    auth.signOut();
    router.push("/connexion");
  };

  const handleMessage = () => {
    router.push("/message");
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Image
              component="img"
              alt="logo chien"
              width={100}
              height={100}
              src="/images/blob.png"
            />

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Button
                href="./connexion"
                onClick={handleLogout}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Déconnexion
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Mon profil
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {role && (
                <Button
                  onClick={handleMessage}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  Messages
                </Button>
              )}
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <div>
                    <Avatar sx={{ width: 56, height: 56 }} src={images} />
                  </div>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseNavMenu}
              ></Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}

export default ResponsiveAppBar;
