"use client";
import { setCookie, hasCookie } from "cookies-next";
import { useState, useEffect } from "react";
import { Box, Button, Typography, Modal } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const CookieAccepter = () => {
  const [cookieAccepted, setCookieAccepted] = useState(false);

  useEffect(() => {
    if (!hasCookie("consent")) {
      setCookieAccepted(true);
    }
  }, []);

  const acceptConsent = () => {
    setCookieAccepted(false);
    setCookie("consent", "true");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("updateGTMConsent"));
    }
  };

  const declineConsent = () => {
    setCookieAccepted(false);
  };

  return (
    <Modal
      open={cookieAccepted}
      onClose={declineConsent}
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <Box sx={style}>
        <Typography id="cookie-consent-title" variant="h6" component="h2">
          Gestion des Cookies
        </Typography>
        <Typography id="cookie-consent-description" sx={{ mt: 2 }}>
          Nous utilisons des <strong>cookies de standard analytique</strong>{" "}
          pour comprendre le comportement général des utilisateurs afin
          d'améliorer notre contenu. Cela implique l'utilisation de cookies.
          Êtes-vous d'accord avec cela ?
        </Typography>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={acceptConsent}
            sx={{ mr: 1 }}
          >
            Accepter
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={declineConsent}
          >
            Refuser
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CookieAccepter;
