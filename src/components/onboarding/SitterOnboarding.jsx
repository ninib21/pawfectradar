
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Star, DollarSign, Clock, CreditCard } from "lucide-react";

export default function SitterOnboarding({ formData, updateFormData, onNext, onBack, saving, showOwnerFields = false }) {
  const handleServiceChange = (serviceId, checked) => {
    const currentServices = formData.sitter_services_offered || [];
    if (checked) {
      updateFormData({ sitter_services_offered: [...currentServices, serviceId] });
    } else {
      updateFormData({ sitter_services_offered: currentServices.filter(s => s !== serviceId) });
    }
  };

  const handlePaymentMethodChange = (methodId, checked) => {
    const currentMethods = formData.payment_methods || [];
    if (checked) {
      updateFormData({ payment_methods: [...currentMethods, methodId] });
    } else {
      updateFormData({ payment_methods: currentMethods.filter(m => m !== methodId) });
    }
  };

  const canProceed = formData.hourly_rate && formData.sitter_services_offered?.length > 0;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Sitter Profile Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => updateFormData({ hourly_rate: e.target.value })}
                  placeholder="25.00"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-600">Average rate in your area: $20-35/hour</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.experience_years}
                  onChange={(e) => updateFormData({ experience_years: e.target.value })}
                  placeholder="2.5"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Services Offered */}
          <div className="space-y-3">
            <Label>Services You Offer *</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'dog_walking', label: 'Dog Walking', desc: 'Exercise and outdoor activities' },
                { id: 'pet_sitting', label: 'Pet Sitting', desc: 'In-home pet care' },
                { id: 'overnight', label: 'Overnight Care', desc: 'Stay overnight with pets' },
                { id: 'daycare', label: 'Daycare', desc: 'Daytime pet supervision' }
              ].map(service => (
                <div key={service.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox 
                    id={service.id}
                    checked={formData.sitter_services_offered?.includes(service.id)}
                    onCheckedChange={(checked) => handleServiceChange(service.id, checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={service.id} className="cursor-pointer font-medium">
                      {service.label}
                    </Label>
                    <p className="text-xs text-gray-600">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label>How You'd Like to Be Paid</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'bank_transfer', label: 'Bank Transfer' },
                { id: 'paypal', label: 'PayPal' },
                { id: 'venmo', label: 'Venmo' },
                { id: 'cash_app', label: 'Cash App' },
                { id: 'chime', label: 'Chime' },
                { id: 'apple_pay', label: 'Apple Pay' }
              ].map(method => (
                <div key={method.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox 
                    id={method.id}
                    checked={formData.payment_methods?.includes(method.id)}
                    onCheckedChange={(checked) => handlePaymentMethodChange(method.id, checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={method.id} className="cursor-pointer font-medium text-sm">
                      {method.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner Fields for "Both" account type */}
      {showOwnerFields && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pet Owner Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="preferred_payment_method">Preferred Payment Method</Label>
                <Select value={formData.preferred_payment_method} onValueChange={(value) => updateFormData({ preferred_payment_method: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="How you prefer to pay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Typical Budget Range</Label>
                <Select value={formData.budget_range} onValueChange={(value) => updateFormData({ budget_range: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-25">$15-25/hour</SelectItem>
                    <SelectItem value="25-35">$25-35/hour</SelectItem>
                    <SelectItem value="35-50">$35-50/hour</SelectItem>
                    <SelectItem value="50+">$50+/hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typical_hours_needed">Typical Hours Needed</Label>
              <Input
                id="typical_hours_needed"
                value={formData.typical_hours_needed}
                onChange={(e) => updateFormData({ typical_hours_needed: e.target.value })}
                placeholder="e.g., 4-6 hours daily, weekends only, etc."
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canProceed || saving}
          className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
        >
          {saving ? 'Creating Account...' : 'Complete Setup'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
