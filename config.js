// Firebase Console → Project settings → Your apps → Web app
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Замени email на реальные адреса Егора и Даниила (строчными буквами).
export const members = {
  "egor@example.com": { id: "egor", name: "Егор" },
  "danila@example.com": { id: "daniil", name: "Даниил" }
};
