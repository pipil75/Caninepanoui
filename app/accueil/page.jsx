"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import ResponsiveAppBar from "../navbar";
import { ref, get } from "firebase/database";
import { database } from "../../lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import CookieAccepter from "../component/cookie/page";
import Header from "../header";
import CssBaseline from "@mui/material/CssBaseline";

//  helpers pour casser le cache et privilégier Storage
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  getMetadata,
} from "firebase/storage";

function addVersionParam(baseUrl, version) {
  try {
    const u = new URL(baseUrl);
    u.searchParams.set("v", String(version || Date.now()));
    return u.toString();
  } catch {
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}v=${encodeURIComponent(version || Date.now())}`;
  }
}

async function loadFreshProfileImage(userId, dbUrlOrPath) {
  const storage = getStorage();
  const tryPaths = [
    `images/${userId}/profile.jpg`, // minuscule (ton dossier)
    `Images/${userId}/profile.jpg`,
    `Images/${userId}/Profil.jpg`,
  ];

  //  essayer Storage (profile.jpg)
  for (const p of tryPaths) {
    try {
      const imgRef = storageRef(storage, p);
      const [url, meta] = await Promise.all([
        getDownloadURL(imgRef),
        getMetadata(imgRef),
      ]);
      const v = meta?.generation || meta?.updated || Date.now().toString();
      return addVersionParam(url, v);
    } catch {
      // on essaye la variante suivante
    }
  }

  //  fallback DB (URL -> on ajoute v, path -> on résout + v)
  if (dbUrlOrPath) {
    if (/^https?:\/\//i.test(dbUrlOrPath)) {
      return addVersionParam(dbUrlOrPath, Date.now());
    }
    try {
      const imgRef = storageRef(storage, dbUrlOrPath);
      const [url, meta] = await Promise.all([
        getDownloadURL(imgRef),
        getMetadata(imgRef),
      ]);
      const v = meta?.generation || meta?.updated || Date.now().toString();
      return addVersionParam(url, v);
    } catch {}
  }

  return "https://via.placeholder.com/150";
}
//  helpers

export default function MultiActionAreaCard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            router.push("/");
          } else {
            setAuthLoading(false);
          }
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Erreur de persistance :", error);
      });
  }, [auth, router]);

  useEffect(() => {
    if (!authLoading) {
      const fetchUsers = async () => {
        const usersRef = ref(database, "users");
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const data = snapshot.val();

          const proUsers = Object.entries(data)
            .map(([id, user]) => ({ ...user, id, uid: user.uid || id }))
            .filter((user) => user.role === "pro");

          // charge l’URL fraîche depuis Storage pour chaque pro
          const withFreshImages = await Promise.all(
            proUsers.map(async (u) => {
              const freshUrl = await loadFreshProfileImage(
                u.id,
                u.image || u.imagePath
              );
              return { ...u, image: freshUrl };
            })
          );

          setUsers(withFreshImages);
        } else {
          setUsers([]);
        }
        setLoading(false);
      };
      fetchUsers();
    }
  }, [authLoading]);

  if (authLoading) return <p>Chargement de l'authentification...</p>;
  if (loading) return <p>Chargement des éducateurs...</p>;

  const handleOpenUserDetail = (userId) => {
    router.push(`/profilprodetail/${userId}`);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#FCFEF7",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",

        alignItems: "stretch",
      }}
    >
      <CssBaseline />
      <ResponsiveAppBar />
      <CookieAccepter />
      <Box
        sx={{ width: "min(96vw, 1400px)", textAlign: "center", px: 2, mb: 5 }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "#847774",
            mb: 2,
            fontSize: { xs: "1.8rem", md: "2.2rem" },
          }}
        >
          Découvrez nos éducateurs canins certifiés
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#6F6561",
            fontSize: { xs: "1rem", md: "1.1rem" },
          }}
        >
          Prenez le temps d’explorer les profils professionnels adaptés à vos
          besoins. Chaque éducateur est qualifié pour vous accompagner avec
          bienveillance.
        </Typography>
      </Box>

      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ width: "min(96vw, 1400px)", px: 3 }}
      >
        {users.length > 0 ? (
          users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "20px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "translateY(-5px)" },
                  textAlign: "center",
                  p: 2,
                }}
              >
                <Box
                  component="img"
                  key={user.image} // force re-render si l’URL change
                  src={user.image || "https://via.placeholder.com/150"}
                  alt={user.name}
                  sx={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    mx: "auto",
                    mb: 2,
                  }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    {user.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    {user.codepostal}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                  <Button
                    onClick={() => handleOpenUserDetail(user.id)}
                    variant="contained"
                    sx={{
                      backgroundColor: "#847774",
                      color: "#fff",
                      borderRadius: "20px",
                      px: 3,
                      ":hover": { backgroundColor: "#6f6561" },
                    }}
                  >
                    Voir le profil
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            Aucun éducateur disponible pour le moment.
          </Typography>
        )}
      </Grid>

      <Box sx={{ width: "100%", mt: 4 }}>
        <Header />
      </Box>
    </Box>
  );
}
