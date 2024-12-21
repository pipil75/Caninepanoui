"use client";

import React from "react";

const Contact = () => {
  return (
    <div style={styles.container}>
      {/* En-tête */}
      <header style={styles.header}>
        <h1>Contactez-nous</h1>
      </header>

      {/* Contenu principal */}
      <main style={styles.section}>
        <h2>Nous Contacter</h2>
        <p>
          Vous avez une question ou une demande particulière ? N'hésitez pas à
          nous écrire. Notre équipe vous répondra dans les plus brefs délais.
        </p>

        <h3>Adresse e-mail</h3>
        <p>
          <a href="mailto:caninepanoui@gmail.com" style={styles.link}>
            caninepanoui@gmail.com
          </a>
        </p>
      </main>

      {/* Pied de page */}
      <footer style={styles.footer}>
        <p>© 2024 Canin Epanoui. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

// Styles inline pour simplicité
const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    lineHeight: "1.6",
    margin: "0",
    padding: "0",
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  header: {
    backgroundColor: "#847774",
    color: "#fff",
    textAlign: "center",
    padding: "20px 0",
  },
  section: {
    padding: "20px",
    margin: "20px auto",
    maxWidth: "800px",
    backgroundColor: "#fff",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  link: {
    color: "#847774",
    textDecoration: "underline",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "20px",
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    marginTop: "5px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "10px",
    marginTop: "5px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
    width: "100%",
    height: "100px",
    boxSizing: "border-box",
  },
  button: {
    backgroundColor: "#847774",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "10px 15px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#6b5f5c",
  },
  footer: {
    backgroundColor: "#847774",
    color: "#fff",
    textAlign: "center",
    padding: "10px 0",
    marginTop: "20px",
  },
};

export default Contact;
