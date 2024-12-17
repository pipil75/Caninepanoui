import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Cardprofil from "../profil/page";
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { ref, get, update } from "firebase/database";

// Mock Firebase modules
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
  updatePassword: jest.fn(),
}));

jest.mock("firebase/database", () => ({
  ref: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
}));

describe("Cardprofil Component", () => {
  beforeEach(() => {
    // Mock onAuthStateChanged
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback({ uid: "user123", email: "test@example.com" });
      return jest.fn(); // Return a mock `unsubscribe` function
    });

    // Mock Firebase Database `get`
    get.mockResolvedValue({
      exists: () => true,
      val: () => ({
        name: "John Doe",
        email: "test@example.com",
        role: "pro",
        description: "Développeur",
        experience: "5 ans",
      }),
    });

    // Mock Firebase Database `update`
    update.mockResolvedValue();

    // Mock updatePassword
    updatePassword.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("récupère les données utilisateur et les affiche", async () => {
    await act(async () => {
      render(<Cardprofil />);
    });

    expect(screen.getByLabelText(/Nom/i).value).toBe("John Doe");
    expect(screen.getByLabelText(/Email/i).value).toBe("test@example.com");
    expect(screen.getByLabelText(/Description/i).value).toBe("Développeur");
    expect(screen.getByLabelText(/Expérience/i).value).toBe("5 ans");
  });

  test("met à jour les informations utilisateur", async () => {
    await act(async () => {
      render(<Cardprofil />);
    });

    fireEvent.change(screen.getByLabelText(/Nom/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Manager" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Enregistrer/i }));
    });

    expect(update).toHaveBeenCalledWith(
      ref(expect.anything(), "users/user123"),
      {
        name: "Jane Doe",
        email: "test@example.com",
        description: "Manager",
        experience: "5 ans",
      }
    );
  });

  test("affiche une erreur si les mots de passe ne correspondent pas", async () => {
    await act(async () => {
      render(<Cardprofil />);
    });

    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmez le mot de passe/i), {
      target: { value: "password456" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Enregistrer/i }));
    });

    expect(
      screen.getByText(/Les mots de passe ne correspondent pas/i)
    ).toBeInTheDocument();
  });

  test("met à jour le mot de passe utilisateur", async () => {
    await act(async () => {
      render(<Cardprofil />);
    });

    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmez le mot de passe/i), {
      target: { value: "password123" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Enregistrer/i }));
    });

    expect(updatePassword).toHaveBeenCalledWith(
      { uid: "user123", email: "test@example.com" },
      "password123"
    );
  });
});
