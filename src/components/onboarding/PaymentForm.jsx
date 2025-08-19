import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, CreditCard, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

export default function PaymentForm({ formData, updateFormData, onNext, onBack, saving }) {
  const [showPasskey, setShowPasskey] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.card_number || !/^\d{16}$/.test(formData.card_number.replace(/\s/g, ''))) {
      newErrors.card_number = 'Enter a valid 16-digit card number.';
    }
    if (!formData.expiry_date || !/^(0[1-9]|1[0-2])\s*\/\s*([2-9][0-9])$/.test(formData.expiry_date)) {
      newErrors.expiry_date = 'Enter a valid MM/YY date.';
    }
    if (!formData.cvc || !/^\d{3,4}$/.test(formData.cvc)) {
      newErrors.cvc = 'Enter a valid CVC.';
    }
    if (!formData.card_name || formData.card_name.trim().length < 2) {
      newErrors.card_name = 'Name on card is required.';
    }
    if (!formData.payment_passkey || !/^[a-zA-Z0-9]{4}$/.test(formData.payment_passkey)) {
      newErrors.payment_passkey = 'Passkey must be exactly 4 letters or numbers.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNextClick = () => {
    if (validate()) {
      onNext();
    }
  };
  
  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription Payment
          </CardTitle>
          <CardDescription>
            Your 7-day free trial will start today. We'll only charge your card after the trial ends.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="card_name">Name on Card</Label>
            <Input
              id="card_name"
              value={formData.card_name || ''}
              onChange={(e) => updateFormData({ card_name: e.target.value })}
              placeholder="e.g. Jane Doe"
            />
            {errors.card_name && <p className="text-red-500 text-xs">{errors.card_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="card_number">Card Number</Label>
            <Input
              id="card_number"
              value={formatCardNumber(formData.card_number || '')}
              onChange={(e) => updateFormData({ card_number: e.target.value.replace(/\s/g, '') })}
              placeholder="0000 0000 0000 0000"
              maxLength="19"
            />
            {errors.card_number && <p className="text-red-500 text-xs">{errors.card_number}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                value={formatExpiryDate(formData.expiry_date || '')}
                onChange={(e) => updateFormData({ expiry_date: e.target.value })}
                placeholder="MM/YY"
                maxLength="5"
              />
              {errors.expiry_date && <p className="text-red-500 text-xs">{errors.expiry_date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                type="password"
                value={formData.cvc || ''}
                onChange={(e) => updateFormData({ cvc: e.target.value })}
                placeholder="123"
                maxLength="4"
              />
              {errors.cvc && <p className="text-red-500 text-xs">{errors.cvc}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Create Security Passkey
          </CardTitle>
          <CardDescription>
            This 4-character passkey will be used to authorize changes to your payment and payout methods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="payment_passkey">4-Character Passkey (letters or numbers)</Label>
            <div className="relative">
              <Input
                id="payment_passkey"
                type={showPasskey ? "text" : "password"}
                value={formData.payment_passkey || ''}
                onChange={(e) => updateFormData({ payment_passkey: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })}
                placeholder="e.g. PAWS"
                maxLength="4"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.payment_passkey && <p className="text-red-500 text-xs">{errors.payment_passkey}</p>}
          </div>
          <div className="mt-4 flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
              <p className="text-xs text-blue-700">Do not forget this passkey. You will need it to manage your financial settings.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={handleNextClick}
          disabled={saving}
          className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
        >
          {saving ? 'Processing...' : 'Continue to Profile Setup'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}