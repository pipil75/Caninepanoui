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
        setErrorMessage("You don't have admin privileges.");
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
    <div>
      <h1>Admin Panel</h1>
      {errorMessage ? (
        <p>{errorMessage}</p>
      ) : (
        <div>
          <button onClick={handleLogout}>Logout</button>
          <div>
            {data.length === 0 ? (
              <p>No data available</p>
            ) : (
              <ul>
                {data.map((item) => (
                  <li key={item.id}>
                    {editingUser && editingUser.id === item.id ? (
                      <div>
                        {/* Formulaire d'édition */}
                        <input
                          type="text"
                          value={editingUser.name}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              name: e.target.value,
                            })
                          }
                          placeholder="Name"
                        />
                        <input
                          type="email"
                          value={editingUser.email}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              email: e.target.value,
                            })
                          }
                          placeholder="Email"
                        />
                        <input
                          type="text"
                          value={editingUser.description}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              description: e.target.value,
                            })
                          }
                          placeholder="Description"
                        />
                        <input
                          type="text"
                          value={editingUser.role}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              role: e.target.value,
                            })
                          }
                          placeholder="Role"
                        />
                        <button onClick={handleSaveEdit}>Save</button>
                        <button onClick={() => setEditingUser(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <strong>ID:</strong> {item.id}, <strong>Name:</strong>{" "}
                        {item.name}, <strong>Email:</strong> {item.email},{" "}
                        <strong>Description:</strong> {item.description},{" "}
                        <strong>Role:</strong> {item.role}
                        <button onClick={() => handleEdit(item)}>Edit</button>
                        <button onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {!user && <button onClick={handleLogin}>Login</button>}
    </div>
  );
}
