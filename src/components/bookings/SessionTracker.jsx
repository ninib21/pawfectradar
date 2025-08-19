import React, { useState, useEffect } from 'react';
import { Booking, SessionLog, Notification } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Send, Camera, Footprints, Utensils, Pill } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function SessionLogItem({ log }) {
    const getIcon = () => {
        switch (log.log_type) {
            case 'text': return <Send className="w-4 h-4 text-gray-500" />;
            case 'photo': return <Camera className="w-4 h-4 text-blue-500" />;
            case 'walk_start':
            case 'walk_end': return <Footprints className="w-4 h-4 text-green-500" />;
            case 'fed': return <Utensils className="w-4 h-4 text-orange-500" />;
            case 'medication': return <Pill className="w-4 h-4 text-red-500" />;
            default: return <PlusCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="flex items-start gap-4 py-3">
            <div className="flex-shrink-0 mt-1">{getIcon()}</div>
            <div className="flex-1">
                {log.log_type === 'photo' ? (
                    <img src={log.content} alt="Session update" className="rounded-lg max-h-48 w-auto" />
                ) : (
                    <p className="text-sm text-gray-800">{log.content}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(log.created_date), { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}

export default function SessionTracker({ booking, currentUser, onUpdate }) {
    const [logs, setLogs] = useState([]);
    const [newLogContent, setNewLogContent] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadLogs();
    }, [booking.id]);

    const loadLogs = async () => {
        const sessionLogs = await SessionLog.filter({ booking_id: booking.id }, '-created_date');
        setLogs(sessionLogs);
    };
    
    const createNotification = async (message) => {
        await Notification.create({
            user_id: booking.owner_id,
            message: message,
            type: 'session_update',
            link_to: `/Bookings?bookingId=${booking.id}`
        });
    };

    const handleAddLog = async (logData) => {
        try {
            await SessionLog.create({
                booking_id: booking.id,
                sitter_id: currentUser.id,
                ...logData
            });
            await loadLogs();
            await createNotification(`Your sitter added a new update for booking #${booking.id.slice(-4)}`);
            setNewLogContent('');
        } catch (error) {
            console.error("Failed to add log:", error);
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            await handleAddLog({ log_type: 'photo', content: file_url });
        } catch (error) {
            console.error("Error uploading photo:", error);
        }
        setIsUploading(false);
    };

    const handleQuickLog = (log_type, content) => {
        handleAddLog({ log_type, content });
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Live Session Tracker</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Log Creation */}
                    <div>
                        <Textarea
                            placeholder="Add a text update..."
                            value={newLogContent}
                            onChange={(e) => setNewLogContent(e.target.value)}
                        />
                        <div className="mt-2 flex justify-between items-center">
                            <div className="flex gap-2">
                                <Button size="icon" variant="outline" onClick={() => document.getElementById('photo-upload').click()} disabled={isUploading}>
                                    <Camera className="w-4 h-4" />
                                </Button>
                                <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                
                                <Button size="icon" variant="outline" onClick={() => handleQuickLog('walk_start', 'Started a walk.')}><Footprints className="w-4 h-4" /></Button>
                                <Button size="icon" variant="outline" onClick={() => handleQuickLog('fed', 'Gave food.')}><Utensils className="w-4 h-4" /></Button>
                                <Button size="icon" variant="outline" onClick={() => handleQuickLog('medication', 'Administered medication.')}><Pill className="w-4 h-4" /></Button>
                            </div>
                            <Button onClick={() => handleAddLog({ log_type: 'text', content: newLogContent })} disabled={!newLogContent}>
                                <Send className="w-4 h-4 mr-2" /> Send Update
                            </Button>
                        </div>
                    </div>

                    {/* Logs Timeline */}
                    <div className="max-h-64 overflow-y-auto divide-y pr-2">
                        {logs.length > 0 ? (
                            logs.map(log => <SessionLogItem key={log.id} log={log} />)
                        ) : (
                            <p className="text-center text-gray-500 py-8">No updates for this session yet.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}