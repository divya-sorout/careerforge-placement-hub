import { initializeApp } from "firebase/app"

import { getAuth } from "firebase/auth"

import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBCXGODFtmf9mw-g_Zb41FwpZxEYFGp6CU",
  authDomain: "careerforge-ai-2daf2.firebaseapp.com",
  projectId: "careerforge-ai-2daf2",
  storageBucket: "careerforge-ai-2daf2.firebasestorage.app",
  messagingSenderId: "379284627990",
  appId: "1:379284627990:web:15f0fd28b8f57d3e2b4b37"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

export const db = getFirestore(app)