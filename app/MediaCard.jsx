"use client";
import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Image from "next/image";
import { ThemeProvider } from "@mui/material";
import Link from "next/link";
import { theme } from "./connexion/page";

export default function MediaCard() {
  const handlesubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Card sx={{ maxWidth: 600, backgroundColor: "primary.main" }}>
        {
          <Image
            component="img"
            alt="logo chien"
            width={100}
            height={100}
            src="/images/blob.png"
          />
        }
        <CardContent>
          <Typography variant="h3" sx={{ color: theme.palette.secondary.main }}>
            Connectez-vous
          </Typography>
        </CardContent>
        <CardActions>
          <Box
            component="form"
            onSubmit={handlesubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <div>
              <TextField
                required
                fullWidth
                id="email"
                label="Email address"
                name="email"
                autoComplete="email"
                variant="standard"
              />

              <TextField
                required
                fullWidth
                id="password"
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                variant="standard"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  mb: 1,
                  backgroundColor: "secondary.main",
                }}
              >
                Connextion
              </Button>
            </div>
          </Box>
        </CardActions>
        <Link href="/inscription">
          si vous n'avez pas de compte ? cree en un
        </Link>
      </Card>
    </ThemeProvider>
  );
}
