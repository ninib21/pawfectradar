import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Star, DollarSign, Clock, Shield, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function SitterSettings({ user, onSave, saving }) {
  const [formData, setFormData] = useState({
    hourly_rate: user?.hourly_rate || "",
    experience_years: user?.experience_years || "",
    sitter_services_offered: user?.sitter_services_offered || [],
    id_document_url: user?.id_document_url || "",
    verification_status: user?.verification_status || "not_requested"
  });
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (serviceId, checked) => {
    const currentServices = formData.sitter_services_offered || [];
    if (checked) {
      handleInputChange('sitter_services_offered', [...currentServices, serviceId]);
    } else {
      handleInputChange('sitter_services_offered', currentServices.filter(s => s !== serviceId));
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingDocument(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('id_document_url', file_url);
    } catch (error) {
      console.error("Error uploading document:", error);
    }
    setUploadingDocument(false);
  };

  const handleSubmitVerification = async () => {
    const verificationData = {
      ...formData,
      verification_status: 'pending',
      verification_requested_date: new Date().toISOString()
    };
    await onSave(verificationData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sitterData = {
      ...formData,
      hourly_rate: parseFloat(formData.hourly_rate) || 0,
      experience_years: parseFloat(formData.experience_years) || 0
    };
    await onSave(sitterData);
  };

  if (user?.user_type === "owner") {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="text-center py-16">
          <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Not a Sitter Yet</h3>
          <p className="text-gray-600 mb-6">
            Change your account type to "Sitter" or "Both" to access sitter settings.
          </p>
          <Button 
            onClick={() => onSave({ user_type: "both" })}
            className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
          >
            Become a Sitter
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVerificationIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'pending': return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'declined': return <AlertCircle className="w-6 h-6 text-red-600" />;
      default: return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Section */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification & Trust
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Verification Status */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getVerificationIcon(formData.verification_status)}
              <div className="flex-1">
                <h3 className="font-semibold">Verification Status</h3>
                <p className="text-sm text-gray-600">
                  {formData.verification_status === 'verified' && 'Your account is verified and trusted by pet owners!'}
                  {formData.verification_status === 'pending' && 'Your verification is under review. We\'ll update you soon.'}
                  {formData.verification_status === 'declined' && 'Verification was declined. Please contact support.'}
                  {formData.verification_status === 'not_requested' && 'Complete verification to build trust with pet owners'}
                </p>
              </div>
              <Badge className={getVerificationStatusColor(formData.verification_status)}>
                {formData.verification_status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* ID Document Upload */}
          {formData.verification_status !== 'verified' && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-2 block">Identity Verification</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a clear photo of your government-issued ID (driver's license, passport, or state ID) to get verified.
                </p>
                
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="id-document-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('id-document-upload').click()}
                    disabled={uploadingDocument}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingDocument ? 'Uploading...' : 'Upload ID Document'}
                  </Button>
                  
                  {formData.id_document_url && (
                    <div className="flex items-center gap-2 text-green-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Document uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit for Verification */}
              {formData.id_document_url && formData.verification_status === 'not_requested' && (
                <Button
                  onClick={handleSubmitVerification}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 to-green-700 text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Submit for Verification
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sitter Profile Settings */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Sitter Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Display */}
            {user?.rating && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  <div>
                    <h3 className="font-semibold">Your Rating</h3>
                    <p className="text-sm text-gray-600">
                      Based on {user?.total_bookings || 0} completed bookings
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {user?.rating}/5
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                    placeholder="25.00"
                    className="pl-10"
                  />
                </div>
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
                    onChange={(e) => handleInputChange('experience_years', e.target.value)}
                    placeholder="2.5"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="space-y-3">
              <Label>Services I Offer</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'dog_walking', label: 'Dog Walking' },
                  { id: 'pet_sitting', label: 'Pet Sitting' },
                  { id: 'overnight', label: 'Overnight Care' },
                  { id: 'daycare', label: 'Daycare' }
                ].map(service => (
                  <div key={service.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox 
                      id={service.id}
                      checked={formData.sitter_services_offered?.includes(service.id)}
                      onCheckedChange={(checked) => handleServiceChange(service.id, checked)}
                    />
                    <Label htmlFor={service.id} className="cursor-pointer">
                      {service.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
              >
                <Star className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Update Sitter Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}