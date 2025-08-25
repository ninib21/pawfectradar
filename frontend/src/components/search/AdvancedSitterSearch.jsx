import { Calendar as CalendarIcon, DollarSign as DollarSignIcon, Filter as FilterIcon, MapPin as MapPinIcon, Star as StarIcon, X as XIcon } from '@/lib/icons.js';
import React, { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export default function AdvancedSitterSearch({ onFiltersChange, currentFilters = {} }) {
  const [filters, setFilters] = useState({
    location: '',
    maxDistance: 10,
    minRate: 0,
    maxRate: 100,
    minRating: 0,
    availableDate: null,
    availableTime: '',
    serviceTypes: [],
    verificationLevel: '',
    experience: '',
    instantBook: false,
    ...currentFilters
  });

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleServiceType = (service) => {
    const current = filters.serviceTypes || [];
    const updated = current.includes(service) 
      ? current.filter(s => s !== service)
      : [...current, service];
    updateFilter('serviceTypes', updated);
  };

  const clearFilters = () => {
    const clearedFilters = {
      location: '',
      maxDistance: 10,
      minRate: 0,
      maxRate: 100,
      minRating: 0,
      availableDate: null,
      availableTime: '',
      serviceTypes: [],
      verificationLevel: '',
      experience: '',
      instantBook: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    (Array.isArray(value) && value.length > 0) ||
    (typeof value === 'string' && value !== '') ||
    (typeof value === 'number' && value !== 0 && value !== 10 && value !== 100) ||
    (typeof value === 'boolean' && value) ||
    value !== null
  );

  const serviceOptions = [
    { id: 'dog_walking', label: 'Dog Walking', icon: '🚶' },
    { id: 'pet_sitting', label: 'Pet Sitting', icon: '🏠' },
    { id: 'overnight', label: 'Overnight Care', icon: '🌙' },
    { id: 'daycare', label: 'Daycare', icon: '☀️' }
  ];

  return (
    <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5" />
            Advanced Search
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XIcon className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location & Distance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" />
              Location
            </Label>
            <Input
              placeholder="City, ZIP code, or address"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Max Distance: {filters.maxDistance} miles</Label>
            <Slider
              value={[filters.maxDistance]}
              onValueChange={([value]) => updateFilter('maxDistance', value)}
              max={50}
              min={1}
              step={1}
              className="mt-2"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <DollarSignIcon className="w-4 h-4" />
            Hourly Rate Range
          </Label>
          <div className="px-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>${filters.minRate}</span>
              <span>${filters.maxRate}+</span>
            </div>
            <div className="relative">
              <Slider
                value={[filters.minRate, filters.maxRate]}
                onValueChange={([min, max]) => {
                  updateFilter('minRate', min);
                  updateFilter('maxRate', max);
                }}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <StarIcon className="w-4 h-4" />
            Minimum Rating
          </Label>
          <Select value={filters.minRating.toString()} onValueChange={(value) => updateFilter('minRating', parseFloat(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any rating</SelectItem>
              <SelectItem value="3">3+ stars</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="4.5">4.5+ stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Available Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {filters.availableDate ? format(filters.availableDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarIcon
                  mode="single"
                  selected={filters.availableDate}
                  onSelect={(date) => updateFilter('availableDate', date)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Preferred Time</Label>
            <Select value={filters.availableTime} onValueChange={(value) => updateFilter('availableTime', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Any time</SelectItem>
                <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
                <SelectItem value="evening">Evening (6 PM - 10 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Service Types */}
        <div className="space-y-3">
          <Label>Services Needed</Label>
          <div className="grid grid-cols-2 gap-2">
            {serviceOptions.map(service => (
              <div key={service.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={service.id}
                  checked={filters.serviceTypes?.includes(service.id)}
                  onCheckedChange={() => toggleServiceType(service.id)}
                />
                <Label htmlFor={service.id} className="cursor-pointer flex items-center gap-2">
                  <span>{service.icon}</span>
                  {service.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Verification Level</Label>
            <Select value={filters.verificationLevel} onValueChange={(value) => updateFilter('verificationLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Any verification</SelectItem>
                <SelectItem value="id_verified">ID Verified</SelectItem>
                <SelectItem value="background_passed">Background Passed</SelectItem>
                <SelectItem value="elite">Elite Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select value={filters.experience} onValueChange={(value) => updateFilter('experience', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Any experience</SelectItem>
                <SelectItem value="new">New sitter (0-1 years)</SelectItem>
                <SelectItem value="experienced">Experienced (2-5 years)</SelectItem>
                <SelectItem value="expert">Expert (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Options */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="instantBook"
            checked={filters.instantBook}
            onCheckedChange={(checked) => updateFilter('instantBook', checked)}
          />
          <Label htmlFor="instantBook" className="cursor-pointer">
            ⚡ Instant booking available
          </Label>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <Label className="text-sm font-medium mb-2 block">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {filters.location && (
                <Badge variant="secondary">📍 {filters.location}</Badge>
              )}
              {filters.maxDistance !== 10 && (
                <Badge variant="secondary">🚗 Within {filters.maxDistance} miles</Badge>
              )}
              {(filters.minRate > 0 || filters.maxRate < 100) && (
                <Badge variant="secondary">💰 ${filters.minRate}-${filters.maxRate}/hr</Badge>
              )}
              {filters.minRating > 0 && (
                <Badge variant="secondary">⭐ {filters.minRating}+ rating</Badge>
              )}
              {filters.serviceTypes?.map(service => (
                <Badge key={service} variant="secondary">
                  {serviceOptions.find(s => s.id === service)?.icon} {serviceOptions.find(s => s.id === service)?.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}