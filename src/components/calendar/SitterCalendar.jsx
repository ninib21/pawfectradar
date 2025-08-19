import React, { useState, useEffect } from 'react';
import { SitterAvailability, Booking, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

function TimeSlotEditor({ availability, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState({
    date: availability?.date || format(new Date(), 'yyyy-MM-dd'),
    start_time: availability?.start_time || '09:00',
    end_time: availability?.end_time || '17:00',
    recurring: availability?.recurring || false,
    service_types: availability?.service_types || [],
    is_available: availability?.is_available !== false
  });

  const serviceOptions = [
    { id: 'dog_walking', label: 'Dog Walking' },
    { id: 'pet_sitting', label: 'Pet Sitting' },
    { id: 'overnight', label: 'Overnight Care' },
    { id: 'daycare', label: 'Daycare' }
  ];

  const toggleServiceType = (serviceId) => {
    const current = formData.service_types;
    const updated = current.includes(serviceId)
      ? current.filter(id => id !== serviceId)
      : [...current, serviceId];
    setFormData({ ...formData, service_types: updated });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2 pt-8">
          <Checkbox
            id="recurring"
            checked={formData.recurring}
            onCheckedChange={(checked) => setFormData({ ...formData, recurring: checked })}
          />
          <Label htmlFor="recurring">Repeat weekly</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time</Label>
          <Input
            id="start_time"
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Available Services</Label>
        <div className="grid grid-cols-2 gap-2">
          {serviceOptions.map(service => (
            <div key={service.id} className="flex items-center space-x-2">
              <Checkbox
                id={service.id}
                checked={formData.service_types.includes(service.id)}
                onCheckedChange={() => toggleServiceType(service.id)}
              />
              <Label htmlFor={service.id} className="cursor-pointer">
                {service.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="available"
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
        <Label htmlFor="available">Available for booking</Label>
      </div>

      <div className="flex justify-between pt-4">
        <div>
          {availability && (
            <Button variant="destructive" onClick={() => onDelete(availability.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)}>
            {availability ? 'Update' : 'Add'} Availability
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SitterCalendar({ sitterId }) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    if (sitterId) {
      loadAvailabilityAndBookings();
    }
  }, [sitterId, currentWeek]);

  const loadAvailabilityAndBookings = async () => {
    try {
      const weekStart = format(startOfWeek(currentWeek), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(currentWeek), 'yyyy-MM-dd');
      
      const [availabilityData, bookingData] = await Promise.all([
        SitterAvailability.filter({ 
          sitter_id: sitterId,
          date: { $gte: weekStart, $lte: weekEnd }
        }),
        Booking.filter({ 
          sitter_id: sitterId,
          start_date: { $gte: weekStart + 'T00:00:00', $lte: weekEnd + 'T23:59:59' }
        })
      ]);
      
      setAvailability(availabilityData);
      setBookings(bookingData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const handleSaveAvailability = async (formData) => {
    try {
      const availabilityData = {
        sitter_id: sitterId,
        ...formData
      };

      if (editingSlot) {
        await SitterAvailability.update(editingSlot.id, availabilityData);
      } else {
        await SitterAvailability.create(availabilityData);
      }

      setShowEditor(false);
      setEditingSlot(null);
      loadAvailabilityAndBookings();
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  const handleDeleteAvailability = async (availabilityId) => {
    try {
      await SitterAvailability.delete(availabilityId);
      setShowEditor(false);
      setEditingSlot(null);
      loadAvailabilityAndBookings();
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek);
    const end = endOfWeek(currentWeek);
    return eachDayOfInterval({ start, end });
  };

  const getDayAvailability = (date) => {
    return availability.filter(slot => 
      isSameDay(parseISO(slot.date), date)
    );
  };

  const getDayBookings = (date) => {
    return bookings.filter(booking => 
      isSameDay(parseISO(booking.start_date), date)
    );
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigateWeek(-1)}>
                ← Previous
              </Button>
              <span className="font-medium">
                {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
              </span>
              <Button variant="outline" onClick={() => navigateWeek(1)}>
                Next →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayAvailability = getDayAvailability(day);
              const dayBookings = getDayBookings(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={index}
                  className={`p-3 border rounded-lg min-h-[120px] ${
                    isToday ? 'bg-gradient-to-br from-[#A2D4F5]/20 to-[#FBC3D2]/20 border-[#A2D4F5]' : 'bg-white'
                  }`}
                >
                  <div className="font-medium text-center mb-2">
                    <div className="text-xs text-gray-600">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-lg ${isToday ? 'text-[#7DB9E8] font-bold' : ''}`}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Availability Slots */}
                    {dayAvailability.map((slot, slotIndex) => (
                      <div
                        key={slotIndex}
                        className={`text-xs p-1 rounded cursor-pointer ${
                          slot.is_available 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                        onClick={() => {
                          setEditingSlot(slot);
                          setShowEditor(true);
                        }}
                      >
                        <div className="font-medium">
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <div className="opacity-75">
                          {slot.service_types?.length > 0 
                            ? slot.service_types.join(', ') 
                            : 'All services'}
                        </div>
                      </div>
                    ))}

                    {/* Bookings */}
                    {dayBookings.map((booking, bookingIndex) => (
                      <div
                        key={bookingIndex}
                        className="text-xs p-1 rounded bg-blue-100 text-blue-800"
                      >
                        <div className="font-medium">
                          {format(parseISO(booking.start_date), 'HH:mm')} - 
                          {format(parseISO(booking.end_date), 'HH:mm')}
                        </div>
                        <div className="opacity-75">
                          Booking #{booking.id.slice(-4)}
                        </div>
                      </div>
                    ))}

                    {/* Add Availability Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 text-xs"
                      onClick={() => {
                        setEditingSlot(null);
                        setShowEditor(true);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {availability.filter(slot => slot.is_available).length}
            </div>
            <div className="text-sm text-gray-600">Available Slots</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.length}
            </div>
            <div className="text-sm text-gray-600">This Week's Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {bookings.reduce((total, booking) => total + (booking.total_amount || 0), 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Week's Earnings ($)</div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Editor Modal */}
      {showEditor && (
        <Dialog open={true} onOpenChange={() => setShowEditor(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? 'Edit' : 'Add'} Availability
              </DialogTitle>
            </DialogHeader>
            <TimeSlotEditor
              availability={editingSlot}
              onSave={handleSaveAvailability}
              onCancel={() => setShowEditor(false)}
              onDelete={handleDeleteAvailability}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}