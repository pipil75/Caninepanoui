"use client";
import Link from "next/link";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.navContainer}>
        <ul className={styles.navList}>
          <li>
            <Link href="/mentionlegal" legacyBehavior>
              <a className={styles.link} aria-label="Mention légale">
                Mention légale
              </a>
            </Link>
          </li>
          <li>
            <Link href="/about" legacyBehavior>
              <a className={styles.link} aria-label="À propos">
                À propos de nous
              </a>
            </Link>
          </li>
          <li>
            <Link href="/contact" legacyBehavior>
              <a className={styles.link} aria-label="Contact">
                Contact
              </a>
            </Link>
          </li>
        </ul>
        <p className={styles.footerText}>
          © 2024 Canin Épanoui. Tous droits réservés.
        </p>
      </nav>
    </header>
  );
};

export default Header;
