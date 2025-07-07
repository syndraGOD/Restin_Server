const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");
const sendDiscordWebhook = require("./discord");
global.firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const admin = require("firebase-admin");
admin.initializeApp(global.firebaseConfig);

//무지했던 과거에 김한울아... 왜 유저 객체로 쿼리를짜니.. 
const app = initializeApp(global.firebaseConfig);
global.firebaseDB = getFirestore(app);
global.firebaseStorage = getStorage(app);
global.sendDiscordWebhook = sendDiscordWebhook;
global.timeStamp = () => {
  return new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split(".")[0];
}