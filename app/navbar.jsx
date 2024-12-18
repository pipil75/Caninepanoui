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
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { ref, get } from "firebase/database";
import { auth, database } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

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
  const [role, setRole] = React.useState(null);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");

  React.useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const imageRef = ref(database, `users/${userId}/image`);
      get(imageRef).then((snapshot) => {
        if (snapshot.exists()) {
          setImages(snapshot.val());
        }
      });

      const roleRef = ref(database, `users/${userId}/role`);
      get(roleRef).then((snapshot) => {
        if (snapshot.exists()) {
          setRole(snapshot.val());
        }
      });
    }
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    auth.signOut();
    router.push("/connexion");
  };

  const handleNavigate = (path) => {
    router.push(path);
    handleCloseNavMenu();
  };

  const menuItems = [
    { label: "Accueil", path: "/", visible: true },
    { label: "Mon profil", path: "/profil", visible: true },
    { label: "Messages", path: "/message", visible: !!role },
    { label: "Déconnexion", path: null, visible: true, action: handleLogout },
  ];

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Image
              alt="logo chien"
              width={isMobile ? 50 : 100}
              height={isMobile ? 50 : 100}
              src="/images/blob.png"
            />

            {/* Desktop Navigation */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "space-between", // Added to evenly space links
                alignItems: "center", // Ensures alignment in case of different heights
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
                      sx={{ my: 2, color: "white", display: "block" }}
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
                <Avatar sx={{ bgcolor: "#847774" }}>☰</Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
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

            {/* User Profile Section */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ width: 56, height: 56 }} src={images} />
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
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => handleNavigate("/profil")}>
                  Mon profil
                </MenuItem>
                <MenuItem onClick={() => handleNavigate("/message")}>
                  Messages
                </MenuItem>
                <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}

export default ResponsiveAppBar;
