

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Menu, LogOut, Bell as BellIcon as BellIcon // Import Bell, Heart as HeartIcon as HeartIcon, X as XIcon as XIcon, MessageCircle } from 'lucide-react';
import ChatbotAssistant from "../components/ChatbotAssistant";
import NotificationBell from "../components/notifications/NotificationBell"; // Import NotificationBell

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const checkAuth = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      // User not authenticated, which is fine for public pages.
      console.log("User not authenticated");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      window.location.href = createPageUrl("Landing");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const hasCompletedOnboarding = (user) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.user_type && user.phone && user.location && user.selected_plan && user.payment_passkey;
  };

  const isPublicPage = ["Landing", "AdminLogin", "onboarding", "developer-access"].includes(currentPageName);
  const showNav = user && hasCompletedOnboarding(user) && !isPublicPage;

  // Handle redirects for protected pages
  useEffect(() => {
    if (loading || isPublicPage) return;

    if (!user) {
      window.location.href = createPageUrl("developer-access");
    } else if (!hasCompletedOnboarding(user)) {
      window.location.href = createPageUrl("onboarding");
    }
  }, [loading, user, isPublicPage, currentPageName]);

  if (!isPublicPage && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5]"></div>
      </div>
    );
  }
  
  const navigationItems = [
    { name: "Dashboard", href: createPageUrl("Dashboard"), icon: Home, current: currentPageName === "Dashboard" },
    { name: "My Pets", href: createPageUrl("Pets"), icon: PawPrint, current: currentPageName === "Pets" },
    { name: "Find Sitters", href: createPageUrl("Sitters"), icon: Users, current: currentPageName === "Sitters" },
    { name: "My Bookings", href: createPageUrl("Bookings"), icon: Calendar, current: currentPageName === "Bookings" },
    { name: "Profile", href: createPageUrl("Profile"), icon: UserIcon, current: currentPageName === "Profile" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {showNav && (
        <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Admin Badge (if applicable) */}
              <div className="flex items-center gap-4">
                <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-xl flex items-center justify-center">
                    <HeartIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#7DB9E8] to-[#F8A7C0] bg-clip-text text-transparent">
                    PawfectRadar
                  </span>
                </Link>
                {/* Show admin indicator for testing ONLY for specific admin */}
                {user?.role === 'admin' && user?.email === 'ninibarnez@gmail.com' && (
                  <Badge className="bg-yellow-500 text-white">
                    Creator Testing Mode
                  </Badge>
                )}
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      item.current
                        ? 'bg-gradient-to-r from-[#A2D4F5]/20 to-[#FBC3D2]/20 text-[#7DB9E8]'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                {user && <NotificationBell user={user} />}
                {user && (
                  <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{user.full_name || 'User'}</p>
                        <p className="text-gray-600 text-xs">
                          {user.user_type === 'both' ? 'Owner & Sitter' : 
                           user.user_type === 'sitter' ? 'Sitter' : 'Pet Owner'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 py-4">
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                        item.current
                          ? 'bg-gradient-to-r from-[#A2D4F5]/20 to-[#FBC3D2]/20 text-[#7DB9E8]'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  ))}
                  
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* AI Assistant Button - Always available */}
      <Button
        onClick={() => setChatbotOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 z-30"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chatbot Assistant - Always available */}
      <ChatbotAssistant
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        user={user}
      />
    </div>
  );
}

