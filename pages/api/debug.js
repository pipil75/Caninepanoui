export default function handler(req, res) {
  res.status(200).json({
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || "Not Defined",
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "Not Defined",
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || "Not Defined",
  });
}
