import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon as SearchIcon, Filter } from 'lucide-react';

import SitterCard from "../components/sitters/SitterCard";
import AdvancedSitterSearch from "../components/search/AdvancedSitterSearch";
import BookingModal from "../components/sitters/BookingModal";
import EnhancedSitterProfile from "../components/sitters/EnhancedSitterProfile";

export default function Sitters() {
  const [sitters, setSitters] = useState([]);
  const [filteredSitters, setFilteredSitters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSitter, setSelectedSitter] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSitterProfile, setShowSitterProfile] = useState(false);
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
    instantBook: false
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSitters();
  }, [loadSitters]);

  useEffect(() => {
    filterSitters();
  }, [sitters, searchTerm, filters]);

  const loadSitters = async () => {
    try {
      // Enhanced demo data with more realistic profiles
      const sampleSitters = [
        {
          id: "1",
          full_name: "Sarah Johnson",
          location: "San Francisco, CA",
          bio: "Experienced pet sitter with 5 years of caring for dogs of all sizes. I love outdoor adventures and providing personalized care for each furry friend! I have experience with senior dogs and puppies alike.",
          hourly_rate: 25,
          rating: 4.9,
          verified: true,
          verification_status: 'verified',
          background_check_status: 'passed',
          total_bookings: 47,
          experience_years: 5,
          profile_photo: null,
          sitter_services_offered: ['dog_walking', 'pet_sitting', 'daycare'],
          payment_methods: ['paypal', 'venmo', 'bank_transfer'],
          cpr_certificate_url: 'cert1.pdf',
          intro_video_url: 'video1.mp4',
          repeat_client_percentage: 78,
          punctuality_percentage: 96,
          response_rate: 98
        },
        {
          id: "2", 
          full_name: "Mike Chen",
          location: "Los Angeles, CA",
          bio: "Professional dog walker and pet sitter with specialized training in animal behavior. I provide detailed care reports and photo updates. Your pets will be in expert hands!",
          hourly_rate: 30,
          rating: 4.8,
          verified: true,
          verification_status: 'verified',
          background_check_status: 'passed',
          total_bookings: 32,
          experience_years: 3,
          profile_photo: null,
          sitter_services_offered: ['dog_walking', 'pet_sitting'],
          payment_methods: ['paypal', 'cash_app'],
          cpr_certificate_url: 'cert2.pdf',
          repeat_client_percentage: 65,
          punctuality_percentage: 100,
          response_rate: 95,
          sitter_tier: 'elite'
        },
        {
          id: "3",
          full_name: "Emma Wilson", 
          location: "Seattle, WA",
          bio: "Loving pet sitter who treats every dog like family. Available for walks, overnight sitting, and emergency care. I send regular photo updates and detailed care logs.",
          hourly_rate: 22,
          rating: 5.0,
          verified: true,
          verification_status: 'verified',
          background_check_status: 'passed',
          total_bookings: 18,
          experience_years: 2,
          profile_photo: null,
          sitter_services_offered: ['dog_walking', 'pet_sitting', 'overnight'],
          payment_methods: ['venmo', 'apple_pay'],
          intro_video_url: 'video3.mp4',
          repeat_client_percentage: 89,
          punctuality_percentage: 98,
          response_rate: 100
        },
        {
          id: "4",
          full_name: "David Rodriguez",
          location: "Austin, TX", 
          bio: "Retired veterinary technician who now offers premium pet sitting services. With 15+ years in animal care, your pets' health and happiness are my top priority.",
          hourly_rate: 35,
          rating: 4.7,
          verified: true,
          verification_status: 'verified',
          background_check_status: 'passed',
          total_bookings: 89,
          experience_years: 8,
          profile_photo: null,
          sitter_services_offered: ['dog_walking', 'pet_sitting', 'overnight', 'daycare'],
          payment_methods: ['bank_transfer', 'paypal'],
          cpr_certificate_url: 'cert4.pdf',
          repeat_client_percentage: 92,
          punctuality_percentage: 100,
          response_rate: 97,
          sitter_tier: 'elite'
        },
        {
          id: "5",
          full_name: "Jessica Park",
          location: "Denver, CO",
          bio: "Active outdoor enthusiast perfect for energetic dogs. I provide hiking, running, and adventure-based pet care. Let's give your pup the exercise they crave!",
          hourly_rate: 28,
          rating: 4.9,
          verified: true,
          verification_status: 'verified',
          total_bookings: 24,
          experience_years: 3,
          profile_photo: null,
          sitter_services_offered: ['dog_walking', 'daycare'],
          payment_methods: ['venmo', 'cash_app', 'apple_pay'],
          intro_video_url: 'video5.mp4',
          repeat_client_percentage: 71,
          punctuality_percentage: 95,
          response_rate: 92
        },
        {
          id: "6",
          full_name: "Alex Thompson",
          location: "Miami, FL",
          bio: "New to PawfectRadar but not new to pet care! I've been caring for pets for friends and family for years. Looking forward to expanding my furry friend network!",
          hourly_rate: 20,
          rating: 0,
          verified: false,
          verification_status: 'pending',
          background_check_status: 'pending',
          total_bookings: 0,
          experience_years: 1,
          profile_photo: null,
          sitter_services_offered: ['dog_walking', 'pet_sitting'],
          payment_methods: ['venmo', 'cash_app'],
          repeat_client_percentage: 0,
          punctuality_percentage: 100,
          response_rate: 100
        }
      ];
      setSitters(sampleSitters);
    } catch (error) {
      console.error("Error loading sitters:", error);
    }
    setLoading(false);
  };

  const filterSitters = () => {
    let filtered = sitters;

    // Basic search
    if (searchTerm) {
      filtered = filtered.filter(sitter => 
        sitter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sitter.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sitter.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Advanced filters
    if (filters.maxRate < 100) {
      filtered = filtered.filter(sitter => sitter.hourly_rate <= filters.maxRate);
    }

    if (filters.minRate > 0) {
      filtered = filtered.filter(sitter => sitter.hourly_rate >= filters.minRate);
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(sitter => (sitter.rating || 0) >= filters.minRating);
    }

    if (filters.location) {
      filtered = filtered.filter(sitter => 
        sitter.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.serviceTypes?.length > 0) {
      filtered = filtered.filter(sitter => 
        filters.serviceTypes.some(service => 
          sitter.sitter_services_offered?.includes(service)
        )
      );
    }

    if (filters.verificationLevel) {
      switch (filters.verificationLevel) {
        case 'id_verified':
          filtered = filtered.filter(sitter => sitter.verified || sitter.verification_status === 'verified');
          break;
        case 'background_passed':
          filtered = filtered.filter(sitter => sitter.background_check_status === 'passed');
          break;
        case 'elite':
          filtered = filtered.filter(sitter => sitter.sitter_tier === 'elite');
          break;
      }
    }

    if (filters.experience) {
      switch (filters.experience) {
        case 'new':
          filtered = filtered.filter(sitter => (sitter.experience_years || 0) <= 1);
          break;
        case 'experienced':
          filtered = filtered.filter(sitter => 
            (sitter.experience_years || 0) >= 2 && (sitter.experience_years || 0) <= 5
          );
          break;
        case 'expert':
          filtered = filtered.filter(sitter => (sitter.experience_years || 0) > 5);
          break;
      }
    }

    // Sort by rating and verification status
    filtered.sort((a, b) => {
      // Elite sitters first
      if (a.sitter_tier === 'elite' && b.sitter_tier !== 'elite') return -1;
      if (b.sitter_tier === 'elite' && a.sitter_tier !== 'elite') return 1;
      
      // Then by verification
      if ((a.verified || a.verification_status === 'verified') && 
          !(b.verified || b.verification_status === 'verified')) return -1;
      if ((b.verified || b.verification_status === 'verified') && 
          !(a.verified || a.verification_status === 'verified')) return 1;
      
      // Then by rating
      return (b.rating || 0) - (a.rating || 0);
    });

    setFilteredSitters(filtered);
  };

  const handleBookSitter = (sitter) => {
    setSelectedSitter(sitter);
    setShowBookingModal(true);
  };

  const handleViewProfile = (sitter) => {
    setSelectedSitter(sitter);
    setShowSitterProfile(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5]"></div>
      </div>
    );
  }

  if (showSitterProfile && selectedSitter) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowSitterProfile(false)}
          >
            ← Back to Search
          </Button>
        </div>
        <EnhancedSitterProfile 
          sitter={selectedSitter} 
          onBook={handleBookSitter}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Pet Sitters</h1>
        <p className="text-gray-600">
          Discover trusted, verified pet sitters in your area
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, location, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-[#A2D4F5]"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="h-12 px-6 border-gray-200 hover:bg-[#A2D4F5]/10"
          >
            <Filter className="w-5 h-5 mr-2" />
            Advanced Search
          </Button>
        </div>
      </div>

      {/* Advanced Search */}
      {showAdvancedSearch && (
        <AdvancedSitterSearch
          currentFilters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600">
          {filteredSitters.length} sitter{filteredSitters.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Badge className="bg-green-100 text-green-800">⭐ Elite</Badge>
          <Badge className="bg-blue-100 text-blue-800">🔒 Verified</Badge>
          <Badge className="bg-purple-100 text-purple-800">📹 Video</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">🐾 Repeat Clients</Badge>
        </div>
      </div>

      {/* Sitters Grid */}
      {filteredSitters.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/50 to-white">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center mb-6">
              <SearchIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No sitters found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md">
              Try adjusting your search criteria or filters to find more sitters in your area.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setFilters({
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
                });
              }}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSitters.map((sitter) => (
            <div key={sitter.id} className="group">
              <SitterCard
                sitter={sitter}
                onBook={handleBookSitter}
              />
              <Button
                variant="ghost"
                className="w-full mt-2 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => handleViewProfile(sitter)}
              >
                View Full Profile →
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedSitter && (
        <BookingModal
          sitter={selectedSitter}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSitter(null);
          }}
        />
      )}
    </div>
  );
}