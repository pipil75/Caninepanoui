"use client";
import { useRouter } from "next/navigation";
import { auth, database } from "../../lib/firebase";
import { ref, get } from "firebase/database";
import { useEffect, useState } from "react";

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const roleRef = ref(database, `users/${currentUser.uid}/role`);
        const snapshot = await get(roleRef);
        if (snapshot.exists()) {
          const userRole = snapshot.val();
          if (userRole === "pro") {
            router.push("/message/pro");
          } else {
            router.push("/message/user");
          }
        }
      }
      setLoading(false); // Ensure loading is set to false regardless of whether the user is authenticated or not.
    };

    fetchUserRole();
  }, [router]);

  if (loading) {
    return <p>Redirection en cours...</p>;
  }

  return null;
}
