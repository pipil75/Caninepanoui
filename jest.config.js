const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./", // Chemin vers le dossier contenant votre configuration Next.js (par défaut : racine)
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom", // Utilisé pour tester des composants React
  moduleFileExtensions: ["js", "jsx"], // Extensions reconnues par Jest
  transformIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

module.exports = createJestConfig(customJestConfig);
