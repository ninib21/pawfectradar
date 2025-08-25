
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle as CheckCircleIcon as CheckCircleIcon as CheckCircleIcon, Camera, ArrowRight, Heart as HeartIcon as HeartIcon, Star as StarIcon as StarIcon as StarIcon, Shield as ShieldIcon as ShieldIcon as ShieldIcon } from 'lucide-react';
import { createPageUrl } from "@/utils";

export default function Landing() {
  const features = [
    {
      icon: Shield,
      title: "Verified Sitters",
      description: "All sitters undergo background checks and identity verification for your peace of mind."
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Get live photos, updates, and GPS tracking during your pet's care session."
    },
    {
      icon: MapPin,
      title: "Local & Trusted",
      description: "Find experienced sitters in your neighborhood with verified reviews."
    },
    {
      icon: Heart,
      title: "Personalized Care",
      description: "Custom care plans tailored to your pet's specific needs and personality."
    },
    {
      icon: Camera,
      title: "Photo Updates",
      description: "Receive regular photos and videos of your pet throughout the day."
    },
    {
      icon: MessageCircle,
      title: "Direct Chat",
      description: "Stay connected with your sitter through in-app messaging."
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "PawfectRadar made finding a trustworthy sitter so easy! Luna loves her walks with Emma.",
      location: "San Francisco, CA"
    },
    {
      name: "Mike R.",
      rating: 5,
      text: "As a sitter, PawfectRadar helps me connect with amazing pet families. Great platform!",
      location: "Austin, TX"
    },
    {
      name: "Jessica L.",
      rating: 5,
      text: "The real-time updates and photos give me peace of mind when I'm at work.",
      location: "Seattle, WA"
    }
  ];

  const handleGetStarted = () => {
    window.location.href = createPageUrl('developer-access');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-pink-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-xl flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#7DB9E8] to-[#F8A7C0] bg-clip-text text-transparent">
                PawfectRadar
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <a href="#features">Features</a>
              </Button>
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <a href="#pricing">Pricing</a>
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] text-white border-0 mb-6">
                🎉 Your Trusted Pet Care Network
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#7DB9E8] to-[#F8A7C0] bg-clip-text text-transparent">
                  Find Your
                </span>
                <br />
                <span className="text-gray-900">Pet's Perfect Sitter</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Connect with trusted, verified pet sitters in your neighborhood.
                Real-time updates, GPS tracking, and peace of mind for every pet parent.
              </p>

              {/* Get Started Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0 h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start text-center">
                <div>
                  <div className="text-3xl font-bold text-[#7DB9E8]">10K+</div>
                  <div className="text-gray-600">Happy Pets</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#F8A7C0]">5K+</div>
                  <div className="text-gray-600">Trusted Sitters</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#7DB9E8]">4.9★</div>
                  <div className="text-gray-600">App Rating</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Phone Mockup */}
            <div className="relative">
              <div className="relative mx-auto w-80 h-[600px] bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-[2.5rem] flex items-center justify-center overflow-hidden">
                  <div className="text-center text-white p-8">
                    <HeartIcon className="w-20 h-20 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">PawfectRadar App</h3>
                    <p className="text-lg opacity-90">Your pet's best friend</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              </div>

              <div className="absolute -bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">4.9 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Pet Parents Choose PawfectRadar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've designed every feature with your pet's safety, happiness, and your peace of mind in focus.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pet Care Made Simple
            </h2>
            <p className="text-xl text-gray-600">
              From booking to real-time updates, everything you need in one app
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#A2D4F5] to-[#7DB9E8] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Find & Book</h3>
              <p className="text-gray-600">
                Browse verified sitters in your area, read reviews, and book the perfect match for your pet.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FBC3D2] to-[#F8A7C0] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Stay Connected</h3>
              <p className="text-gray-600">
                Get real-time updates, photos, and GPS tracking throughout your pet's care session.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Peace of Mind</h3>
              <p className="text-gray-600">
                Secure payments, insurance coverage, and 24/7 support ensure everyone's happiness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Pet Parents & Sitters
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of happy users across the country
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your PawfectRadar Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, transparent pricing. A 15% platform fee applies to all bookings to keep our platform safe and running.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Owner Plus Plan */}
            <Card className="border-2 border-[#A2D4F5] shadow-2xl relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-[#A2D4F5] to-[#7DB9E8] text-white border-0">Owner Plus</Badge>
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Pet Parents</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">$4.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-4 text-gray-600 mb-8">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    Access to Elite Sitters
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    Premium Insurance Coverage
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    Live Video Call Check-ins
                  </li>
                </ul>
                <Button size="lg" className="w-full bg-gradient-to-r from-[#A2D4F5] to-[#7DB9E8] hover:opacity-90 text-white shadow-lg">
                  Choose Owner Plus
                </Button>
              </CardContent>
            </Card>

            {/* Premium Sitter Plan */}
            <Card className="border-0 shadow-xl bg-white relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-[#FBC3D2] to-[#F8A7C0] text-white border-0">Premium Sitter</Badge>
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Sitters</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">$14.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-4 text-gray-600 mb-8">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    Priority in Booking Requests
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    Featured Listing on Search
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    Advanced Profile Analytics
                  </li>
                </ul>
                <Button size="lg" className="w-full bg-gradient-to-r from-[#FBC3D2] to-[#F8A7C0] hover:opacity-90 text-white shadow-lg">
                  Become a Premium Sitter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Pet's Perfect Sitter?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of happy pet families on PawfectRadar today!
          </p>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white hover:bg-gray-100 text-gray-900 h-14 px-8 text-lg"
            >
              Sign Up For Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-xl flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">PawfectRadar</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The trusted platform connecting pet owners with verified, loving sitters.
                Your pet's happiness is our priority.
              </p>
              <p className="text-sm text-gray-500 mt-6">
                © 2025 PawfectRadar. All rights reserved.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Pet Owners</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#testimonials" className="hover:text-white">Reviews</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Safety & Trust</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Sitters</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Become a Sitter</a></li>
                <li><a href="#pricing" className="hover:text-white">Premium Plan</a></li>
                <li><a href="#" className="hover:text-white">Sitter Resources</a></li>
                <li><a href="#" className="hover:text-white">Earnings</a></li>
              </ul>
            </div>
          </div>
          
          {/* Admin Access - Only visible to specific admin */}
          <div className="mt-8 border-t border-gray-700 pt-8 flex justify-center">
            <div 
              className="relative group cursor-pointer"
              onDoubleClick={() => {
                // Only allow access for the specific admin email
                const adminEmail = 'ninibarnez@gmail.com';
                const userEmail = prompt('Enter admin email:');
                if (userEmail === adminEmail) {
                  window.location.href = createPageUrl('AdminLogin');
                } else {
                  alert('Access denied. Please use the Get Started button above.');
                }
              }}
            >
              <span className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Double-click for admin access
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
