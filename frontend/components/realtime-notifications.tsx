'use client';

import { useEffect, useState } from 'react';
import { subscribeToChannel } from '@/lib/ably';
import { Card, CardContent } from '@/components/ui/card';

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; timestamp: Date }>>([]);

  useEffect(() => {
    const unsubscribe = subscribeToChannel('posts', (message) => {
      if (message.name === 'new_post') {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            message: 'New post available!',
            timestamp: new Date(),
          },
        ]);
      }
    });

    const unsubscribeUnlocks = subscribeToChannel('unlocks', (message) => {
      if (message.name === 'ppv_unlocked') {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            message: 'PPV content unlocked!',
            timestamp: new Date(),
          },
        ]);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeUnlocks();
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(-3).map((notif) => (
        <Card key={notif.id} className="shadow-lg">
          <CardContent className="pt-4">
            <p className="text-sm">{notif.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {notif.timestamp.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

