"use client";

import React from "react";

const MentionsLegales = () => {
  return (
    <div style={styles.container}>
      {/* En-tête */}
      <header style={styles.header}>
        <h1>Mentions Légales et Politique de Confidentialité</h1>
      </header>

      {/* Section Mentions Légales */}
      <section style={styles.section}>
        <h2>Mentions Légales</h2>
        <p>
          Ce site est édité par : <strong>Canin Epanoui</strong> <br />
          <br />
          Email : contact@canin-epanoui.fr <br />
        </p>
      </section>

      {/* Section Politique de Confidentialité */}
      <section style={styles.section}>
        <h2>Politique de Confidentialité et Traitement des Données</h2>
        <p>
          Nous nous engageons à protéger vos données personnelles conformément
          au
          <strong>
            RGPD (Règlement Général sur la Protection des Données)
          </strong>
          . Toutes les données collectées sont utilisées exclusivement pour les
          finalités prévues et sont sécurisées.
        </p>
        <p>
          Vous disposez d'un droit d'accès, de rectification et de suppression
          de vos données personnelles. Pour toute demande, veuillez contacter
          notre
          <strong>Responsable de la Protection des Données (DPO)</strong> à
          l'adresse suivante :
          <a href="mailto:dpo@canin-epanoui.fr" style={styles.link}>
            dpo@canin-epanoui.fr
          </a>
          .
        </p>
      </section>

      {/* Section Double Opt-in */}
      <section style={styles.section}>
        <h2>Double Opt-in pour les Collectes de Données</h2>
        <p>
          Nous avons mis en place un processus de <strong>double opt-in</strong>{" "}
          pour garantir que vous consentez explicitement à la collecte et au
          traitement de vos données personnelles. Vous recevrez un e-mail de
          confirmation pour valider votre consentement.
        </p>
      </section>

      {/* Section Propriété Intellectuelle */}
      <section style={styles.section}>
        <h2>Respect de la Propriété Intellectuelle</h2>
        <p>
          Tout contenu (codes sources, textes, images, logiciels) utilisé sur ce
          site est protégé par les lois en matière de propriété intellectuelle.
          Toute reproduction, distribution ou utilisation non autorisée est
          strictement interdite.
        </p>
        <p>
          Les composants logiciels tiers utilisés respectent les licences
          ouvertes ou commerciales correspondantes.
        </p>
      </section>
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
  footer: {
    backgroundColor: "#847774",
    color: "#fff",
    textAlign: "center",
    padding: "10px 0",
    marginTop: "20px",
  },
};

export default MentionsLegales;
