"use client";

import { useRouter } from "next/navigation";
import { auth, database } from "../../lib/firebase";
import { ref, get } from "firebase/database";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserRole = async (user) => {
      try {
        const roleRef = ref(database, `users/${user.uid}/role`);
        const snapshot = await get(roleRef);
        if (snapshot.exists()) {
          const userRole = snapshot.val();
          if (userRole === "pro") {
            router.push("/message/pro");
          } else {
            router.push("/message/user");
          }
        } else {
          setError("Rôle utilisateur introuvable.");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du rôle :", err);
        setError(
          "Une erreur s'est produite lors de la récupération des données."
        );
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserRole(user);
      } else {
        router.push("/login"); // Redirige vers la page de connexion si non connecté
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Nettoyer l'écouteur
  }, [router]);

  if (loading) {
    return <p>Redirection en cours...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return null;
}
