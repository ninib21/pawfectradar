
import React, { useState, useEffect } from "react";
import { Review as ReviewIcon as ReviewIcon as ReviewIcon as ReviewIcon } from 'lucide-react'
import { Booking, User, Notification, Review } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingCard from "../components/bookings/BookingCard";
import BookingDetails from "../components/bookings/BookingDetails";
import EmptyBookings from "../components/bookings/EmptyBookings";
import ReviewForm from "../components/reviews/ReviewForm";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    loadUserAndBookings();
  }, [loadUserAndBookings]);

  const loadUserAndBookings = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Load bookings where user is either owner or sitter
      const userBookings = await Booking.filter({
        $or: [
          { owner_id: currentUser.id },
          { sitter_id: currentUser.id }
        ]
      });
      
      setBookings(userBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
    setLoading(false);
  };

  const handleBookingAction = async (bookingId, action, sitterId, ownerId) => {
    try {
      let newStatus;
      let notificationMessage = '';
      let notifyUserId;

      const currentUser = user; // Get current user from state

      switch (action) {
        case "accept":
          newStatus = "accepted";
          notificationMessage = `Your booking request for #${bookingId.slice(-4)} was accepted!`;
          notifyUserId = ownerId;
          break;
        case "decline":
          newStatus = "cancelled";
          notificationMessage = `Your booking request for #${bookingId.slice(-4)} was declined.`;
          notifyUserId = ownerId;
          break;
        case "cancel":
          newStatus = "cancelled";
          notificationMessage = `Booking #${bookingId.slice(-4)} was cancelled.`;
          // If current user is owner, notify sitter. Else (if sitter), notify owner.
          notifyUserId = (currentUser && currentUser.id === ownerId) ? sitterId : ownerId;
          break;
        case "complete":
            newStatus = "completed";
            notificationMessage = `Booking #${bookingId.slice(-4)} is now complete! Please leave a review.`;
            notifyUserId = ownerId; // Notify owner
            // Notify sitter too
            await Notification.create({
                user_id: sitterId,
                message: `Booking #${bookingId.slice(-4)} is complete. You can now review the owner.`,
                type: 'booking_update',
                link_to: `/Bookings?bookingId=${bookingId}`
            });
            break;
        default:
          return;
      }
      
      await Booking.update(bookingId, { status: newStatus });

      if (notifyUserId) { // Only send notification if there's a target user
          await Notification.create({
              user_id: notifyUserId,
              message: notificationMessage,
              type: 'booking_update',
              link_to: `/Bookings?bookingId=${bookingId}`
          });
      }

      loadUserAndBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const handleOpenReview = (booking) => {
      const isOwner = booking.owner_id === user.id;
      // Determine the reviewee's ID and name. Assume booking object has owner_name and sitter_name.
      const reviewee = { 
          id: isOwner ? booking.sitter_id : booking.owner_id, 
          full_name: isOwner ? (booking.sitter_name || "Sitter") : (booking.owner_name || "Owner") 
      };
      setReviewTarget({booking, reviewee});
      setShowReviewForm(true);
  };

  const filterBookingsByStatus = (status) => {
    if (status === "all") return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  const getFilteredBookings = () => {
    return filterBookingsByStatus(activeTab);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5]"></div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">
          {user?.user_type === 'sitter' ? 'Manage your pet sitting requests and appointments' :
           user?.user_type === 'both' ? 'Manage your bookings as both owner and sitter' :
           'Track your pet care bookings and history'}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200">
          <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A2D4F5] data-[state=active]:to-[#FBC3D2] data-[state=active]:text-white">
            All ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A2D4F5] data-[state=active]:to-[#FBC3D2] data-[state=active]:text-white">
            Pending ({filterBookingsByStatus("pending").length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A2D4F5] data-[state=active]:to-[#FBC3D2] data-[state=active]:text-white">
            Accepted ({filterBookingsByStatus("accepted").length})
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A2D4F5] data-[state=active]:to-[#FBC3D2] data-[state=active]:text-white">
            Active ({filterBookingsByStatus("in_progress").length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A2D4F5] data-[state=active]:to-[#FBC3D2] data-[state=active]:text-white">
            Completed ({filterBookingsByStatus("completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length === 0 ? (
            <EmptyBookings status={activeTab} userType={user?.user_type} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  currentUser={user}
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetails(true);
                  }}
                  onAction={(action) => handleBookingAction(booking.id, action, booking.sitter_id, booking.owner_id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          currentUser={user}
          onClose={() => {
            setShowDetails(false);
            setSelectedBooking(null);
          }}
          onAction={(action) => handleBookingAction(selectedBooking.id, action, selectedBooking.sitter_id, selectedBooking.owner_id)}
          onReview={() => {
              setShowDetails(false);
              handleOpenReview(selectedBooking);
          }}
        />
      )}

      {/* Review Form Modal */}
      {showReviewForm && reviewTarget && (
          <ReviewForm
            booking={reviewTarget.booking}
            currentUser={user}
            reviewee={reviewTarget.reviewee}
            onClose={() => setShowReviewForm(false)}
            onComplete={() => {
                setShowReviewForm(false);
                loadUserAndBookings(); // Refresh data to hide review button if needed
            }}
          />
      )}
    </div>
  );
}
