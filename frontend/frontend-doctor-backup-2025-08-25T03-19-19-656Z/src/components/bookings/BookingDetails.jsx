
import React, { useState, useEffect } from "react";
import { MapPin as MapPinIcon as MapPinIcon as MapPinIcon, Clock, Calendar as CalendarIcon as CalendarIcon as CalendarIcon } from 'lucide-react'
import { SessionLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SessionTracker from './SessionTracker';

export default function BookingDetails({ booking, currentUser, onClose, onAction, onReview }) {
  const [sessionLogs, setSessionLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (booking.status === 'in_progress' || booking.status === 'completed') {
      fetchLogs();
    } else {
      setLoadingLogs(false);
    }
  }, [booking.id, booking.status]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    // Assuming SessionLog.filter takes a query object and sort order, and returns a promise
    const logs = await SessionLog.filter({ booking_id: booking.id }, '-created_date');
    setSessionLogs(logs);
    setLoadingLogs(false);
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    accepted: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  const isOwner = booking.owner_id === currentUser?.id;
  const isSitter = booking.sitter_id === currentUser?.id;
  const isCompleted = booking.status === 'completed';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Amount */}
          <div className="flex justify-between items-start">
            <Badge className={`${statusColors[booking.status]} border text-base px-3 py-1`}>
              {booking.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#7DB9E8]">${booking.total_amount}</p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
          </div>

          {/* Service Info */}
          <Card className="bg-gradient-to-r from-gray-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg">Service Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service Type</p>
                  <p className="font-semibold">
                    {booking.service_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-semibold flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {booking.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Time</p>
                  <p className="font-semibold flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {format(new Date(booking.start_date), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Time</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(booking.end_date), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Updates */}
          {(booking.status === 'in_progress' || isCompleted) && (
            <Card>
                <CardHeader><CardTitle>Session Updates</CardTitle></CardHeader>
                <CardContent>
                    {loadingLogs ? <p>Loading updates...</p> :
                     sessionLogs.length === 0 ? <p className="text-gray-500">No updates yet.</p> :
                     <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {sessionLogs.map(log => (
                            <div key={log.id} className="text-sm">
                                <span className="font-semibold">{log.log_type}: </span>
                                <span>{log.content}</span>
                            </div>
                        ))}
                     </div>
                    }
                </CardContent>
            </Card>
          )}

          {/* Sitter's Session Tracker */}
          {isSitter && booking.status === 'in_progress' && (
              <SessionTracker booking={booking} currentUser={currentUser} onUpdate={fetchLogs} />
          )}

          {/* Special Requests */}
          {booking.special_requests && (
            <Card className="bg-gradient-to-r from-blue-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-lg">Special Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{booking.special_requests}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {booking.notes && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Sitter Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{booking.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Emergency Info */}
          {booking.emergency_occurred && (
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-700">Emergency Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">An emergency was reported during this booking. Please check the notes above for details.</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t flex-wrap">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {isSitter && booking.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => { onAction("decline"); onClose(); }}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Decline Booking
                </Button>
                <Button
                  onClick={() => { onAction("accept"); onClose(); }}
                  className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
                >
                  Accept Booking
                </Button>
              </>
            )}
            {isSitter && booking.status === 'in_progress' && (
                <Button onClick={() => onAction('complete')}>Mark as Complete</Button>
            )}
            {(booking.status !== 'pending' && booking.status !== 'cancelled' && booking.status !== 'completed') && (
                 <Button variant="destructive" onClick={() => onAction('cancel')}>Cancel Booking</Button>
            )}
            {isCompleted && (
                <Button onClick={onReview} className="bg-yellow-500 hover:bg-yellow-600">Leave a Review</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
