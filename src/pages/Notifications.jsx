import React, { useState, useEffect } from 'react';
import { Notification, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            const userNotifications = await Notification.filter({ user_id: currentUser.id }, '-created_date');
            setNotifications(userNotifications);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
        setLoading(false);
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.is_read);
            const updates = unreadNotifications.map(n => Notification.update(n.id, { is_read: true }));
            await Promise.all(updates);
            await loadData(); // Refresh the list
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking_request': return <Badge className="bg-blue-100 text-blue-800">Booking</Badge>;
            case 'booking_update': return <Badge className="bg-green-100 text-green-800">Update</Badge>;
            case 'review_new': return <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>;
            case 'session_update': return <Badge className="bg-purple-100 text-purple-800">Session</Badge>;
            default: return <Badge>General</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                         <Bell className="w-6 h-6" />
                        <CardTitle>All Notifications</CardTitle>
                    </div>
                    <Button variant="outline" onClick={markAllAsRead} disabled={!notifications.some(n => !n.is_read)}>
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Mark All as Read
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-semibold">No Notifications Here</h3>
                                <p>Important updates about your bookings and account will appear here.</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <Link to={notification.link_to || '#'} key={notification.id} className={`block p-4 rounded-lg border transition-colors ${notification.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${!notification.is_read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                            <div>
                                                <p className="font-medium text-gray-900">{notification.message}</p>
                                                <p className="text-sm text-gray-600 mt-1">{format(new Date(notification.created_date), "MMMM d, yyyy 'at' h:mm a")}</p>
                                            </div>
                                        </div>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}