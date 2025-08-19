import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";

export default function EmptyState({ onAddPet }) {
  return (
    <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/50 to-white">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          No pets registered yet
        </h3>
        
        <p className="text-gray-600 mb-8 max-w-md">
          Start by adding your furry family members. This helps sitters understand your pets' needs and provide the best care possible.
        </p>
        
        <Button 
          onClick={onAddPet}
          size="lg"
          className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Pet
        </Button>
      </CardContent>
    </Card>
  );
}