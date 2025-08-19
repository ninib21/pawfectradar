
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Save, X } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function AddPetForm({ pet, onSubmit, onCancel, isEditing = false }) {
  const [formData, setFormData] = useState(pet || {
    name: "",
    breed: "",
    age: "",
    weight: "",
    photo: "",
    temperament: "",
    allergies: "",
    special_instructions: "",
    vaccinated: true,
    emergency_vet: ""
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('photo', file_url);
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const petData = {
      ...formData,
      age: parseFloat(formData.age) || 0,
      weight: parseFloat(formData.weight) || 0
    };
    
    await onSubmit(petData);
    setSubmitting(false);
  };

  return (
    <Card className="mb-8 shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          {isEditing ? 'Edit Pet' : 'Add New Pet'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Pet Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter pet's name"
                required
                className="border-gray-200 focus:border-[#A2D4F5]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="breed">Breed *</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                placeholder="e.g., Golden Retriever"
                required
                className="border-gray-200 focus:border-[#A2D4F5]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                min="0"
                step="0.1"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Age in years"
                className="border-gray-200 focus:border-[#A2D4F5]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Weight in pounds"
                className="border-gray-200 focus:border-[#A2D4F5]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperament">Temperament</Label>
              <Select value={formData.temperament} onValueChange={(value) => handleInputChange('temperament', value)}>
                <SelectTrigger className="border-gray-200 focus:border-[#A2D4F5]">
                  <SelectValue placeholder="Select temperament" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="shy">Shy</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="protective">Protective</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Photo Gallery Section */}
          <div className="space-y-2">
            <Label>Pet Photos</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <Input
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
                  className="border-gray-200 hover:bg-[#A2D4F5]/10"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Add Main Photo'}
                </Button>
                {formData.photo && (
                  <img src={formData.photo} alt="Pet" className="w-16 h-16 rounded-lg object-cover" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Upload a clear photo of your pet. You can add more photos later from your pet's profile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies & Medical Notes</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="Any allergies or medical conditions..."
                className="border-gray-200 focus:border-[#A2D4F5]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                value={formData.special_instructions}
                onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                placeholder="Special care instructions..."
                className="border-gray-200 focus:border-[#A2D4F5]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_vet">Emergency Veterinarian</Label>
            <Input
              id="emergency_vet"
              value={formData.emergency_vet}
              onChange={(e) => handleInputChange('emergency_vet', e.target.value)}
              placeholder="Emergency vet contact information"
              className="border-gray-200 focus:border-[#A2D4F5]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vaccinated"
              checked={formData.vaccinated}
              onCheckedChange={(checked) => handleInputChange('vaccinated', checked)}
            />
            <Label htmlFor="vaccinated">Pet is up to date with vaccinations</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-200 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploading}
              className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Saving...' : isEditing ? 'Update Pet' : 'Add Pet'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
