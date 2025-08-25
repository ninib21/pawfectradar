import React, { useEffect } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function DeveloperAccess() {
  useEffect(() => {
    const loginAndRedirect = async () => {
      try {
        // First, check if the user is already authenticated.
        await User.me();
        // If the above line doesn't throw an error, the user is logged in.
        // Redirect them straight to the dashboard.
        window.location.href = createPageUrl('Dashboard');
      } catch (error) {
        // If User.me() throws an error, the user is not authenticated.
        // We will initiate the login process, and tell it to redirect to the dashboard upon completion.
        
        // Construct the full URL for the dashboard page to ensure a correct redirect after login.
        const dashboardUrl = new URL(createPageUrl('Dashboard'), window.location.origin).href;
        
        // This will redirect the user to the Google login page.
        await User.loginWithRedirect(dashboardUrl);
      }
    };

    loginAndRedirect();
  }, []);

  // Render a simple loading state while the redirect happens.
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5] mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-800">Developer Access</h1>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}