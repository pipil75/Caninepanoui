import React from "react";

import { render, screen, fireEvent, act } from "@testing-library/react";

import MediaInscription from "../inscription/page";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({ auth: {} })),
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn(),
  set: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn().mockResolvedValue("mockImageUrl"),
}));

describe("MediaInscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test pour vérifier si le composant s'affiche correctement
  it("renders the component correctly", async () => {
    // Rendu du composant avec `act` pour gérer les mises à jour d'état
    await act(async () => {
      render(<MediaInscription />);
    });

    // Vérification que les éléments attendus sont bien présents
    expect(screen.getByText(/Inscription/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adresse e-mail/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Mot de passe/i, { selector: "#password" })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Confirmez le mot de passe/i, {
        selector: "#confirmPassword",
      })
    ).toBeInTheDocument();
  });

  // Test pour valider le format de l'adresse e-mail et afficher un message d'erreur en cas d'e-mail invalide
  it("validates email format and shows an error message for invalid email", async () => {
    // Rendu du composant
    await act(async () => {
      render(<MediaInscription />);
    });

    // Sélection du champ d'e-mail et simulation d'une saisie invalide
    const emailInput = screen.getByLabelText(/Adresse e-mail/i);
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.click(screen.getByText(/S'inscrire/i)); // Simulation du clic sur le bouton
    });

    // Vérification de l'affichage du message d'erreur
    expect(
      screen.getByText(/Veuillez fournir une adresse e-mail valide./i)
    ).toBeInTheDocument();
  });

  // Test pour vérifier que les mots de passe non correspondants affichent une erreur
  it("shows an error message if passwords do not match", async () => {
    // Rendu du composant
    await act(async () => {
      render(<MediaInscription />);
    });

    // Sélection des champs de mot de passe et simulation de saisies non correspondantes
    const passwordInput = screen.getByLabelText(/Mot de passe/i, {
      selector: "#password",
    });
    const confirmPasswordInput = screen.getByLabelText(
      /Confirmez le mot de passe/i,
      { selector: "#confirmPassword" }
    );

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "differentPassword" },
      });
      fireEvent.click(screen.getByText(/S'inscrire/i)); // Simulation du clic sur le bouton
    });

    // Vérification de l'affichage du message d'erreur
    expect(
      screen.getByText(/Les mots de passe ne correspondent pas./i)
    ).toBeInTheDocument();
  });

  // Test pour vérifier les appels aux méthodes Firebase en cas d'inscription réussie
  it("calls Firebase methods on successful registration", async () => {
    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: "mockUid" },
    });

    // Rendu du composant
    await act(async () => {
      render(<MediaInscription />);
    });

    // Sélection et simulation de saisie dans les champs du formulaire
    const nameInput = screen.getByLabelText(/Nom/i);
    const emailInput = screen.getByLabelText(/Adresse e-mail/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i, {
      selector: "#password",
    });
    const confirmPasswordInput = screen.getByLabelText(
      /Confirmez le mot de passe/i,
      { selector: "#confirmPassword" }
    );

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText(/S'inscrire/i)); // Simulation du clic sur le bouton
    });

    // Vérification des appels aux méthodes Firebase
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "test@example.com",
      "password123"
    );
    expect(sendEmailVerification).toHaveBeenCalled();
  });

  // Test pour vérifier l'affichage d'un message de confirmation après une inscription réussie
  it("shows a confirmation message after successful registration", async () => {
    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: "mockUid" },
    });

    // Rendu du composant
    await act(async () => {
      render(<MediaInscription />);
    });

    // Sélection et simulation de saisie dans les champs du formulaire
    const nameInput = screen.getByLabelText(/Nom/i);
    const emailInput = screen.getByLabelText(/Adresse e-mail/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i, {
      selector: "#password",
    });
    const confirmPasswordInput = screen.getByLabelText(
      /Confirmez le mot de passe/i,
      { selector: "#confirmPassword" }
    );

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText(/S'inscrire/i)); // Simulation du clic sur le bouton
    });

    // Vérification de l'affichage du message de confirmation
    expect(
      await screen.findByText(
        /Inscription réussie ! Un e-mail de vérification a été envoyé./i
      )
    ).toBeInTheDocument();
  });
});
