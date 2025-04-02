"use client";
import Link from "next/link";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={`bg-gray-700 text-white py-4 px-6 ${styles.header}`}>
      <nav
        className={`container mx-auto flex flex-col md:flex-row justify-between items-center ${styles.navContainer}`}
      >
        <ul
          className={`flex flex-col md:flex-row gap-4 md:gap-8 ${styles.navList}`}
        >
          <li>
            <Link href="/mentionlegal" legacyBehavior>
              <a
                className={`hover:underline ${styles.link}`}
                aria-label="mention legal"
              >
                Mention légal
              </a>
            </Link>
          </li>
          <li>
            <Link href="/about" legacyBehavior>
              <a
                className={`hover:underline ${styles.link}`}
                aria-label="a propos"
              >
                À propos de nous
              </a>
            </Link>
          </li>
          <li>
            <Link href="/contact" legacyBehavior>
              <a
                className={`hover:underline ${styles.link}`}
                aria-label="contact"
              >
                Contact
              </a>
            </Link>
          </li>
        </ul>
        <p className={`text-sm mt-4 md:mt-0 ${styles.footerText}`}>
          © 2024 Canin Epanoui. Tous droits réservés.
        </p>
      </nav>
    </header>
  );
};

export default Header;
