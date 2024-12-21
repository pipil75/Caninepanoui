"use client";
import Link from "next/link";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <nav>
        <ul className={styles.navList}>
          <li>
            <Link href="/mentionlegal" legacyBehavior>
              <a className={styles.link} aria-label="mention legal">
                Mention légal
              </a>
            </Link>
          </li>
          <li>
            <Link href="/about" legacyBehavior>
              <a className={styles.link} aria-label=" a propos">
                À propos de nous
              </a>
            </Link>
          </li>
          <li>
            <Link href="/contact" legacyBehavior>
              <a className={styles.link} aria-label="contact">
                Contact
              </a>
            </Link>
          </li>
        </ul>
        <p>© 2024 Canin Epanoui. Tous droits réservés.</p>
      </nav>
    </header>
  );
};

export default Header;
