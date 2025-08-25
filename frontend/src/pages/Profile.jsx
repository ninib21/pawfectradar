import { Calendar as CalendarIcon, Settings as SettingsIcon, Shield as ShieldIcon, Star as StarIcon, User as UserIcon } from '@/lib/icons.js';

import React, { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card"; // Added import for Card components

import ProfileForm from "../components/profile/ProfileForm";
import SitterSettings from "../components/profile/SitterSettings";
import AccountSettings from "../components/profile/AccountSettings";
import OwnerVerification from "../components/verification/OwnerVerification";
import SitterVerification from "../components/verification/SitterVerification";
import SitterCalendar from "../components/calendar/SitterCalendar"; // Added import for SitterCalendar

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const handleSaveProfile = async (profileData) => {
    setSaving(true);
    try {
      await User.updateMyUserData(profileData);
      await loadUser(); // Reload user data
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  const handleSaveSitterSettings = async (sitterData) => {
    setSaving(true);
    try {
      await User.updateMyUserData(sitterData);
      await loadUser(); // Reload user data
    } catch (error) {
      console.error("Error saving sitter settings:", error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your account, preferences, and {user?.user_type !== 'owner' ? 'sitter ' : ''}settings
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 mb-8">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A2D4F5] data-[state=active]:to-[#FBC3D2] data-[state=active]:text-white"
          >
            <UserIcon className="w-4 h-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger 
            value="verification" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A2D4F5] data-[state=active]:to-[#FBC3D2] data-[state=active]:text-white"
          >
            <ShieldIcon className="w-4 h-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger 
            value="sitter" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A2D4F5] data-[state=active]:to-[#FBC3D2] data-[state=active]:text-white"
          >
            <StarIcon className="w-4 h-4" />
            Sitter Profile
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A2D4F5] data-[state=active]:to-[#FBC3D2] data-[state=active]:text-white"
          >
            <CalendarIcon className="w-4 h-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger 
            value="account" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A2D4F5] data-[state=active]:to-[#FBC3D2] data-[state=active]:text-white"
          >
            <SettingsIcon className="w-4 h-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm 
            user={user} 
            onSave={handleSaveProfile} 
            saving={saving} 
          />
        </TabsContent>

        <TabsContent value="verification">
          {user?.user_type === 'sitter' || user?.user_type === 'both' ? (
            <SitterVerification 
              user={user} 
              onSave={handleSaveProfile} 
              saving={saving} 
            />
          ) : (
            <OwnerVerification 
              user={user} 
              onSave={handleSaveProfile} 
              saving={saving} 
            />
          )}
        </TabsContent>

        <TabsContent value="sitter">
          <SitterSettings 
            user={user} 
            onSave={handleSaveSitterSettings} 
            saving={saving} 
          />
        </TabsContent>

        <TabsContent value="calendar">
          {user?.user_type === 'sitter' || user?.user_type === 'both' ? (
            <SitterCalendar sitterId={user.id} />
          ) : (
            <Card className="shadow-lg border-0">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar Not Available</h3>
                <p className="text-gray-600">
                  Calendar management is only available for sitters. Switch to a sitter account to access scheduling features.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="account">
          <AccountSettings 
            user={user} 
            onSave={handleSaveProfile} 
            saving={saving} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
