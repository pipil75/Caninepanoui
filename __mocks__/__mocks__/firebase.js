export const getAuth = jest.fn(() => ({
  currentUser: null, // Simule qu'aucun utilisateur n'est connecté
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: "12345" } })
  ),
}));

export const getDatabase = jest.fn(() => ({}));
export const getStorage = jest.fn(() => ({}));
export const initializeApp = jest.fn(() => ({}));
