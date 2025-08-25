import { MapPin as MapPinIcon as MapPinIcon as MapPinIcon, Clock, Calendar as CalendarIcon as CalendarIcon as CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RecentBookings({ bookings, userType }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    accepted: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarIcon className="w-5 h-5" />
          Recent Bookings
        </CardTitle>
        <Link to={createPageUrl("Bookings")}>
          <span className="text-sm text-[#7DB9E8] hover:underline">View All</span>
        </Link>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium mb-2">No bookings yet</h3>
            <p className="text-sm">Start by booking a sitter or updating your availability!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.service_type?.replace('_', ' ')}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        {booking.location}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[booking.status]} border`}>
                    {booking.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(booking.start_date), "MMM d, h:mm a")}
                  </div>
                  <div className="font-medium text-gray-900">
                    ${booking.total_amount}
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