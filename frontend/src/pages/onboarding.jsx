import { Heart as HeartIcon } from '@/lib/icons.js';

import React, { useState, useEffect } from 'react';

import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Import Badge component

import AccountTypeSelection from "../components/onboarding/AccountTypeSelection";
import PersonalInfoForm from "../components/onboarding/PersonalInfoForm";
import PaymentForm from "../components/onboarding/PaymentForm";
import SitterOnboarding from "../components/onboarding/SitterOnboarding";
import OwnerOnboarding from "../components/onboarding/OwnerOnboarding";
import OnboardingComplete from "../components/onboarding/OnboardingComplete";

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    profile_photo: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    
    // Account Type & Subscription
    user_type: '', 
    selected_plan: '',
    subscription_price: 0,
    
    // Sitter-specific
    hourly_rate: '',
    experience_years: '',
    sitter_services_offered: [],
    payment_methods: [],
    availability: [],
    
    // Owner-specific
    preferred_payment_method: '',
    typical_hours_needed: '',
    budget_range: '',
    special_requirements: '',

    // Payment & Security Fields
    payment_passkey: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Special handling ONLY for the specific admin account to always start fresh for testing
      if (currentUser.role === 'admin' && currentUser.email === 'ninibarnez@gmail.com') {
        setCurrentStep(1);
        setFormData({ // Reset form data for a clean testing slate
          full_name: '',
          phone: '',
          location: '',
          bio: '',
          profile_photo: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          user_type: '',
          selected_plan: '',
          subscription_price: 0,
          hourly_rate: '',
          experience_years: '',
          sitter_services_offered: [],
          payment_methods: [],
          availability: [],
          preferred_payment_method: '',
          typical_hours_needed: '',
          budget_range: '',
          special_requirements: '',
          payment_passkey: ''
        });
        setLoading(false);
        return;
      }
      
      // For ALL other admin users, bypass onboarding and redirect to dashboard
      if (currentUser.role === 'admin') {
          window.location.href = createPageUrl('Dashboard');
          return;
      }
      
      // For regular users, pre-fill with existing data and determine step
      const initialFormData = {
        ...formData,
        full_name: currentUser.full_name || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        bio: currentUser.bio || '',
        profile_photo: currentUser.profile_photo || '',
        emergency_contact_name: currentUser.emergency_contact_name || '',
        emergency_contact_phone: currentUser.emergency_contact_phone || '',
        user_type: currentUser.user_type || '',
        selected_plan: currentUser.selected_plan || '',
        subscription_price: currentUser.subscription_price || 0,
        hourly_rate: currentUser.hourly_rate || '',
        experience_years: currentUser.experience_years || '',
        sitter_services_offered: currentUser.sitter_services_offered || [],
        payment_methods: currentUser.payment_methods || [],
        availability: currentUser.availability || [],
        preferred_payment_method: currentUser.preferred_payment_method || '',
        typical_hours_needed: currentUser.typical_hours_needed || '',
        budget_range: currentUser.budget_range || '',
        special_requirements: currentUser.special_requirements || '',
        payment_passkey: currentUser.payment_passkey || ''
      };
      setFormData(initialFormData);

      // Determine which step to start on for regular users
      if (currentUser.phone && currentUser.selected_plan && (currentUser.payment_passkey || currentUser.subscription_status === 'active')) {
         window.location.href = createPageUrl('Dashboard');
         return;
      } else if (currentUser.phone && currentUser.selected_plan) {
        setCurrentStep(3); // Jump to payment
      } else if (currentUser.phone) {
        setCurrentStep(2); // Jump to account type selection
      } else {
        setCurrentStep(1); // Start from personal info
      }
    } catch (error) {
      console.error("User not authenticated, redirecting to login:", error);
      window.location.href = createPageUrl('developer-access');
    }
    setLoading(false);
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    setSaving(true);
    
    // Admin role check to bypass payment step ONLY for specific admin
    if (currentStep === 2 && user && user.role === 'admin' && user.email === 'ninibarnez@gmail.com') {
      // For the specific admin, skip the payment step (3) and go directly to profile setup (4)
      await User.updateMyUserData(formData); // Save data from current step (AccountTypeSelection)
      setCurrentStep(4); // Move directly to step 4
      setSaving(false);
      return; // Exit function early
    }

    try {
      if (currentStep === 3) { // After payment step for regular users
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        await User.updateMyUserData({
          ...formData,
          subscription_status: 'trial',
          trial_end_date: trialEndDate.toISOString(),
        });
      } else {
        await User.updateMyUserData(formData);
      }
      
      if (currentStep === 5) {
        window.location.href = createPageUrl('Dashboard');
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error saving user data:", error);
    }
    
    setSaving(false);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5]"></div>
      </div>
    );
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Personal Information";
      case 2: return "Choose Your Plan";
      case 3: return "Secure Payment & Passkey";
      case 4: return formData.user_type === 'sitter' ? "Sitter Profile" : 
                    formData.user_type === 'owner' ? "Owner Preferences" : "Profile Setup";
      case 5: return "Welcome to PawfectRadar!";
      default: return "Getting Started";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-xl flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#7DB9E8] to-[#F8A7C0] bg-clip-text text-transparent">
              PawfectRadar
            </span>
            {/* Show admin indicator for testing (only for ninibarnez@gmail.com) */}
            {user?.role === 'admin' && user?.email === 'ninibarnez@gmail.com' && (
              <Badge className="bg-yellow-500 text-white">
                Admin Testing Mode
              </Badge>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of 5</span>
            <span>{Math.round((currentStep / 5) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getStepTitle()}
          </h1>
          <p className="text-gray-600">
            {currentStep === 1 && "Let's start with some basic information about you"}
            {currentStep === 2 && "How would you like to use PawfectRadar? All plans come with a 7-day free trial."}
            {currentStep === 3 && "Secure your account and enter payment details for after your trial ends."}
            {currentStep === 4 && "Let's set up your profile to get you started"}
            {currentStep === 5 && "You're all set! Welcome to the PawfectRadar community"}
          </p>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 1 && (
            <PersonalInfoForm 
              formData={formData} 
              updateFormData={updateFormData}
              onNext={handleNext}
              saving={saving}
            />
          )}
          
          {currentStep === 2 && (
            <AccountTypeSelection 
              user={user} // Pass the full user object
              formData={formData} 
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              saving={saving}
            />
          )}

          {currentStep === 3 && (
            <PaymentForm
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              saving={saving}
            />
          )}
          
          {currentStep === 4 && (
            <>
              {formData.user_type === 'sitter' && (
                <SitterOnboarding 
                  formData={formData} 
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                  saving={saving}
                />
              )}
              
              {formData.user_type === 'owner' && (
                <OwnerOnboarding 
                  formData={formData} 
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                  saving={saving}
                />
              )}
              
              {formData.user_type === 'both' && (
                <SitterOnboarding 
                  formData={formData} 
                  updateFormData={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                  saving={saving}
                  showOwnerFields={true}
                />
              )}
            </>
          )}
          
          {currentStep === 5 && (
            <OnboardingComplete 
              user={{ ...user, ...formData }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
