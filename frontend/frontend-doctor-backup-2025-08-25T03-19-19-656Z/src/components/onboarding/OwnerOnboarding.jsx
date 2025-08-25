import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Heart as HeartIcon as HeartIcon } from 'lucide-react';

export default function OwnerOnboarding({ formData, updateFormData, onNext, onBack, saving }) {
  const canProceed = formData.preferred_payment_method;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartIcon className="w-5 h-5" />
            Pet Owner Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="preferred_payment_method">Preferred Payment Method *</Label>
              <Select value={formData.preferred_payment_method} onValueChange={(value) => updateFormData({ preferred_payment_method: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="How you prefer to pay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="apple_pay">Apple Pay</SelectItem>
                  <SelectItem value="google_pay">Google Pay</SelectItem>
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
                  <SelectItem value="flexible">Flexible based on sitter</SelectItem>
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
              placeholder="e.g., 4-6 hours daily, weekends only, occasional evenings"
            />
            <p className="text-xs text-gray-600">This helps sitters understand your typical needs</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requirements">Special Requirements or Preferences</Label>
            <Textarea
              id="special_requirements"
              value={formData.special_requirements}
              onChange={(e) => updateFormData({ special_requirements: e.target.value })}
              placeholder="e.g., must be comfortable with large dogs, non-smoker, experience with senior pets, etc."
              className="h-24"
            />
          </div>

          {/* Helpful Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">💡 Tips for Finding Great Sitters</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Look for sitters with verification badges</li>
              <li>• Read reviews from other pet owners</li>
              <li>• Consider meeting sitters before booking</li>
              <li>• Communicate your pet's specific needs clearly</li>
            </ul>
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