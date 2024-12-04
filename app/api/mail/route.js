// app/api/send-email/route.js
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, subject, message } = await req.json();

    console.log("Données reçues :", email, subject, message);

    // Créez un transporteur Nodemailer
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "caninepanoui@gmail.com",
        pass: "raclette75", // Utilisez un mot de passe d'application pour plus de sécurité
      },
    });

    // Définir les options de l'email
    let mailOptions = {
      from: "caninepanoui@gmail.com",
      to: email,
      subject: subject,
      text: message,
    };

    // Envoyer l'email
    let info = await transporter.sendMail(mailOptions);
    console.log("Message envoyé: %s", info.messageId);

    return NextResponse.json(
      { message: "Email envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    return NextResponse.json(
      { message: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
