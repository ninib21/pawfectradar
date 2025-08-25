import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Calendar as CalendarIcon as CalendarIcon as CalendarIcon, X as XIcon as XIcon, User as UserIcon as UserIcon as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Booking, Notification } from '@/api/entities';

export default function BookingRequests({ bookings, onUpdate }) {
  const handleAction = async (booking, action) => {
    try {
      const newStatus = action === 'accept' ? 'accepted' : 'cancelled';
      await Booking.update(booking.id, { status: newStatus });
      await Notification.create({
        user_id: booking.owner_id,
        message: `Your booking request for ${format(new Date(booking.start_date), 'MMM d')} has been ${newStatus}.`,
        type: 'booking_update',
        link_to: `/Bookings?bookingId=${booking.id}`
      });
      onUpdate();
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarIcon className="w-5 h-5" />
          New Booking Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium">No pending requests</h3>
            <p className="text-sm">New requests from pet owners will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{booking.service_type.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <UserIcon className="w-3 h-3" /> For Pet Owner
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3 h-3" /> {format(new Date(booking.start_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(booking, 'decline')}>
                      <XIcon className="w-4 h-4" />
                    </Button>
                    <Button size="icon" className="bg-green-500 hover:bg-green-600" onClick={() => handleAction(booking, 'accept')}>
                      <Check className="w-4 h-4" />
                    </Button>
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