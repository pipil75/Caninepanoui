"use client";

import React from "react";
import Header from "../header";

const MentionsLegales = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Mentions Légales et Politique de Confidentialité</h1>
      </header>

      <section style={styles.section}>
        <h2>Éditeur du site</h2>
        <p>
          <strong>Canin Épanoui</strong>
          <br />
          Auto-entrepreneur – Jean Dupont
          <br />
          10 rue des Lilas, 75000 Paris
          <br />
          SIRET : 123 456 789 00012
          <br />
          Responsable de la publication : Jean Dupont
          <br />
          Email :{" "}
          <a href="mailto:contact@canin-epanoui.fr" style={styles.link}>
            contact@canin-epanoui.fr
          </a>
        </p>
      </section>

      <section style={styles.section}>
        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par :<br />
          Vercel Inc.
          <br />
          340 S Lemon Ave #4133, Walnut, CA 91789
          <br />
          Email :{" "}
          <a href="mailto:support@vercel.com" style={styles.link}>
            support@vercel.com
          </a>
        </p>
      </section>

      <section style={styles.section}>
        <h2>Politique de Confidentialité et Traitement des Données</h2>
        <p>
          Nous nous engageons à protéger vos données personnelles conformément
          au <strong>RGPD</strong>. Toutes les données collectées sont utilisées
          exclusivement pour les finalités prévues et sont sécurisées.
        </p>
        <p>
          Vous disposez d'un droit d'accès, de rectification et de suppression
          de vos données personnelles. Pour toute demande, veuillez contacter
          notre DPO à l'adresse suivante :<br />
          <a href="mailto:dpo@canin-epanoui.fr" style={styles.link}>
            dpo@canin-epanoui.fr
          </a>
        </p>
      </section>

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

      <section style={styles.section}>
        <h2>Paiement et Responsabilité</h2>
        <p>
          Canin Épanoui agit uniquement en tant qu’intermédiaire entre les
          utilisateurs et les prestataires de services canins.
          <br />
          <br />
          Les paiements sont effectués via la plateforme sécurisée{" "}
          <strong>PayPal</strong>. En aucun cas Canin Épanoui ne stocke ni ne
          gère les informations bancaires des utilisateurs.
          <br />
          <br />
          Canin Épanoui ne pourra être tenu responsable d’éventuels litiges liés
          aux prestations ou aux paiements, ceux-ci relevant de la
          responsabilité des parties concernées.
        </p>
      </section>

      <footer style={styles.footer}>
        <Header />
      </footer>
    </div>
  );
};

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
