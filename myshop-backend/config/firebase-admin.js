const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
  }
  return admin;
};

module.exports = initializeFirebaseAdmin;
