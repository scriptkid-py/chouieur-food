import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getSdks } from '@/firebase';
import { apiRequest } from '@/lib/api-config';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  role?: string;
}

export function useUserSync() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const { auth } = getSdks();
    
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function syncUserToGoogleSheets() {
      if (user && !loading && !error) {
        try {
          const userData: UserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
            role: 'customer' // Default role
          };

          console.log('🔄 Syncing user to Google Sheets:', userData);

          const response = await apiRequest<{
            success: boolean;
            message: string;
            user: UserData;
          }>('/api/users', {
            method: 'POST',
            body: JSON.stringify(userData)
          });

          if (response.success) {
            console.log('✅ User synced to Google Sheets successfully');
          } else {
            console.error('❌ Failed to sync user to Google Sheets:', response);
          }
        } catch (err) {
          console.error('❌ Error syncing user to Google Sheets:', err);
        }
      }
    }

    syncUserToGoogleSheets();
  }, [user, loading, error]);

  return { user, loading, error };
}
