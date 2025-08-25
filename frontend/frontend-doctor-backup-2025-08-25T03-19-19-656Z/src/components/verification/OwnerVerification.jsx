import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon as UploadIcon, CheckCircle as CheckCircleIcon as CheckCircleIcon as CheckCircleIcon, Camera, FileText, Heart as HeartIcon as HeartIcon, Clock, Shield as ShieldIcon as ShieldIcon as ShieldIcon } from 'lucide-react';
import { UploadFile } from "@/api/integrations";

export default function OwnerVerification({ user, onSave, saving }) {
  const [formData, setFormData] = useState({
    id_document_url: user?.id_document_url || "",
    selfie_match_url: user?.selfie_match_url || "",
    pet_vaccination_records_url: user?.pet_vaccination_records_url || "",
    intro_video_url: user?.intro_video_url || "",
    voice_intro_url: user?.voice_intro_url || "",
    verification_status: user?.verification_status || "not_requested",
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

  const calculateProgress = () => {
    let completed = 0;
    const total = 6;
    
    if (user?.email && user?.phone_verified) completed++;
    if (formData.id_document_url) completed++;
    if (formData.selfie_match_url) completed++;
    if (user?.payment_method_on_file) completed++;
    if (user?.emergency_contact_setup) completed++;
    if (formData.pet_vaccination_records_url) completed++;
    
    return (completed / total) * 100;
  };

  const getTrustTier = () => {
    const hasBasic = user?.email && user?.phone_verified && formData.id_document_url;
    const hasTrusted = hasBasic && user?.total_bookings > 0 && user?.payment_method_on_file;
    const hasElite = hasTrusted && user?.repeat_client_percentage > 50 && user?.emergency_contact_setup && formData.intro_video_url;
    
    if (hasElite) return { tier: "Elite Owner", color: "bg-gradient-to-r from-purple-500 to-pink-500", icon: "💎" };
    if (hasTrusted) return { tier: "Trusted Owner", color: "bg-gradient-to-r from-green-400 to-green-600", icon: "🟢" };
    if (hasBasic) return { tier: "Verified Owner", color: "bg-gradient-to-r from-yellow-400 to-yellow-600", icon: "🟡" };
    return { tier: "Basic Owner", color: "bg-gray-400", icon: "⚫" };
  };

  const trustTier = getTrustTier();
  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Trust Tier Status */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center">
                <ShieldIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Owner Verification Status</CardTitle>
                <p className="text-sm text-gray-600">Build trust with sitters and unlock platform benefits</p>
              </div>
            </div>
            <Badge className={`${trustTier.color} text-white border-0 px-4 py-2 text-base`}>
              {trustTier.icon} {trustTier.tier}
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
            
            {/* Trust Benefits */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Priority booking responses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Access to elite sitters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Lower platform fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Premium support</span>
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
            Required Verification Steps
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
                <p className="text-sm text-gray-600">Confirms your real identity and prevents spam</p>
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
                  <p className="text-sm text-gray-600">Driver's license, passport, or state ID</p>
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
                id="id-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('id-upload').click()}
                disabled={uploading.id_document_url}
                className="border-gray-200 hover:bg-gray-50"
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                {uploading.id_document_url ? 'Uploading...' : 'Upload ID Document'}
              </Button>
              {formData.id_document_url && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Document uploaded
                </span>
              )}
            </div>
          </div>

          {/* Selfie Match */}
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
                  <h3 className="font-semibold">Selfie Verification (Optional)</h3>
                  <p className="text-sm text-gray-600">Confirms the ID photo belongs to you</p>
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
                id="selfie-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('selfie-upload').click()}
                disabled={uploading.selfie_match_url}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading.selfie_match_url ? 'Uploading...' : 'Take Selfie'}
              </Button>
              {formData.selfie_match_url && (
                <span className="text-sm text-blue-600 flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  Selfie uploaded
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Boosting Features */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartIcon className="w-5 h-5" />
            Trust Boosting Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pet Vaccination Records */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.pet_vaccination_records_url ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {formData.pet_vaccination_records_url ? 
                    <CheckCircleIcon className="w-5 h-5 text-green-600" /> :
                    <FileText className="w-5 h-5 text-gray-400" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold">Pet Vaccination Records</h3>
                  <p className="text-sm text-gray-600">Builds trust for in-home care visits</p>
                </div>
              </div>
              {formData.pet_vaccination_records_url && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  🏠 Safe Home
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload('pet_vaccination_records_url', e.target.files[0])}
                className="hidden"
                id="vaccination-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('vaccination-upload').click()}
                disabled={uploading.pet_vaccination_records_url}
                className="border-gray-200 hover:bg-gray-50"
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                {uploading.pet_vaccination_records_url ? 'Uploading...' : 'Upload Records'}
              </Button>
            </div>
          </div>

          {/* Video/Voice Intro */}
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
                  <h3 className="font-semibold">Video Introduction</h3>
                  <p className="text-sm text-gray-600">Introduce yourself and your pets to sitters</p>
                </div>
              </div>
              {formData.intro_video_url && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  📹 Video Ready
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload('intro_video_url', e.target.files[0])}
                className="hidden"
                id="video-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('video-upload').click()}
                disabled={uploading.intro_video_url}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading.intro_video_url ? 'Uploading...' : 'Upload Video Intro'}
              </Button>
            </div>
          </div>

          {/* Payment Method Status */}
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
                <h3 className="font-semibold">Payment Method on File</h3>
                <p className="text-sm text-gray-600">Reduces booking spam and pre-verifies legitimacy</p>
              </div>
            </div>
            <Badge className={user?.payment_method_on_file ? 
              "bg-green-100 text-green-800 border-green-200" : 
              "bg-yellow-100 text-yellow-800 border-yellow-200"
            }>
              {user?.payment_method_on_file ? "✅ Added" : "⏳ Pending"}
            </Badge>
          </div>

          {/* Emergency Contact Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user?.emergency_contact_name && user?.emergency_contact_phone ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {user?.emergency_contact_name && user?.emergency_contact_phone ? 
                  <CheckCircleIcon className="w-5 h-5 text-green-600" /> :
                  <Clock className="w-5 h-5 text-yellow-600" />
                }
              </div>
              <div>
                <h3 className="font-semibold">Emergency Contact Setup</h3>
                <p className="text-sm text-gray-600">Prepares the system for crisis alerts</p>
              </div>
            </div>
            <Badge className={user?.emergency_contact_name && user?.emergency_contact_phone ? 
              "bg-green-100 text-green-800 border-green-200" : 
              "bg-yellow-100 text-yellow-800 border-yellow-200"
            }>
              {user?.emergency_contact_name && user?.emergency_contact_phone ? "✅ Ready" : "⏳ Setup Required"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}