import React, { useEffect, useState } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function DeveloperAccess() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Check if user is already authenticated
        const currentUser = await User.me();
        
        // Check if a regular user has completed onboarding
        if (!currentUser.user_type || !currentUser.phone || !currentUser.location || !currentUser.payment_passkey) {
          window.location.href = createPageUrl('onboarding');
        } else {
          // User is fully set up, go to dashboard
          window.location.href = createPageUrl('Dashboard');
        }
      } catch (error) {
        // User is not authenticated, initiate login with standard onboarding redirect
        const onboardingUrl = new URL(createPageUrl('onboarding'), window.location.origin).href;
        await User.loginWithRedirect(onboardingUrl);
      }
    };

    checkAuthAndRedirect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5] mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-800">Welcome to PawfectRadar</h1>
        <p className="text-gray-600">Setting up your account...</p>
      </div>
    </div>
  );
}