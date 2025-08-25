import React, { useState, useEffect } from "react";
import { Heart as HeartIcon as HeartIcon } from 'lucide-react'
import { Pet, Booking, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BookingModal({ sitter, onClose }) {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [bookingData, setBookingData] = useState({
    service_type: "",
    start_date: "",
    end_date: "",
    location: "",
    pet_ids: [],
    special_requests: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUserAndPets();
  }, [loadUserAndPets]);

  const loadUserAndPets = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userPets = await Pet.filter({ owner_id: currentUser.id });
      setPets(userPets);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setLoading(false);
  };

  const updateBookingData = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const togglePetSelection = (petId) => {
    setBookingData(prev => ({
      ...prev,
      pet_ids: prev.pet_ids.includes(petId)
        ? prev.pet_ids.filter(id => id !== petId)
        : [...prev.pet_ids, petId]
    }));
  };

  const calculateTotal = () => {
    if (!bookingData.start_date || !bookingData.end_date) return 0;
    
    const start = new Date(bookingData.start_date);
    const end = new Date(bookingData.end_date);
    const hours = Math.max(1, (end - start) / (1000 * 60 * 60));
    const petMultiplier = Math.max(1, bookingData.pet_ids.length);
    
    return (hours * sitter.hourly_rate * petMultiplier).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await Booking.create({
        ...bookingData,
        owner_id: user.id,
        sitter_id: sitter.id,
        total_amount: parseFloat(calculateTotal()),
        status: "pending"
      });
      
      onClose();
      // Could show success message here
    } catch (error) {
      console.error("Error creating booking:", error);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5]"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {sitter.full_name?.charAt(0)}
              </span>
            </div>
            Book {sitter.full_name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type *</Label>
            <Select value={bookingData.service_type} onValueChange={(value) => updateBookingData('service_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog_walking">Dog Walking</SelectItem>
                <SelectItem value="pet_sitting">Pet Sitting</SelectItem>
                <SelectItem value="overnight">Overnight Care</SelectItem>
                <SelectItem value="daycare">Daycare</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date & Time *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={bookingData.start_date}
                onChange={(e) => updateBookingData('start_date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date & Time *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={bookingData.end_date}
                onChange={(e) => updateBookingData('end_date', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={bookingData.location}
              onChange={(e) => updateBookingData('location', e.target.value)}
              placeholder="Where should the service take place?"
              required
            />
          </div>

          {/* Pet Selection */}
          <div className="space-y-3">
            <Label>Select Pets *</Label>
            {pets.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="text-center py-6">
                  <HeartIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-600">No pets found. Please add your pets first.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pets.map(pet => (
                  <div key={pet.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`pet-${pet.id}`}
                      checked={bookingData.pet_ids.includes(pet.id)}
                      onCheckedChange={() => togglePetSelection(pet.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`pet-${pet.id}`} className="font-medium cursor-pointer">
                        {pet.name}
                      </Label>
                      <p className="text-sm text-gray-600">{pet.breed}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="special_requests">Special Requests</Label>
            <Textarea
              id="special_requests"
              value={bookingData.special_requests}
              onChange={(e) => updateBookingData('special_requests', e.target.value)}
              placeholder="Any special instructions or requests..."
              className="h-24"
            />
          </div>

          {/* Booking Summary */}
          <Card className="bg-gradient-to-r from-[#A2D4F5]/10 to-[#FBC3D2]/10">
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sitter Rate:</span>
                <span className="font-semibold">${sitter.hourly_rate}/hour</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Selected Pets:</span>
                <span className="font-semibold">{bookingData.pet_ids.length}</span>
              </div>
              {bookingData.start_date && bookingData.end_date && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">
                    {Math.max(1, Math.ceil((new Date(bookingData.end_date) - new Date(bookingData.start_date)) / (1000 * 60 * 60)))} hours
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-[#7DB9E8]">${calculateTotal()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || bookingData.pet_ids.length === 0}
              className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
            >
              {submitting ? 'Booking...' : 'Send Booking Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}