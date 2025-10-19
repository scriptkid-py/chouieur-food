'use client';

import { useUserSync } from '@/hooks/use-user-sync';

export function UserSync() {
  // This hook will automatically sync users to Google Sheets when they authenticate
  useUserSync();
  
  // This component doesn't render anything, it just handles the sync logic
  return null;
}
