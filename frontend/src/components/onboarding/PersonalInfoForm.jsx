import { Card as CardIcon, CardContent as CardContentIcon, CardHeader as CardHeaderIcon, CardTitle as CardTitleIcon, User as UserIcon } from '@/lib/icons.js';

import { UploadFile } from "@/api/integrations";

export default function PersonalInfoForm({ formData, updateFormData, onNext, saving }) {
  const [uploading, setUploading] = React.useState(false);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      updateFormData({ profile_photo: file_url });
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
    setUploading(false);
  };

  const canProceed = formData.full_name && formData.phone && formData.location;

  return (
    <CardIcon className="shadow-lg border-0">
      <CardHeaderIcon>
        <CardTitleIcon className="flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          Tell Us About Yourself
        </CardTitleIcon>
      </CardHeaderIcon>
      <CardContentIcon className="space-y-6">
        {/* Profile Photo */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center overflow-hidden">
            {formData.profile_photo ? (
              <img src={formData.profile_photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xl">
                {formData.full_name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('photo-upload').click()}
              disabled={uploading}
            >
              <Camera className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Add Photo'}
            </Button>
            <p className="text-xs text-gray-600 mt-1">Optional but recommended</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => updateFormData({ full_name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateFormData({ location: e.target.value })}
              placeholder="City, State"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            placeholder="Tell others about yourself..."
            className="h-24"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => updateFormData({ emergency_contact_name: e.target.value })}
              placeholder="Emergency contact name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={(e) => updateFormData({ emergency_contact_phone: e.target.value })}
              placeholder="+1 (555) 987-6543"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            disabled={!canProceed || saving}
            className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
          >
            {saving ? 'Saving...' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContentIcon>
    </CardIcon>
  );
}