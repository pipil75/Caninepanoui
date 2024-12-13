// Importations nécessaires pour le test
import React from "react"; // Import de React
import { render, screen, fireEvent, waitFor } from "@testing-library/react"; // Outils de test pour les composants React
import { axe, toHaveNoViolations } from "jest-axe"; // Outils pour les tests d'accessibilité
import MediaCard from "../connexion/page"; // Importation du composant à tester (chemin à vérifier)
import { act } from "react"; // Utilisé pour envelopper les actions asynchrones dans les tests
import "@testing-library/jest-dom"; // Fournit des extensions pour les assertions DOM

// Mock des modules Firebase
jest.mock("firebase/app");
import { signInWithEmailAndPassword } from "firebase/auth"; // Fonction de connexion avec Firebase
jest.spyOn(console, "error").mockImplementation(() => {});

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})), // Mock de l'initialisation de Firebase Auth
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: { uid: "123", email: "test@example.com" }, // Mock d'une réponse réussie
    })
  ),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // Simule un utilisateur déconnecté
    return jest.fn(); // Mock d'une fonction d'unsubscribe
  }),
}));

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(() => ({})), // Mock de l'initialisation de Firebase Database
  ref: jest.fn(),
  get: jest.fn(() =>
    Promise.resolve({
      exists: () => true, // Simule que la référence existe
      val: () => ({ role: "pro" }), // Simule un rôle d'utilisateur
    })
  ),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})), // Mock de Firebase Storage
}));

// Mock pour le routeur de Next.js
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush, // Mock de la fonction push pour la navigation
  }),
}));

// Mock pour le thème Material-UI
jest.mock("@mui/material/styles", () => {
  const actual = jest.requireActual("@mui/material/styles");
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        primary: { main: "#1976d2" }, // Définition d'une palette personnalisée
      },
    }),
  };
});

// Ajout de l'extension pour les tests d'accessibilité
expect.extend(toHaveNoViolations);

// Début de la suite de tests pour le composant MediaCard
describe("Tests pour le composant MediaCard", () => {
  // Réinitialisation des mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test : Vérifier que le composant MediaCard est affiché correctement
  test("affiche le composant MediaCard", async () => {
    await act(async () => {
      render(<MediaCard />); // Rendre le composant
    });

    // Vérifie que le titre "Connectez-vous" est présent
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Connectez-vous/i })
      ).toBeInTheDocument()
    );

    // Vérifie que les champs "Adresse e-mail" et "Mot de passe" sont présents
    expect(screen.getByLabelText(/Adresse e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
  });

  // Test : Vérifier l'accessibilité avec jest-axe
  test("test d'accessibilité avec jest-axe", async () => {
    let container;
    await act(async () => {
      const renderResult = render(<MediaCard />); // Rendre le composant
      container = renderResult.container; // Obtenir le conteneur DOM
    });

    const results = await axe(container); // Vérifier les violations d'accessibilité
    expect(results).toHaveNoViolations(); // Aucune violation ne doit être détectée
  });

  // Test : Vérifier que les champs de saisie mettent à jour leur état
  test("met à jour l'état lors du changement des champs de saisie", async () => {
    await act(async () => {
      render(<MediaCard />); // Rendre le composant
    });

    // Sélectionner les champs de saisie
    const emailInput = screen.getByLabelText(/Adresse e-mail/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);

    // Simuler des changements dans les champs
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
    });

    // Vérifier que les valeurs des champs sont mises à jour
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  // Test : Vérifier que signInWithEmailAndPassword est appelé lors de la soumission
  test("appelle signInWithEmailAndPassword lors de la soumission du formulaire", async () => {
    await act(async () => {
      render(<MediaCard />); // Rendre le composant
    });

    const emailInput = screen.getByLabelText(/Adresse e-mail/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", { name: /Connexion/i });

    // Simuler la soumission du formulaire
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);
    });

    // Vérifier que signInWithEmailAndPassword est appelé avec les bonnes valeurs
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      "test@example.com",
      "password123"
    );
  });

  // Test : Vérifier l'affichage d'une erreur si les identifiants sont incorrects
  test("affiche une erreur si les identifiants sont incorrects", async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error("Auth Error")); // Simuler une erreur d'authentification

    await act(async () => {
      render(<MediaCard />); // Rendre le composant
    });

    const emailInput = screen.getByLabelText(/Adresse e-mail/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", { name: /Connexion/i });

    // Simuler une soumission incorrecte
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(submitButton);
    });

    // Vérifier que le message d'erreur est affiché
    await waitFor(() =>
      expect(screen.getByText(/Erreur d'authentification/i)).toBeInTheDocument()
    );
  });

  // Test : Vérifier la redirection de l'utilisateur après une connexion réussie
  test("redirige l'utilisateur après une connexion réussie en fonction de son rôle", async () => {
    await act(async () => {
      render(<MediaCard />); // Rendre le composant
    });

    const emailInput = screen.getByLabelText(/Adresse e-mail/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", { name: /Connexion/i });

    // Simuler une connexion réussie
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);
    });

    // Vérifier que l'utilisateur est redirigé vers "/accueil"
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/accueil"));
  });
});
