import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import UserMessages from "../../message/user/page"; // Composant UserMessages
import { ref, onValue, push, remove } from "firebase/database";
import "@testing-library/jest-dom";

global.alert = jest.fn();

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn(),
  onValue: jest.fn(),
  push: jest.fn(() => Promise.resolve()),
  remove: jest.fn(() => Promise.resolve()),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: "testUserId", email: "testuser@example.com" },
  })),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})),
}));

describe("Tests pour le composant UserMessages", () => {
  const mockMessages = {
    messageId1: {
      senderEmail: "sender@example.com",
      message: "Test message",
      timestamp: Date.now(),
      senderId: "recipientUserId",
      replies: {
        replyId1: {
          replyMessage: "Test reply",
          senderEmail: "reply@example.com",
          timestamp: Date.now(),
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    onValue.mockImplementation((ref, callback) => {
      callback({
        exists: () => true,
        val: () => mockMessages,
      });
    });
  });

  test("rend les messages et les réponses correctement", async () => {
    render(<UserMessages />);
    await waitFor(() => {
      expect(screen.getByText(/de : sender@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/test message/i)).toBeInTheDocument();
      expect(screen.getByText(/test reply/i)).toBeInTheDocument();
    });
  });

  test("gère la soumission d'une réponse", async () => {
    render(<UserMessages />);

    const replyInput = screen.getByPlaceholderText(/répondre/i);

    act(() => {
      fireEvent.change(replyInput, { target: { value: "New test reply" } });
    });

    const replyButton = screen.getByRole("button", { name: /répondre/i });
    act(() => {
      fireEvent.click(replyButton);
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        ref(expect.any(Object), "path/to/replies"),
        {
          replyMessage: "New test reply",
          senderId: "testUserId",
          senderEmail: "testuser@example.com",
          recipientId: "recipientUserId",
          timestamp: expect.any(Number),
        }
      );
    });

    expect(global.alert).toHaveBeenCalledWith("Réponse envoyée avec succès !");
  });

  test("gère la suppression d'un message", async () => {
    render(<UserMessages />);

    const deleteButton = screen.getByRole("button", { name: /supprimer/i });
    act(() => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith(
        ref(expect.any(Object), "path/to/message")
      );
    });

    expect(global.alert).toHaveBeenCalledWith("Message supprimé !");
  });

  test("affiche un message lorsqu'aucun message n'est trouvé", async () => {
    onValue.mockImplementation((ref, callback) => {
      callback({
        exists: () => false,
        val: () => null,
      });
    });

    render(<UserMessages />);
    await waitFor(() =>
      expect(screen.getByText("Aucun message trouvé.")).toBeInTheDocument()
    );
  });
});
