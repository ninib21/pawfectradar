import React, { useState, useEffect } from "react";
import { Star as StarIcon as StarIcon as StarIcon, MapPin as MapPinIcon as MapPinIcon as MapPinIcon, DollarSign as DollarSignIcon as DollarSignIcon as DollarSignIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/api/entities";
export default function FeaturedSitters() {
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSitters();
  }, [loadSitters]);

  const loadSitters = async () => {
    try {
      // Since we can't pre-populate sitters, show sample data for demo
      const sampleSitters = [
        {
          id: "1",
          full_name: "Sarah Johnson",
          location: "San Francisco, CA",
          hourly_rate: 25,
          rating: 4.9,
          verified: true,
          total_bookings: 47
        },
        {
          id: "2", 
          full_name: "Mike Chen",
          location: "Los Angeles, CA",
          hourly_rate: 30,
          rating: 4.8,
          verified: true,
          total_bookings: 32
        },
        {
          id: "3",
          full_name: "Emma Wilson", 
          location: "Seattle, WA",
          hourly_rate: 22,
          rating: 5.0,
          verified: true,
          total_bookings: 18
        }
      ];
      setSitters(sampleSitters);
    } catch (error) {
      console.error("Error loading sitters:", error);
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StarIcon className="w-5 h-5 text-yellow-500" />
          Featured Sitters
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sitters.map(sitter => (
              <div key={sitter.id} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow duration-300 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {sitter.full_name?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{sitter.full_name}</h4>
                      {sitter.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-3 h-3 text-yellow-500" />
                        {sitter.rating || 'New'}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSignIcon className="w-3 h-3" />
                        ${sitter.hourly_rate}/hr
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {sitter.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}