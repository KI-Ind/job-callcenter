'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  
  // Determine the dashboard path based on user role
  const getDashboardPath = () => {
    if (user?.role === 'employeur') {
      return '/dashboard/employeur/notifications';
    } else if (user?.role === 'admin') {
      return '/dashboard/admin/notifications';
    } else {
      return '/dashboard/candidat/notifications';
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Format date to relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInDays > 0) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInMinutes > 0) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notificationId: string, link?: string) => {
    if (!notificationId) return;
    markAsRead(notificationId);
    setIsOpen(false);
    if (link) {
      // Ensure the link is properly formatted for the user's role
      let url = link.startsWith('/') ? link : `/${link}`;
      
      // Check if we need to adjust the URL based on user role
      if (user?.role === 'employeur') {
        // If the link doesn't already include the employer dashboard path
        if (!url.includes('/dashboard/employeur')) {
          // If it's a dashboard link but not specifically for employers
          if (url.includes('/dashboard')) {
            // Replace any dashboard path with employer dashboard path
            url = url.replace(/\/dashboard(\/[^/]+)?/, '/dashboard/employeur');
          } else {
            // If it's not a dashboard link at all, prepend the employer dashboard path
            url = `/dashboard/employeur${url}`;
          }
        }
      } else if (user?.role === 'candidat') {
        // Similar logic for candidates
        if (!url.includes('/dashboard/candidat')) {
          if (url.includes('/dashboard')) {
            url = url.replace(/\/dashboard(\/[^/]+)?/, '/dashboard/candidat');
          } else {
            url = `/dashboard/candidat${url}`;
          }
        }
      }
      
      console.log(`Navigating to: ${url} (original link: ${link})`);
      setTimeout(() => router.push(url), 0);
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return (
          <div className="flex-shrink-0 rounded-full p-2 bg-blue-100 text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
        );
      case 'interview':
        return (
          <div className="flex-shrink-0 rounded-full p-2 bg-green-100 text-green-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
        );
      case 'job':
        return (
          <div className="flex-shrink-0 rounded-full p-2 bg-yellow-100 text-yellow-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 rounded-full p-2 bg-gray-100 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </div>
        );
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 px-4 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <p>Aucune notification</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.slice(0, 5).map((notification) => (
                  <li key={notification._id} className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                    <div 
                      onClick={() => handleNotificationClick(
                        notification._id, 
                        notification.link || getDashboardPath()
                      )}
                      className="flex items-start space-x-3 cursor-pointer"
                    >
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-center border-t border-gray-200">
            <div 
              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => router.push(getDashboardPath()), 0);
              }}
            >
              Voir toutes les notifications
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
