// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXfuMoIReDUj4G_0700BwehqlWpSmxQrk",
  authDomain: "proyectos-sociales-verano-cem.firebaseapp.com",
  projectId: "proyectos-sociales-verano-cem",
  storageBucket: "proyectos-sociales-verano-cem.firebasestorage.app",
  messagingSenderId: "142314910353",
  appId: "1:142314910353:web:367ff5499273f7a23c4530",
  measurementId: "G-Y56KD7W1DK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };