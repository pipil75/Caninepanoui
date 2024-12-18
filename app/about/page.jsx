"use client";

import React from "react";

const About = () => {
  return (
    <div style={styles.container}>
      {/* En-tête */}
      <header style={styles.header}>
        <h1>À propos de nous</h1>
      </header>

      {/* Contenu principal */}
      <main style={styles.section}>
        <h2>Qui sommes-nous ?</h2>
        <p>
          Chez <strong>Canin Epanoui</strong>, notre mission est de promouvoir
          le bien-être des chiens et de leurs propriétaires. Nous proposons des
          solutions innovantes pour aider les familles à mieux comprendre leurs
          compagnons à quatre pattes et à leur offrir une vie heureuse et
          épanouie.
        </p>

        <h2>Notre vision</h2>
        <p>
          Nous croyons que chaque chien mérite amour, respect et attention.
          C'est pourquoi nous travaillons avec des experts en comportement
          animal pour offrir des conseils, des ressources et des services
          personnalisés.
        </p>

        <h2>Nos valeurs</h2>
        <ul style={styles.list}>
          <li>❤️ Passion pour les animaux</li>
          <li>🤝 Engagement envers nos clients</li>
          <li>🌱 Innovation et durabilité</li>
          <li>📚 Éducation et sensibilisation</li>
        </ul>
      </main>
      <footer style={styles.footer}>
        <p>© 2024 Canin Epanoui. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

// Styles inline
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
  list: {
    padding: "0",
    listStyleType: "none",
  },
  footer: {
    backgroundColor: "#847774",
    color: "#fff",
    textAlign: "center",
    padding: "10px 0",
    marginTop: "20px",
  },
};

export default About;
