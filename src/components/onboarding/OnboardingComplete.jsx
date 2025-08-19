
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Users, CheckCircle, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function OnboardingComplete({ user }) {
  const getPlanInfo = () => {
    switch (user.selected_plan) {
      case 'owner':
        return { title: 'Pet Owner Plus', price: '$4.99' };
      case 'sitter':
        return { title: 'Premium Sitter', price: '$14.99' };
      case 'both':
        return { title: 'Ultimate Plan', price: '$19.99' };
      default:
        return { title: 'PawfectRadar', price: 'Free' };
    }
  };

  const getAccountTypeInfo = () => {
    switch (user.user_type) {
      case 'sitter':
        return {
          icon: Star,
          title: 'Pet Sitter',
          color: 'from-blue-500 to-cyan-500',
          nextSteps: [
            'Complete your verification to build trust',
            'Add photos to your profile',
            'Set your availability schedule',
            'Start accepting booking requests'
          ]
        };
      case 'owner':
        return {
          icon: Heart,
          title: 'Pet Owner',
          color: 'from-pink-500 to-rose-500',
          nextSteps: [
            'Add your pets to your profile',
            'Browse verified sitters in your area',
            'Read reviews and ratings',
            'Book your first pet care service'
          ]
        };
      case 'both':
        return {
          icon: Users,
          title: 'Owner & Sitter',
          color: 'from-purple-500 to-indigo-500',
          nextSteps: [
            'Add your pets and complete verification',
            'Set up both your sitter and owner profiles',
            'Start browsing sitters and accepting bookings',
            'Maximize your earning potential'
          ]
        };
      default:
        return {
          icon: Heart,
          title: 'PawfectRadar User',
          color: 'from-gray-500 to-gray-600',
          nextSteps: ['Complete your profile', 'Explore the platform']
        };
    }
  };

  const accountInfo = getAccountTypeInfo();
  const planInfo = getPlanInfo();
  const AccountIcon = accountInfo.icon;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 text-center">
        <CardContent className="py-12">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${accountInfo.color} flex items-center justify-center mx-auto mb-6`}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to PawfectRadar! 🎉
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            Your account is all set up, {user.full_name?.split(' ')[0]}!
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <AccountIcon className="w-5 h-5" />
              <Badge className={`bg-gradient-to-r ${accountInfo.color} text-white border-0 px-4 py-1`}>
                {accountInfo.title}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-4 py-1">
                {planInfo.title} - {planInfo.price}/month
              </Badge>
            </div>
          </div>

          {/* Trial Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-8 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">🎁 7-Day Free Trial Started!</h3>
            <p className="text-sm text-green-700">
              Enjoy full access to all premium features. Your subscription will start at {planInfo.price}/month after the trial period.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Next Steps:</h3>
            <ul className="text-left space-y-2">
              {accountInfo.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={() => window.location.href = createPageUrl('Dashboard')}
          className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0 px-8 py-3 text-lg"
        >
          Start Your PawfectRadar Journey
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
