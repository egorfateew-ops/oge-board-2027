// Firebase Console → Project settings → Your apps → oge-study-board-web
export const firebaseConfig = {
  apiKey: "AIzaSyBExMsJhjTtW7R5zMOTwMxQSTCF73T8E_k",
  authDomain: "oge-study-board.firebaseapp.com",
  projectId: "oge-study-board",
  storageBucket: "oge-study-board.firebasestorage.app",
  messagingSenderId: "724192963087",
  appId: "1:724192963087:web:dffbcd20963a43ab1a117a"
};

// Профили участников. Для входа Богдана добавим его email после подтверждения.
export const students = [
  { id: "egor", name: "Егор", initial: "Е", tone: "blue" },
  { id: "daniil", name: "Даниил", initial: "Д", tone: "purple" },
  { id: "bogdan", name: "Богдан", initial: "Б", tone: "green" }
];

// Аккаунты Firebase Authentication, которым разрешён вход.
export const members = {
  "egor.fateew@icloud.com": { id: "egor", name: "Егор" },
  "egorfateew@yandex.ru": { id: "daniil", name: "Даниил" }
};
