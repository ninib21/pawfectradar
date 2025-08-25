import { Booking as BookingIcon, CheckCircle as CheckCircleIcon, DollarSign as DollarSignIcon, Gallery as GalleryIcon, MapPin as MapPinIcon, Review as ReviewIcon, Star as StarIcon, User as UserIcon } from '@/lib/icons.js';
import React, { useState, useEffect } from 'react';

import PhotoGallery from '../gallery/PhotoGallery';
import { formatDistanceToNow } from 'date-fns';

function ReviewCard({ review }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {review.reviewer_name?.charAt(0) || 'R'}
              </span>
            </div>
            <div>
              <div className="font-medium">{review.reviewer_name || 'Pet Owner'}</div>
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(review.created_date), { addSuffix: true })}
          </div>
        </div>
        <p className="text-gray-700">{review.comment}</p>
      </CardContent>
    </Card>
  );
}

function StatsCard({ icon: Icon, label, value, color = "text-gray-600" }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

export default function EnhancedSitterProfile({ sitter, onBook, showBookButton = true }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sitter) {
      loadProfileData();
    }
  }, [sitter]);

  const loadProfileData = async () => {
    try {
      const [reviewData, bookingData] = await Promise.all([
        Review.filter({ reviewee_id: sitter.id }),
        Booking.filter({ sitter_id: sitter.id, status: 'completed' })
      ]);

      setReviews(reviewData);
      
      // Calculate stats
      const totalEarnings = bookingData.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
      const avgRating = reviewData.length > 0 
        ? reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length 
        : 0;

      setStats({
        totalBookings: sitter.total_bookings || bookingData.length,
        totalEarnings,
        avgRating: avgRating.toFixed(1),
        responseRate: sitter.response_rate || 95,
        repeatClients: sitter.repeat_client_percentage || 0,
        punctuality: sitter.punctuality_percentage || 100
      });

    } catch (error) {
      console.error('Error loading profile data:', error);
    }
    setLoading(false);
  };

  const getBadges = () => {
    const badges = [];
    
    if (sitter.verified || sitter.verification_status === 'verified') {
      badges.push({ 
        label: "🔒 Verified ID", 
        color: "bg-green-100 text-green-800 border-green-200",
        description: "Identity verified with government ID"
      });
    }
    
    if (sitter.background_check_status === 'passed') {
      badges.push({ 
        label: "🛡️ Background Check", 
        color: "bg-blue-100 text-blue-800 border-blue-200",
        description: "Passed comprehensive background screening"
      });
    }
    
    if (sitter.cpr_certificate_url) {
      badges.push({ 
        label: "🧪 Health Certified", 
        color: "bg-red-100 text-red-800 border-red-200",
        description: "CPR and First Aid certified"
      });
    }
    
    if (sitter.intro_video_url) {
      badges.push({ 
        label: "📹 Intro Video", 
        color: "bg-purple-100 text-purple-800 border-purple-200",
        description: "Personal introduction video available"
      });
    }
    
    if ((sitter.repeat_client_percentage || 0) > 60) {
      badges.push({ 
        label: "🐾 Repeat Clients", 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        description: "High percentage of returning customers"
      });
    }

    if (stats.avgRating >= 4.8) {
      badges.push({
        label: "⭐ Top Rated",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        description: "Consistently excellent reviews"
      });
    }

    return badges;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5]"></div>
      </div>
    );
  }

  const badges = getBadges();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2]">
          {/* Elite Badge */}
          {sitter.sitter_tier === 'elite' && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                💎 Elite Sitter
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center overflow-hidden">
                  {sitter.profile_photo ? (
                    <img 
                      src={sitter.profile_photo} 
                      alt={sitter.full_name} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <span className="text-white font-bold text-3xl">
                      {sitter.full_name?.charAt(0) || 'S'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {sitter.full_name}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2 mb-2">
                    <MapPinIcon className="w-4 h-4" />
                    {sitter.location}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-bold text-lg">{stats.avgRating}</span>
                      <span className="text-gray-500">({reviews.length} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#7DB9E8] font-bold text-lg">
                      <DollarSignIcon className="w-5 h-5" />
                      {sitter.hourly_rate}/hr
                    </div>
                  </div>
                </div>
                
                {showBookButton && (
                  <Button
                    onClick={() => onBook && onBook(sitter)}
                    className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0 px-8 py-3 text-lg shadow-lg"
                  >
                    Book {sitter.full_name.split(' ')[0]}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Verification Badges */}
          {badges.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge 
                  key={index} 
                  className={`${badge.color} text-sm px-3 py-1`}
                  title={badge.description}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatsCard
          icon={Calendar}
          label="Total Bookings"
          value={stats.totalBookings}
          color="text-blue-600"
        />
        <StatsCard
          icon={DollarSign}
          label="Total Earned"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          color="text-green-600"
        />
        <StatsCard
          icon={TrendingUp}
          label="Response Rate"
          value={`${stats.responseRate}%`}
          color="text-purple-600"
        />
        <StatsCard
          icon={Heart}
          label="Repeat Clients"
          value={`${stats.repeatClients}%`}
          color="text-pink-600"
        />
        <StatsCard
          icon={CheckCircle}
          label="On-Time Rate"
          value={`${stats.punctuality}%`}
          color="text-indigo-600"
        />
        <StatsCard
          icon={Clock}
          label="Experience"
          value={`${sitter.experience_years || 0} yrs`}
          color="text-orange-600"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">About {sitter.full_name?.split(' ')[0]}</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {sitter.bio || 'No bio available yet.'}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Experience & Qualifications</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      {sitter.experience_years || 0} years of pet care experience
                    </li>
                    {sitter.cpr_certificate_url && (
                      <li className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        CPR & First Aid certified
                      </li>
                    )}
                    {sitter.background_check_status === 'passed' && (
                      <li className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        Background check cleared
                      </li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {(sitter.sitter_services_offered || []).map((service) => (
                      <Badge key={service} variant="secondary">
                        {service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <StarIcon className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600">
                    {sitter.full_name?.split(' ')[0]} is new to the platform or hasn't received reviews yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Photo Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoGallery
                entityType="profile"
                entityId={sitter.id}
                canEdit={false}
                maxPhotos={20}
                showCaptions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Services & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(sitter.sitter_services_offered || []).map((service) => (
                  <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      {service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-[#7DB9E8] font-bold">
                      ${sitter.hourly_rate}/hr
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(sitter.payment_methods || []).map((method) => (
                    <div key={method} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span>{method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}