import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, Search, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EmptyBookings({ status, userType }) {
  const getEmptyState = () => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          title: "No pending bookings",
          description: userType === "sitter" 
            ? "New booking requests will appear here"
            : "Your booking requests will appear here once submitted",
          action: userType !== "sitter" ? {
            text: "Find Sitters",
            link: createPageUrl("Sitters")
          } : null
        };
      case "completed":
        return {
          icon: Heart,
          title: "No completed bookings yet",  
          description: "Completed bookings will show your pet care history",
          action: userType !== "sitter" ? {
            text: "Book a Sitter",
            link: createPageUrl("Sitters")
          } : null
        };
      default:
        return {
          icon: Calendar,
          title: "No bookings yet",
          description: userType === "sitter" 
            ? "Pet owners will send you booking requests based on your profile"
            : "Start by finding trusted sitters for your pets",
          action: userType !== "sitter" ? {
            text: "Find Sitters",
            link: createPageUrl("Sitters")
          } : null
        };
    }
  };

  const emptyState = getEmptyState();

  return (
    <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/50 to-white">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center mb-6">
          <emptyState.icon className="w-10 h-10 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {emptyState.title}
        </h3>
        
        <p className="text-gray-600 mb-8 max-w-md">
          {emptyState.description}
        </p>
        
        {emptyState.action && (
          <Link to={emptyState.action.link}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0 shadow-lg"
            >
              <Search className="w-5 h-5 mr-2" />
              {emptyState.action.text}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}