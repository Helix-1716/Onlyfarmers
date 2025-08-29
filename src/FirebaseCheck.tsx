import { useEffect, useState } from 'react';

// Component to check Firebase configuration
export default function FirebaseCheck({ children }: { children: React.ReactNode }) {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);

  useEffect(() => {
    // Check if Firebase environment variables are available
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID'
    ];

    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

    if (missingVars.length > 0) {
      console.error('Missing Firebase configuration:', missingVars);
      setHasConfigError(true);
      setIsFirebaseReady(false);
    } else {
      // Small delay to ensure Firebase initializes
      setTimeout(() => setIsFirebaseReady(true), 100);
    }
  }, []);

  if (hasConfigError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-yellow-200 dark:border-yellow-800 p-6 text-center">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            Configuration Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Firebase configuration is missing. Please set up your environment variables to use this application.
          </p>
          <div className="text-left bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm">
            <p className="font-semibold mb-2">Required environment variables:</p>
            <ul className="space-y-1 text-xs">
              <li>• VITE_FIREBASE_API_KEY</li>
              <li>• VITE_FIREBASE_AUTH_DOMAIN</li>
              <li>• VITE_FIREBASE_PROJECT_ID</li>
              <li>• VITE_FIREBASE_STORAGE_BUCKET</li>
              <li>• VITE_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>• VITE_FIREBASE_APP_ID</li>
              <li>• VITE_FIREBASE_MEASUREMENT_ID</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!isFirebaseReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Initializing OnlyFarmers...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}