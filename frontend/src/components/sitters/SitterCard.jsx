import { Card as CardIcon, CardContent as CardContentIcon, CardHeader as CardHeaderIcon, CheckCircle as CheckCircleIcon, DollarSign as DollarSignIcon, Heart as HeartIcon, MapPin as MapPinIcon, Shield as ShieldIcon, Star as StarIcon } from '@/lib/icons.js';

export default function SitterCard({ sitter, onBook }) {
  const getBadges = () => {
    const badges = [];
    
    if (sitter.verified || sitter.verification_status === 'verified') {
      badges.push({ label: "🔒 Verified ID", color: "bg-green-100 text-green-800 border-green-200" });
    }
    
    if (sitter.background_check_status === 'passed') {
      badges.push({ label: "🛡️ Background Passed", color: "bg-blue-100 text-blue-800 border-blue-200" });
    }
    
    if (sitter.cpr_certificate_url) {
      badges.push({ label: "🧪 Health Certified", color: "bg-red-100 text-red-800 border-red-200" });
    }
    
    if (sitter.intro_video_url) {
      badges.push({ label: "📹 Intro Video", color: "bg-purple-100 text-purple-800 border-purple-200" });
    }
    
    if ((sitter.repeat_client_percentage || 0) > 60) {
      badges.push({ label: "🐾 Repeat Clients", color: "bg-yellow-100 text-yellow-800 border-yellow-200" });
    }

    return badges;
  };

  const badges = getBadges();

  return (
    <CardIcon className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
      <CardHeaderIcon className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center flex-shrink-0 relative">
            {sitter.profile_photo ? (
              <img src={sitter.profile_photo} alt={sitter.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xl">
                {sitter.full_name?.charAt(0) || 'S'}
              </span>
            )}
            {/* Elite Badge */}
            {sitter.sitter_tier === 'elite' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">💎</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{sitter.full_name}</h3>
              {/* Main Verification Badge */}
              {(sitter.verified || sitter.verification_status === 'verified') && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <ShieldIcon className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
              <MapPinIcon className="w-3 h-3" />
              {sitter.location}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-semibold">{sitter.rating || 'New'}</span>
                <span className="text-gray-500 text-sm">({sitter.total_bookings || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-[#7DB9E8] font-semibold">
                <DollarSignIcon className="w-4 h-4" />
                ${sitter.hourly_rate}/hr
              </div>
            </div>
          </div>
        </div>
      </CardHeaderIcon>
      
      <CardContentIcon className="pt-0">
        <div className="space-y-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {sitter.bio}
          </p>
          
          {/* Verification Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges.slice(0, 3).map((badge, index) => (
                <Badge key={index} className={`${badge.color} text-xs`}>
                  {badge.label}
                </Badge>
              ))}
              {badges.length > 3 && (
                <Badge className="bg-gray-100 text-gray-600 text-xs">
                  +{badges.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {sitter.experience_years || 0} years exp.
            </div>
            <div className="flex items-center gap-1">
              <HeartIcon className="w-3 h-3" />
              {sitter.total_bookings || 0} bookings
            </div>
            {sitter.punctuality_percentage && (
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="w-3 h-3" />
                {sitter.punctuality_percentage}% on-time
              </div>
            )}
          </div>
          
          <Button 
            onClick={() => onBook(sitter)}
            className="w-full bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0 shadow-lg group-hover:shadow-xl transition-all duration-300"
          >
            Book {sitter.full_name.split(' ')[0]}
          </Button>
        </div>
      </CardContentIcon>
    </CardIcon>
  );
}
