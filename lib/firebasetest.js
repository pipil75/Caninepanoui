import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Configuration Firebase (utilisez vos propres configurations)
const firebaseConfig = {
  apiKey: "AIzaSyDdBy7wigBeXHbL4o9_2Q9Lcl1Tcbrnsto",
  authDomain: "april-cfce5.firebaseapp.com",
  databaseURL:
    "https://april-cfce5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "april-cfce5",
  storageBucket: "april-cfce5.appspot.com",
  messagingSenderId: "859419938124",
  appId: "1:859419938124:web:9d8874f74610938477d3e9",
  measurementId: "G-274LZXS5W8",
};
// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

describe("Firebase Database Tests", () => {
  it("should add and retrieve data from Firebase Realtime Database", async () => {
    const testUserId = "test-user";
    const testUserData = {
      email: "test@example.com",
      createdAt: new Date().toISOString(),
    };

    // Ajouter des données de test à la base de données
    await set(ref(database, "users/" + testUserId), testUserData);

    // Récupérer les données de test de la base de données
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `users/${testUserId}`));
    const data = snapshot.val();

    // Vérifier que les données récupérées correspondent aux données ajoutées
    expect(data).toEqual(testUserData);
  });

  it("should create a user with email and password", async () => {
    const email = "testuser@example.com";
    const password = "password123";

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    expect(user.email).toBe(email);
  });
});
