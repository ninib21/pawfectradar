
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle as CheckCircleIcon as CheckCircleIcon as CheckCircleIcon, Crown, Zap, ArrowRight } from 'lucide-react';

export default function AccountTypeSelection({ user, formData, updateFormData, onNext, onBack, saving }) {
  const [selectedCategory, setSelectedCategory] = useState('owner');

  // Creator bypass - ONLY for the specific admin email
  const handleCreatorBypass = () => {
    updateFormData({ 
      user_type: 'both', 
      selected_plan: 'both_premium',
      subscription_price: 0 // Free for creator
    });
    onNext();
  };

  const ownerPlans = [
    {
      id: 'owner_basic',
      title: 'Basic Owner',
      userType: 'owner',
      description: 'Essential features for pet parents',
      price: 9.99,
      icon: Heart,
      color: 'from-pink-400 to-pink-500',
      bgColor: 'from-pink-50 to-pink-100',
      features: [
        'Browse verified sitters',
        'Basic booking system',
        'In-app messaging',
        'Basic support',
        'Pet profile management',
        'Payment processing'
      ],
      popular: false
    },
    {
      id: 'owner_plus',
      title: 'Pet Owner Plus',
      userType: 'owner',
      description: 'Premium features for caring parents',
      price: 19.99,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-100',
      features: [
        'All Basic Owner features',
        'Access to Elite verified sitters',
        'Premium insurance coverage',
        'Live video call check-ins',
        'Priority booking support',
        '24/7 emergency assistance',
        'Detailed care reports',
        'GPS tracking'
      ],
      popular: true
    },
    {
      id: 'owner_premium',
      title: 'Premium Owner',
      userType: 'owner',
      description: 'Ultimate care for your pets',
      price: 29.99,
      icon: Crown,
      color: 'from-pink-600 to-rose-600',
      bgColor: 'from-pink-100 to-rose-100',
      features: [
        'All Pet Owner Plus features',
        'Dedicated account manager',
        'Unlimited premium sitters',
        'Advanced health monitoring',
        'Emergency vet consultation',
        'Custom care plans',
        'Priority customer success',
        'White-glove service'
      ],
      popular: false
    }
  ];

  const sitterPlans = [
    {
      id: 'sitter_basic',
      title: 'Basic Sitter',
      userType: 'sitter',
      description: 'Start your pet sitting business',
      price: 14.99,
      icon: Star,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'from-blue-50 to-blue-100',
      features: [
        'Create sitter profile',
        'Accept booking requests',
        'Basic verification',
        'In-app messaging',
        'Payment processing',
        'Basic support'
      ],
      popular: false
    },
    {
      id: 'sitter_pro',
      title: 'Professional Sitter',
      userType: 'sitter',
      description: 'Advanced tools for pros',
      price: 24.99,
      icon: Star,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-100',
      features: [
        'All Basic Sitter features',
        'Priority in booking requests',
        'Featured listing placement',
        'Advanced profile analytics',
        'Custom availability settings',
        'Enhanced verification badge',
        'Dedicated sitter support',
        'Marketing tools'
      ],
      popular: true
    },
    {
      id: 'sitter_elite',
      title: 'Elite Sitter',
      userType: 'sitter',
      description: 'Maximum earning potential',
      price: 39.99,
      icon: Crown,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'from-blue-100 to-cyan-100',
      features: [
        'All Professional Sitter features',
        'Premium listing spotlight',
        'Advanced business analytics',
        'Personal brand building',
        'Exclusive high-value clients',
        'Business development support',
        'Tax preparation assistance',
        'Elite sitter community access'
      ],
      popular: false
    }
  ];

  const bothPlans = [
    {
      id: 'both_starter',
      title: 'Dual Starter',
      userType: 'both',
      description: 'Owner & sitter essentials',
      price: 24.99,
      originalPrice: 34.98,
      icon: Users,
      color: 'from-purple-400 to-purple-500',
      bgColor: 'from-purple-50 to-purple-100',
      features: [
        'Basic Owner features',
        'Basic Sitter features',
        'Dual profile management',
        'Cross-platform syncing',
        'Combined messaging',
        'Unified payment system'
      ],
      popular: false,
      savings: 'Save $9.99/month!'
    },
    {
      id: 'both_premium',
      title: 'Premium Dual',
      userType: 'both',
      description: 'Complete platform access',
      price: 39.99,
      originalPrice: 54.98,
      icon: Zap,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-100',
      features: [
        'Pet Owner Plus features',
        'Professional Sitter features',
        'Advanced dual analytics',
        'Priority support both sides',
        'Maximum earning potential',
        'Premium customer success',
        'Cross-referral bonuses',
        'Exclusive community access'
      ],
      popular: true,
      savings: 'Save $15/month!'
    },
    {
      id: 'both_ultimate',
      title: 'Ultimate Dual',
      userType: 'both',
      description: 'The complete PawfectRadar experience',
      price: 59.99,
      originalPrice: 79.98,
      icon: Crown,
      color: 'from-purple-600 to-indigo-600',
      bgColor: 'from-purple-100 to-indigo-100',
      features: [
        'ALL Premium Owner features',
        'ALL Elite Sitter features',
        'White-glove service both sides',
        'Dedicated success manager',
        'VIP community access',
        'Advanced business tools',
        'Tax & legal consultation',
        'Personal branding support',
        'Unlimited everything'
      ],
      popular: false,
      savings: 'Save $20/month!'
    }
  ];

  const getCurrentPlans = () => {
    switch (selectedCategory) {
      case 'owner': return ownerPlans;
      case 'sitter': return sitterPlans;
      case 'both': return bothPlans;
      default: return ownerPlans;
    }
  };

  const canProceed = formData.user_type && formData.selected_plan;

  const handlePlanSelection = (planId, userType) => {
    const allPlans = [...ownerPlans, ...sitterPlans, ...bothPlans];
    const selectedPlan = allPlans.find(p => p.id === planId);
    updateFormData({ 
      user_type: userType, 
      selected_plan: planId,
      subscription_price: selectedPlan?.price || 0
    });
  };

  const categoryButtons = [
    { id: 'owner', label: 'Pet Owner', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { id: 'sitter', label: 'Pet Sitter', icon: Star, color: 'from-blue-500 to-cyan-500' },
    { id: 'both', label: 'Both', icon: Users, color: 'from-purple-500 to-indigo-500' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your PawfectRadar Plan
        </h2>
        <p className="text-gray-600">
          Select your role and find the perfect plan. All plans include a 7-day free trial.
        </p>
      </div>

      {/* Creator Bypass Button - ONLY for specific admin email */}
      {user && user.role === 'admin' && user.email === 'ninibarnez@gmail.com' && (
        <div className="text-center">
          <Button
            onClick={handleCreatorBypass}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 to-orange-600 text-white"
          >
            🚀 Creator Bypass - Skip to Profile Setup
          </Button>
          <p className="text-xs text-gray-500 mt-2">Creator access only</p>
        </div>
      )}

      {/* Category Selection */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 p-2 rounded-xl">
          {categoryButtons.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <category.icon className="w-5 h-5" />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {getCurrentPlans().map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all duration-300 border-2 relative overflow-hidden flex flex-col min-h-[650px] ${
              formData.selected_plan === plan.id 
                ? 'border-[#A2D4F5] shadow-2xl scale-105 bg-gradient-to-br from-white to-blue-50/30' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
            } ${plan.popular ? 'ring-2 ring-[#A2D4F5]/50' : ''}`}
            onClick={() => handlePlanSelection(plan.id, plan.userType)}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] text-white border-0 px-4 py-2 text-sm font-semibold z-10">
                ⭐ Most Popular
              </Badge>
            )}
            
            {plan.savings && (
              <Badge className="absolute -top-3 right-4 bg-green-500 text-white border-0 px-3 py-2 text-sm font-semibold z-10">
                {plan.savings.split('!')[0]}
              </Badge>
            )}

            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgColor} opacity-20`} />

            <CardHeader className="text-center pb-6 pt-8 px-8 relative z-10">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                <plan.icon className="w-10 h-10 text-white" />
              </div>
              
              <CardTitle className="text-2xl font-bold mb-2">{plan.title}</CardTitle>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                {plan.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ${plan.originalPrice}
                  </span>
                )}
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-600 text-lg">/month</span>
              </div>
              
              {plan.savings && (
                <p className="text-green-600 font-semibold text-sm">
                  {plan.savings}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="px-8 pb-8 relative z-10 flex flex-col flex-grow">
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {formData.selected_plan === plan.id && (
                <div className="mt-auto">
                  <Badge className="w-full justify-center bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] text-white border-0 py-3 text-base font-semibold">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Selected Plan
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Benefits */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-8 rounded-2xl">
        <h3 className="font-bold text-gray-900 mb-6 text-center text-lg">✨ Every Plan Includes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-gray-700 font-medium">Secure payments</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-gray-700 font-medium">Mobile app access</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-gray-700 font-medium">Real-time messaging</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-gray-700 font-medium">Customer support</span>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      {formData.selected_plan && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 border-2">
          <CardContent className="p-8">
            <h3 className="font-bold text-gray-900 mb-3 text-lg">💳 Billing Information</h3>
            <p className="text-gray-700 mb-4 text-base">
              Your subscription will begin after account setup. <strong>First 7 days free</strong>, then ${formData.subscription_price}/month.
            </p>
            <div className="flex items-center gap-3 text-gray-600">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="font-medium">Cancel anytime • No setup fees • Secure billing • Money-back guarantee</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-8 py-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canProceed || saving}
          className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0 px-8 py-3 text-lg font-semibold shadow-lg"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Setting up...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
