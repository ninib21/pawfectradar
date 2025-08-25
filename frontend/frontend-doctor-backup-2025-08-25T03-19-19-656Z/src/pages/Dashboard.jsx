
import React, { useState, useEffect } from "react";
import { ArrowRight, Star as StarIcon as StarIcon as StarIcon } from 'lucide-react'
import { User, Pet, Booking } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import StatsOverview from "../components/dashboard/StatsOverview";
import QuickActions from "../components/dashboard/QuickActions";
import RecentBookings from "../components/dashboard/RecentBookings";
import FeaturedSitters from "../components/dashboard/FeaturedSitters";
import BookingRequests from "../components/dashboard/BookingRequests";
import EarningsTracker from "../components/dashboard/EarningsTracker";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const [userPets, userBookings] = await Promise.all([
        Pet.filter({ owner_id: currentUser.id }),
        Booking.filter({ 
          $or: [
            { owner_id: currentUser.id },
            { sitter_id: currentUser.id }
          ]
        }, '-start_date') // Sort by start_date descending
      ]);
      
      setPets(userPets);
      setBookings(userBookings);
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5]"></div>
      </div>
    );
  }

  const isSitter = user?.user_type === 'sitter' || user?.user_type === 'both';
  const isOwner = user?.user_type === 'owner' || user?.user_type === 'both';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center">
            {user?.profile_photo ? (
              <img src={user.profile_photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xl">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-gray-600">
              {user?.user_type === 'sitter' ? 'Manage your sitter profile and bookings' :
               user?.user_type === 'both' ? 'Manage your pets and sitter services' :
               'Take care of your furry friends'}
            </p>
          </div>
        </div>
        
        {/* Profile completion prompt */}
        {(!user?.phone || !user?.location || !user?.bio) && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">Complete Your Profile</h3>
                  <p className="text-sm text-yellow-700">Add more details to get better matches and build trust</p>
                </div>
                <Link to={createPageUrl("Profile")}>
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    Complete Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <StatsOverview user={user} pets={pets} bookings={bookings} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sitter: Booking Requests */}
          {isSitter && (
            <BookingRequests 
              bookings={bookings.filter(b => b.status === 'pending' && b.sitter_id === user.id)}
              onUpdate={loadDashboardData}
            />
          )}

          {/* Quick Actions */}
          <QuickActions user={user} />
          
          {/* Recent Bookings */}
          <RecentBookings 
            bookings={bookings.slice(0, 5)} 
            currentUser={user}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Sitter: Earnings */}
          {isSitter && (
            <EarningsTracker bookings={bookings.filter(b => b.sitter_id === user.id)} />
          )}

          {/* Owner: Featured Sitters */}
          {isOwner && (
            <FeaturedSitters />
          )}
          
          {/* Quick Stats Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-[#A2D4F5]/10 to-[#FBC3D2]/10">
            <CardHeader>
              <CardTitle className="text-lg">Your PawfectRadar Journey</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member since</span>
                <span className="font-semibold">
                  {user?.created_date ? new Date(user.created_date).getFullYear() : 'Recently'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account type</span>
                <Badge className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] text-white border-0">
                  {user?.user_type === 'both' ? 'Owner & Sitter' : 
                   user?.user_type === 'sitter' ? 'Sitter' : 'Pet Owner'}
                </Badge>
              </div>
              {user?.user_type !== 'owner' && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your rating</span>
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{user?.rating || 'New'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
