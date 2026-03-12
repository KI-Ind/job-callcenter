'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationsAPI } from '../app/lib/api';

// Define notification type
interface Notification {
  _id: string;
  title: string;
  content: string;
  type: 'application' | 'interview' | 'message' | 'job' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, isAuthenticated, token } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to WebSocket server
      const socketIo = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket'],
        auth: {
          token
        }
      });

      setSocket(socketIo);

      // Join user's personal room
      socketIo.on('connect', () => {
        console.log('Connected to notification socket');
        socketIo.emit('join', user.id);
      });

      // Listen for new notifications
      socketIo.on('notification', (notification: Notification) => {
        console.log('Received real-time notification:', notification);
        
        // Add new notification to the list
        setNotifications(prev => [notification, ...prev]);
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.content,
            icon: '/logo.png'
          });
        }
      });

      // Clean up on unmount
      return () => {
        socketIo.disconnect();
      };
    }
  }, [isAuthenticated, user, token]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      if (!isAuthenticated) return;
      
      const response = await notificationsAPI.getNotifications();
      
      if (response && response.success) {
        setNotifications(response.data);
        
        // Count unread notifications
        const unread = response.data.filter((notification: Notification) => !notification.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      if (!isAuthenticated) return;
      
      const response = await notificationsAPI.markAsRead(notificationId);
      
      if (response && response.success) {
        // Update local state
        setNotifications(
          notifications.map((notification) =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!isAuthenticated) return;
      
      const response = await notificationsAPI.markAllAsRead();
      
      if (response && response.success) {
        // Update local state
        setNotifications(
          notifications.map((notification) => ({ ...notification, read: true }))
        );
        
        // Reset unread count
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      if (!isAuthenticated) return;
      
      const response = await notificationsAPI.deleteNotification(notificationId);
      
      if (response && response.success) {
        // Update local state
        const updatedNotifications = notifications.filter(
          (notification) => notification._id !== notificationId
        );
        setNotifications(updatedNotifications);
        
        // Update unread count if needed
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Fetch notifications on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
