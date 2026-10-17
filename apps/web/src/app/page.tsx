'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Migrate legacy hash fragments like /#/simulator or redirect cleanly to /en
    router.replace('/en');
  }, [router]);

  return null;
}
