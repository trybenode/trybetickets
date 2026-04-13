/**
 * Script to update Firebase user displayName
 * Run with: node scripts/updateFirebaseDisplayName.js
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

const updateDisplayName = async () => {
  try {
    const userEmail = 'allenissabigboi@gmail.com';
    const newDisplayName = 'Allen Douglas';

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    console.log('📝 Current displayName:', userRecord.displayName || '(not set)');
    console.log('📝 Updating to:', newDisplayName);

    // Update the displayName
    await admin.auth().updateUser(userRecord.uid, {
      displayName: newDisplayName,
    });

    console.log('✅ Firebase displayName updated successfully!');
    
    // Verify the update
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('User details:', {
      uid: updatedUser.uid,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateDisplayName();
