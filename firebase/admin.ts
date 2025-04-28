import {getApps} from 'firebase-admin/app';
import {credential} from "firebase-admin";
import cert = credential.cert;
import {initializeApp} from "firebase/app";


const initFirebaseAdmin = () => {
    const apps = getApps();

    if(!apps.length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            })
        })
    }

    return {
        auth: getAuth(),
        db: getFirestore()
    }
}

export const {auth, db} = initFirebaseAdmin();