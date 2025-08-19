import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Star, DollarSign } from "lucide-react";

export default function StatsOverview({ user, pets, bookings }) {
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalEarnings = bookings
    .filter(b => b.status === 'completed' && b.sitter_id === user?.id)
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const stats = [
    {
      title: "My Pets",
      value: pets.length,
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      bgColor: "from-pink-50 to-rose-50"
    },
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      title: "Rating",
      value: user?.rating ? `${user.rating}/5` : "New",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50"
    },
    {
      title: "Earnings",
      value: `$${totalEarnings}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-60`} />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}