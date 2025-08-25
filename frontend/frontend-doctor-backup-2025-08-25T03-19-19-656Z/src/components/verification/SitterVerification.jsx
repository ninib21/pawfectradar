import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon as UploadIcon, CheckCircle as CheckCircleIcon as CheckCircleIcon as CheckCircleIcon, Camera, FileText, Heart as HeartIcon as HeartIcon, Clock, Shield as ShieldIcon as ShieldIcon as ShieldIcon, Award } from 'lucide-react';
import { UploadFile } from "@/api/integrations";

export default function SitterVerification({ user, onSave, saving }) {
  const [formData, setFormData] = useState({
    id_document_url: user?.id_document_url || "",
    selfie_match_url: user?.selfie_match_url || "",
    cpr_certificate_url: user?.cpr_certificate_url || "",
    first_aid_certificate_url: user?.first_aid_certificate_url || "",
    home_tour_url: user?.home_tour_url || "",
    intro_video_url: user?.intro_video_url || "",
    social_media_link: user?.social_media_link || "",
    verification_status: user?.verification_status || "not_requested",
    background_check_status: user?.background_check_status || "not_requested",
    selfie_match_status: user?.selfie_match_status || "not_submitted"
  });
  
  const [uploading, setUploading] = useState({});

  const handleFileUpload = async (field, file) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
      await onSave({ [field]: file_url });
    } catch (error) {
      console.error(`Error uploading ${field}:`, error);
    }
    setUploading(prev => ({ ...prev, [field]: false }));
  };

  const handleSubmitVerification = async () => {
    const verificationData = {
      ...formData,
      verification_status: 'pending',
      background_check_status: 'pending',
      verification_requested_date: new Date().toISOString()
    };
    await onSave(verificationData);
  };

  const calculateProgress = () => {
    let completed = 0;
    const total = 8;
    
    if (user?.email && user?.phone_verified) completed++;
    if (formData.id_document_url) completed++;
    if (formData.selfie_match_url) completed++;
    if (user?.background_check_status === 'passed') completed++;
    if (user?.payment_method_on_file) completed++;
    if (formData.cpr_certificate_url) completed++;
    if (formData.intro_video_url) completed++;
    if (formData.home_tour_url) completed++;
    
    return (completed / total) * 100;
  };

  const getSitterTier = () => {
    const hasID = formData.id_document_url && user?.verification_status === 'verified';
    const hasBackground = user?.background_check_status === 'passed';
    const hasElite = hasBackground && formData.cpr_certificate_url && formData.intro_video_url && (user?.rating || 0) >= 4.5;
    
    if (hasElite) return { tier: "Elite Verified Sitter", color: "bg-gradient-to-r from-purple-500 to-pink-500", icon: "💎" };
    if (hasBackground) return { tier: "Background Passed", color: "bg-gradient-to-r from-green-400 to-green-600", icon: "🟢" };
    if (hasID) return { tier: "ID Verified", color: "bg-gradient-to-r from-yellow-400 to-yellow-600", icon: "🟡" };
    return { tier: "Pending Verification", color: "bg-gray-400", icon: "🟠" };
  };

  const sitterTier = getSitterTier();
  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Sitter Tier Status */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center">
                <ShieldIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Sitter Verification Status</CardTitle>
                <p className="text-sm text-gray-600">Build trust with pet owners and unlock premium features</p>
              </div>
            </div>
            <Badge className={`${sitterTier.color} text-white border-0 px-4 py-2 text-base`}>
              {sitterTier.icon} {sitterTier.tier}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Verification Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            {/* Verification Benefits */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Higher search ranking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Premium booking priority</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Increased booking rates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Trust badge display</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Verification Steps */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Core Required Verification Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email & Phone */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Email & Phone Verification</h3>
                <p className="text-sm text-gray-600">Access and accountability confirmation</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ✅ Verified
            </Badge>
          </div>

          {/* Government ID Upload */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.id_document_url ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {formData.id_document_url ? 
                    <CheckCircleIcon className="w-5 h-5 text-green-600" /> :
                    <UploadIcon className="w-5 h-5 text-gray-400" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold">Government ID Upload</h3>
                  <p className="text-sm text-gray-600">Legal identity confirmation required</p>
                </div>
              </div>
              {formData.id_document_url && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  ✅ Uploaded
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload('id_document_url', e.target.files[0])}
                className="hidden"
                id="sitter-id-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('sitter-id-upload').click()}
                disabled={uploading.id_document_url}
                className="border-gray-200 hover:bg-gray-50"
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                {uploading.id_document_url ? 'Uploading...' : 'Upload ID Document'}
              </Button>
            </div>
          </div>

          {/* Selfie Match (Liveness Check) */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.selfie_match_url ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {formData.selfie_match_url ? 
                    <CheckCircleIcon className="w-5 h-5 text-green-600" /> :
                    <Camera className="w-5 h-5 text-gray-400" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold">Selfie Match (Liveness Check)</h3>
                  <p className="text-sm text-gray-600">Prevents stolen ID usage</p>
                </div>
              </div>
              {formData.selfie_match_url && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  📷 Submitted
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('selfie_match_url', e.target.files[0])}
                className="hidden"
                id="sitter-selfie-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('sitter-selfie-upload').click()}
                disabled={uploading.selfie_match_url}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading.selfie_match_url ? 'Uploading...' : 'Take Verification Selfie'}
              </Button>
            </div>
          </div>

          {/* Background Check Status */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  user?.background_check_status === 'passed' ? 'bg-green-100' : 
                  user?.background_check_status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {user?.background_check_status === 'passed' ? 
                    <CheckCircleIcon className="w-5 h-5 text-green-600" /> :
                    user?.background_check_status === 'pending' ?
                    <Clock className="w-5 h-5 text-yellow-600" /> :
                    <ShieldIcon className="w-5 h-5 text-gray-400" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold">Background Check</h3>
                  <p className="text-sm text-gray-600">Criminal check verification</p>
                </div>
              </div>
              <Badge className={
                user?.background_check_status === 'passed' ? "bg-green-100 text-green-800 border-green-200" :
                user?.background_check_status === 'pending' ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                "bg-gray-100 text-gray-800 border-gray-200"
              }>
                {user?.background_check_status === 'passed' ? "✅ Passed" :
                 user?.background_check_status === 'pending' ? "⏳ Processing" :
                 "⏸️ Not Started"}
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Background check will be initiated automatically once ID verification is complete.
            </p>
          </div>

          {/* Payment/Payout Setup Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user?.payment_method_on_file ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {user?.payment_method_on_file ? 
                  <CheckCircleIcon className="w-5 h-5 text-green-600" /> :
                  <Clock className="w-5 h-5 text-yellow-600" />
                }
              </div>
              <div>
                <h3 className="font-semibold">Payment/Payout Setup</h3>
                <p className="text-sm text-gray-600">Required for receiving earnings</p>
              </div>
            </div>
            <Badge className={user?.payment_method_on_file ? 
              "bg-green-100 text-green-800 border-green-200" : 
              "bg-yellow-100 text-yellow-800 border-yellow-200"
            }>
              {user?.payment_method_on_file ? "✅ Setup" : "⏳ Required"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Trust Boosting Features */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Optional Trust Boosting Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CPR/First Aid Certificates */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.cpr_certificate_url || formData.first_aid_certificate_url ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {formData.cpr_certificate_url || formData.first_aid_certificate_url ? 
                    <CheckCircleIcon className="w-5 h-5 text-red-600" /> :
                    <HeartIcon className="w-5 h-5 text-gray-400" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold">CPR/First Aid Certificate Upload</h3>
                  <p className="text-sm text-gray-600">Earns you "Health Ready" badge</p>
                </div>
              </div>
              {(formData.cpr_certificate_url || formData.first_aid_certificate_url) && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  🧪 Health Certified
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload('cpr_certificate_url', e.target.files[0])}
                  className="hidden"
                  id="cpr-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('cpr-upload').click()}
                  disabled={uploading.cpr_certificate_url}
                  className="w-full border-gray-200 hover:bg-gray-50"
                  size="sm"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  {uploading.cpr_certificate_url ? 'Uploading...' : 'CPR Certificate'}
                </Button>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload('first_aid_certificate_url', e.target.files[0])}
                  className="hidden"
                  id="first-aid-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('first-aid-upload').click()}
                  disabled={uploading.first_aid_certificate_url}
                  className="w-full border-gray-200 hover:bg-gray-50"
                  size="sm"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  {uploading.first_aid_certificate_url ? 'Uploading...' : 'First Aid Certificate'}
                </Button>
              </div>
            </div>
          </div>

          {/* Home Safety Photo Tour */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.home_tour_url ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {formData.home_tour_url ? 
                    <CheckCircleIcon className="w-5 h-5 text-blue-600" /> :
                    <Camera className="w-5 h-5 text-gray-400" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold">Home Safety Photo Tour</h3>
                  <p className="text-sm text-gray-600">For in-home stays - owners can preview environment</p>
                </div>
              </div>
              {formData.home_tour_url && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  🏠 Safe Home Preview
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload('home_tour_url', e.target.files[0])}
                className="hidden"
                id="home-tour-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('home-tour-upload').click()}
                disabled={uploading.home_tour_url}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading.home_tour_url ? 'Uploading...' : 'Upload Home Tour'}
              </Button>
            </div>
          </div>

          {/* Intro Video */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.intro_video_url ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {formData.intro_video_url ? 
                    <CheckCircleIcon className="w-5 h-5 text-purple-600" /> :
                    <Camera className="w-5 h-5 text-gray-400" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold">Intro Video (30-60 seconds)</h3>
                  <p className="text-sm text-gray-600">Friendly, humanizing connection with pet parents</p>
                </div>
              </div>
              {formData.intro_video_url && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  📹 Intro Video Available
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload('intro_video_url', e.target.files[0])}
                className="hidden"
                id="intro-video-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('intro-video-upload').click()}
                disabled={uploading.intro_video_url}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading.intro_video_url ? 'Uploading...' : 'Upload Intro Video'}
              </Button>
            </div>
          </div>

          {/* Social Media Link */}
          <div className="space-y-2">
            <Label htmlFor="social_media_link">Social Media Link (Optional)</Label>
            <Input
              id="social_media_link"
              value={formData.social_media_link}
              onChange={(e) => setFormData(prev => ({ ...prev, social_media_link: e.target.value }))}
              placeholder="https://instagram.com/yourprofile"
              className="border-gray-200 focus:border-[#A2D4F5]"
            />
            <p className="text-xs text-gray-600">Builds transparency and trust with pet owners</p>
          </div>
        </CardContent>
      </Card>

      {/* Submit for Verification */}
      {formData.id_document_url && formData.selfie_match_url && user?.verification_status === 'not_requested' && (
        <Card className="shadow-lg border-2 border-[#A2D4F5]">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Submit for Verification!</h3>
            <p className="text-gray-600 mb-6">
              You've uploaded all required documents. Submit now to begin the verification process.
            </p>
            <Button
              onClick={handleSubmitVerification}
              disabled={saving}
              className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0 px-8 py-3 text-lg"
            >
              <ShieldIcon className="w-5 h-5 mr-2" />
              {saving ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}