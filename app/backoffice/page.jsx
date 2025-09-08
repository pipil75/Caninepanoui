"use client";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, onValue, update, off } from "firebase/database";
import {
  Container,
  Button,
  Card,
  Typography,
  TextField,
  Box,
  Grid,
  Stack,
  Divider,
} from "@mui/material";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

// ——— utils ———
const sanitizeForRTDB = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (user.email !== "aprilraphaella75@gmail.com") {
      setErrorMessage("vous n'etes pas admin.");
      return;
    }
    setErrorMessage("");

    const dbRef = ref(db, "users");
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const items = snapshot.val();
          const itemsArray = Object.entries(items).map(([id, value]) => ({
            id,
            ...(value || {}),
          }));
          setData(itemsArray);
        } else {
          setData([]);
        }
      },
      (err) => {
        setErrorMessage(
          "Erreur DB: " + (err?.code || err?.message || String(err))
        );
      }
    );

    // cleanup listener
    return () => {
      off(dbRef);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [user]);

  const fetchData = () => {
    const dbRef = ref(db, "users");
    onValue(
      dbRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const items = snapshot.val();
          const itemsArray = Object.entries(items).map(([id, value]) => ({
            id,
            ...(value || {}),
          }));
          setData(itemsArray);
        } else {
          setData([]);
        }
      },
      (err) =>
        setErrorMessage(
          "Erreur DB: " + (err?.code || err?.message || String(err))
        )
    );
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Authentication failed: ", error);
      setErrorMessage("Échec auth : " + (error?.message || ""));
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => setUser(null))
      .catch((error) => console.error("Error signing out: ", error));
  };

  const handleDelete = async (userId) => {
    try {
      const token = await auth.currentUser.getIdToken(true);
      const res = await fetch("/api/mail/admin/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: userId }),
      });

      const text = await res.text();
      const isJson = (res.headers.get("content-type") || "").includes(
        "application/json"
      );
      const payload = isJson ? JSON.parse(text) : null;

      if (!res.ok)
        throw new Error(payload?.error || text || `HTTP ${res.status}`);

      alert("Utilisateur supprimé (Auth + DB).");
      setData((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error(error);
      alert("Suppression impossible : " + error.message);
    }
  };

  const handleEdit = (u) => {
    // normalise pour éviter undefined -> RTDB
    setEditingUser({
      id: u.id,
      name: u.name ?? "",
      email: u.email ?? "",
      description: u.description ?? "",
      role: u.role ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setBusy(true);
    try {
      const { id, ...rest } = editingUser;

      // supprime toutes les clés undefined (RTDB refuse undefined)
      let updates = sanitizeForRTDB(rest);

      s;

      await update(ref(db, `users/${id}`), updates);
      alert("User updated successfully");
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user: ", error);
      alert("Mise à jour impossible : " + (error?.message || error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom align="center">
        Panneau Admin
      </Typography>

      {errorMessage && (
        <Typography color="error" align="center">
          {errorMessage}
        </Typography>
      )}

      {!user ? (
        <Box textAlign="center" mt={3}>
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Se connecter avec Google
          </Button>
        </Box>
      ) : (
        <Box textAlign="center" mb={3}>
          <Button variant="outlined" color="secondary" onClick={handleLogout}>
            Déconnexion
          </Button>
        </Box>
      )}

      {user && user.email === "aprilraphaella75@gmail.com" && (
        <Stack spacing={3}>
          {data.length === 0 ? (
            <Typography>Aucun utilisateur trouvé.</Typography>
          ) : (
            data.map((item) => (
              <Card key={item.id} sx={{ p: 2 }}>
                {editingUser && editingUser.id === item.id ? (
                  <Grid container spacing={2}>
                    {["name", "email", "description", "role"].map((field) => (
                      <Grid item xs={12} sm={6} key={field}>
                        <TextField
                          fullWidth
                          label={field.charAt(0).toUpperCase() + field.slice(1)}
                          value={editingUser[field] ?? ""} // jamais undefined à l'affichage
                          onChange={(e) =>
                            setEditingUser((prev) => ({
                              ...prev,
                              [field]: e.target.value,
                            }))
                          }
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          onClick={handleSaveEdit}
                          disabled={busy}
                        >
                          {busy ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setEditingUser(null)}
                          disabled={busy}
                        >
                          Annuler
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                ) : (
                  <Box>
                    <Typography>
                      <strong>ID:</strong> {item.id}
                    </Typography>
                    <Typography>
                      <strong>Nom:</strong> {item.name}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong> {item.email}
                    </Typography>
                    <Typography>
                      <strong>Description:</strong> {item.description}
                    </Typography>
                    <Typography>
                      <strong>Rôle:</strong> {item.role}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        onClick={() => handleEdit(item)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(item.id)}
                      >
                        Supprimer
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Card>
            ))
          )}
        </Stack>
      )}
    </Container>
  );
}
