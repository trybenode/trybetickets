/**
 * Authentication Middleware - Firebase Token Verification
 * Verifies Firebase ID tokens and attaches user to request
 */

const admin = require("firebase-admin");
const { User } = require("../models");

/**
 * Initialize Firebase Admin SDK
 * NOTE: You'll need to add your Firebase service account credentials
 */
const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      // Check if Firebase credentials are provided
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Option 1: Service account JSON as environment variable
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("✅ Firebase Admin initialized (service account JSON)");
      } else if (process.env.FIREBASE_PROJECT_ID) {
        // Option 2: Individual environment variables
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
        console.log("✅ Firebase Admin initialized");
      } else {
        console.warn("⚠️  Firebase Admin not initialized - Auth middleware will be disabled");
      }
    } catch (error) {
      console.error("❌ Error initializing Firebase Admin:", error.message);
    }
  }
};

// Initialize Firebase on module load
initializeFirebase();

/**
 * Middleware to verify Firebase ID token
 * Attaches user object to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // If Firebase is not initialized, skip verification (for development)
    if (!admin.apps.length) {
      console.warn("⚠️  Firebase not initialized - skipping auth verification");
      // For development, you can mock a user here
      req.user = {
        id: "dev-user-id",
        email: "dev@example.com",
        firebaseUID: "dev-firebase-uid",
      };
      return next();
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Find or create user in database
    let user = await User.findOne({ firebaseUID: decodedToken.uid });

    if (!user) {
      // Auto-create user if they don't exist
      user = await User.create({
        firebaseUID: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split("@")[0],
        isEmailVerified: decodedToken.email_verified || false,
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      firebaseUID: user.firebaseUID,
      organizerProfile: user.organizerProfile, // Include organizer profile for authorization checks
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    if (error.code === "auth/argument-error") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

/**
 * Optional authentication - doesn't require token but attaches user if present
 * Useful for endpoints that work with or without authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no token, just continue without user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    // Try to authenticate but don't fail if token is invalid
    await authenticate(req, res, next);
  } catch (error) {
    // Continue without authentication
    console.log("Optional auth failed, continuing as guest");
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  initializeFirebase,
};
