import React, { useEffect } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function AdminLogin() {
  useEffect(() => {
    const initiateAdminLogin = async () => {
      try {
        // First, check if we're already logged in as an admin
        const currentUser = await User.me();
        if (currentUser && currentUser.role === 'admin') {
          // If already an admin, go straight to the onboarding flow
          window.location.href = createPageUrl('onboarding');
        } else {
          // If not, trigger login and redirect to onboarding upon success
          const onboardingUrl = new URL(createPageUrl('onboarding'), window.location.origin).href;
          await User.loginWithRedirect(onboardingUrl);
        }
      } catch (error) {
        // User is not authenticated, trigger login with onboarding redirect
        const onboardingUrl = new URL(createPageUrl('onboarding'), window.location.origin).href;
        await User.loginWithRedirect(onboardingUrl);
      }
    };

    initiateAdminLogin();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5] mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-800">Admin Access</h1>
        <p className="text-gray-600">Redirecting to secure login for testing...</p>
      </div>
    </div>
  );
}