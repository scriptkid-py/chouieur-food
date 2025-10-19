import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/config';
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
  const [user, loading, error] = useAuthState(auth);

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
