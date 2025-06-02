"use client";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
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

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null); // Pour gérer l'utilisateur en cours d'édition

  useEffect(() => {
    if (user) {
      if (user.email !== "aprilraphaella75@gmail.com") {
        setErrorMessage("vous n'etes pas admin.");
      } else {
        fetchData(); // Récupère les données uniquement si l'admin est connecté
      }
    }
  }, [user]);

  const fetchData = () => {
    const dbRef = ref(getDatabase(app), "users");
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const items = snapshot.val();

        // Transformer les données en tableau
        const itemsArray = Object.entries(items).map(([id, value]) => ({
          id,
          ...value,
        }));
        setData(itemsArray); // Mettre à jour l'état avec les données des utilisateurs
      } else {
        setData([]);
      }
    });
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Authentication failed: ", error);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => setUser(null))
      .catch((error) => console.error("Error signing out: ", error));
  };

  const handleDelete = (userId) => {
    const userRef = ref(getDatabase(app), `users/${userId}`);
    remove(userRef)
      .then(() => {
        alert("User deleted successfully");
        fetchData(); // Rafraîchir les données après suppression
      })
      .catch((error) => {
        console.error("Error deleting user: ", error);
      });
  };

  const handleEdit = (user) => {
    setEditingUser(user); // Définir l'utilisateur à modifier
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;

    const userRef = ref(getDatabase(app), `users/${editingUser.id}`);
    update(userRef, {
      name: editingUser.name,
      email: editingUser.email,
      description: editingUser.description,
      role: editingUser.role,
    })
      .then(() => {
        alert("User updated successfully");
        setEditingUser(null); // Réinitialiser l'édition
        fetchData(); // Rafraîchir les données après modification
      })
      .catch((error) => {
        console.error("Error updating user: ", error);
      });
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
                          value={editingUser[field] || ""}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              [field]: e.target.value,
                            })
                          }
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={handleSaveEdit}>
                          Enregistrer
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setEditingUser(null)}
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
