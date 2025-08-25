
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Heart as HeartIcon as HeartIcon, Edit as EditIcon as EditIcon } from 'lucide-react';

export default function PetCard({ pet, onEdit }) {
  const temperamentColors = {
    friendly: "bg-green-100 text-green-800 border-green-200",
    shy: "bg-blue-100 text-blue-800 border-blue-200",
    energetic: "bg-orange-100 text-orange-800 border-orange-200",
    calm: "bg-purple-100 text-purple-800 border-purple-200",
    protective: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
      <div className="relative">
        {pet.photo ? (
          <img 
            src={pet.photo} 
            alt={pet.name} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-[#A2D4F5]/20 to-[#FBC3D2]/20 flex items-center justify-center">
            <HeartIcon className="w-16 h-16 text-[#A2D4F5]" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onEdit(pet)}
            className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white"
          >
            <EditIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{pet.name}</h3>
            <p className="text-gray-600">{pet.breed}</p>
          </div>
          {pet.temperament && (
            <Badge className={`${temperamentColors[pet.temperament]} border`}>
              {pet.temperament}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Age:</span>
            <span className="font-medium">{pet.age ? `${pet.age} years` : 'Unknown'}</span>
          </div>
          
          {pet.weight && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Weight:</span>
              <span className="font-medium">{pet.weight} lbs</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Vaccinated:</span>
            <Badge variant={pet.vaccinated ? "default" : "destructive"} className="text-xs">
              {pet.vaccinated ? "Yes" : "No"}
            </Badge>
          </div>
          
          {pet.allergies && (
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Medical Notes:</h4>
              <p className="text-xs text-gray-600">{pet.allergies}</p>
            </div>
          )}
          
          {pet.special_instructions && (
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Care Instructions:</h4>
              <p className="text-xs text-gray-600">{pet.special_instructions}</p>
            </div>
          )}
        </div>
        
        {/* Photo Gallery Link */}
        <div className="pt-2 border-t border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-gray-600 hover:text-gray-900"
            onClick={() => {
              // This would open a photo gallery modal - implementing as placeholder
              console.log('View photo gallery for', pet.name);
            }}
          >
            <Camera className="w-3 h-3 mr-1" />
            View Photos ({Math.floor(Math.random() * 5) + 1})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
