import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle as CheckCircleIcon as CheckCircleIcon as CheckCircleIcon, XCircle, MapPin as MapPinIcon as MapPinIcon as MapPinIcon, Clock, Calendar as CalendarIcon as CalendarIcon as CalendarIcon, X as XIcon as XIcon, User as UserIcon as UserIcon as UserIcon } from 'lucide-react';
import { format } from "date-fns";

export default function BookingCard({ booking, currentUser, onClick, onAction }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    accepted: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  const isOwner = booking.owner_id === currentUser?.id;
  const canAcceptDecline = !isOwner && booking.status === "pending";

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-white to-gray-50/50" onClick={onClick}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {booking.service_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                {isOwner ? `Sitter: Assigned` : `Owner: Pet Parent`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={`${statusColors[booking.status]} border font-medium`}>
              {booking.status.replace('_', ' ')}
            </Badge>
            <div className="text-right">
              <p className="font-bold text-lg text-[#7DB9E8]">${booking.total_amount}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="w-4 h-4" />
              <span>{format(new Date(booking.start_date), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(booking.start_date), "h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPinIcon className="w-4 h-4" />
              <span className="truncate">{booking.location}</span>
            </div>
          </div>
          
          {booking.special_requests && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Special requests:</span> {booking.special_requests}
              </p>
            </div>
          )}
          
          {canAcceptDecline && (
            <div className="flex gap-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(booking.id, "decline")}
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => onAction(booking.id, "accept")}
                className="flex-1 bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
              >
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Accept
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}