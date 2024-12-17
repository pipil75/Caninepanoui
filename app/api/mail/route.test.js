import { POST } from "./route"; // Chemin vers votre API route
import nodemailer from "nodemailer";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: () => data, // La méthode json retourne l'objet data
    })),
  },
}));

jest.mock("nodemailer");

describe("POST /api/mail", () => {
  let sendMailMock;

  beforeEach(() => {
    sendMailMock = jest.fn();
    nodemailer.createTransport.mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("retourne une erreur si des champs sont manquants", async () => {
    const request = new Request("http://localhost/api/mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", subject: "", message: "" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ message: "Tous les champs sont requis" });
  });

  test("envoie un email correctement si les données sont valides", async () => {
    const request = new Request("http://localhost/api/mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        subject: "Test Subject",
        message: "Test Message",
      }),
    });

    sendMailMock.mockResolvedValueOnce({ messageId: "12345" });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ message: "Email envoyé avec succès" });
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  });
});
