'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'organizer') {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch event data
  useEffect(() => {
    if (authLoading || !isAuthenticated || !eventId) return;

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { auth } = await import('@/lib/firebase');
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          throw new Error('No authenticated user found');
        }
        
        const idToken = await currentUser.getIdToken();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch event');
        }

        if (result.success && result.data) {
          // Check if user owns this event
          if (result.data.organizerId._id !== user.uid && result.data.organizerId !== user.uid) {
            throw new Error('You do not have permission to view this event');
          }
          setEvent(result.data);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [authLoading, isAuthenticated, eventId, user, router]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || colors.draft;
  };

  const calculateFillPercentage = (sold, total) => {
    if (total === 0) return 0;
    return ((sold / total) * 100).toFixed(1);
  };

  const calculateTotalRevenue = () => {
    if (!event) return 0;
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((sum, ticket) => 
        sum + (ticket.price * ticket.sold), 0
      );
    }
    return event.ticketsSold * event.ticketPrice;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#605B51]">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#2d2a28] mb-2">Error Loading Event</h2>
          <p className="text-[#605B51] mb-6">{error}</p>
          <Link href="/dashboard/organizer/events">
            <Button variant="primary">Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const totalSold = event.ticketTypes && event.ticketTypes.length > 0
    ? event.ticketTypes.reduce((sum, t) => sum + t.sold, 0)
    : event.ticketsSold;

  const totalAvailable = event.ticketTypes && event.ticketTypes.length > 0
    ? event.ticketTypes.reduce((sum, t) => sum + t.quantity, 0)
    : event.totalTickets;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard/organizer/events">
              <button className="flex items-center gap-2 text-[#605B51] hover:text-[#a855f7] transition-colors font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Events
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/organizer/events/${eventId}/edit`}>
                <button className="px-5 py-2.5 bg-white text-[#605B51] border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#a855f7] transition-all font-nunito font-semibold flex items-center gap-2 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Event
                </button>
              </Link>
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-roboto text-4xl font-bold text-[#2d2a28]">
                  {event.title}
                </h1>
                <Badge className={`${getStatusColor(event.status)} font-semibold text-sm px-4 py-1.5 capitalize`}>
                  {event.status}
                </Badge>
              </div>
              {event.category && (
                <p className="text-[#605B51] font-medium mb-2">
                  <span className="text-[#a855f7]">Category:</span> {event.category}
                </p>
              )}
              <div className="flex items-center gap-6 text-[#605B51]">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Capacity */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#D8D365] to-[#a855f7] rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-nunito text-[#605B51] mb-1">Event Capacity</h3>
            <p className="text-3xl font-bold text-[#2d2a28]">
              {event.eventCapacity?.toLocaleString() || totalAvailable.toLocaleString()}
            </p>
          </Card>

          {/* Tickets Sold */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#a855f7]/10 rounded-lg">
                <svg className="w-6 h-6 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-nunito text-[#605B51] mb-1">Tickets Sold</h3>
            <p className="text-3xl font-bold text-[#2d2a28]">
              {totalSold.toLocaleString()}
            </p>
            <p className="text-xs text-[#605B51] mt-2">
              of {totalAvailable.toLocaleString()} available
            </p>
          </Card>

          {/* Revenue */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-nunito text-[#605B51] mb-1">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
              ₦{calculateTotalRevenue().toLocaleString()}
            </p>
          </Card>

          {/* Fill Rate */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-nunito text-[#605B51] mb-1">Fill Rate</h3>
            <p className="text-3xl font-bold text-[#2d2a28]">
              {calculateFillPercentage(totalSold, totalAvailable)}%
            </p>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-roboto text-lg font-semibold text-[#2d2a28]">Ticket Sales Progress</h3>
            <span className="text-sm font-bold text-[#605B51]">
              {totalSold} / {totalAvailable} tickets sold
            </span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#D8D365] to-[#a855f7] transition-all duration-500 shadow-sm"
              style={{ width: `${calculateFillPercentage(totalSold, totalAvailable)}%` }}
            />
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Event Description */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D8D365] to-[#a855f7] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <h2 className="font-roboto text-2xl font-semibold text-[#2d2a28]">
                Event Description
              </h2>
            </div>
            <p className="text-[#605B51] leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </Card>

          {/* Organizer Info */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D8D365] to-[#a855f7] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="font-roboto text-2xl font-semibold text-[#2d2a28]">
                Organizer Information
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-[#605B51] mb-1">Organizer Name</p>
                <p className="text-lg text-[#2d2a28] font-medium">{event.organizerName}</p>
              </div>
              {event.organizerContact && (
                <div>
                  <p className="text-sm font-bold text-[#605B51] mb-1">Contact Email</p>
                  <a 
                    href={`mailto:${event.organizerContact}`}
                    className="text-lg text-[#a855f7] hover:underline"
                  >
                    {event.organizerContact}
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Ticket Types */}
        {event.ticketTypes && event.ticketTypes.length > 0 && (
          <Card className="p-8 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D8D365] to-[#a855f7] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h2 className="font-roboto text-2xl font-semibold text-[#2d2a28]">
                Ticket Types
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {event.ticketTypes.map((ticket, index) => (
                <div
                  key={index}
                  className="p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-roboto text-lg font-bold text-[#2d2a28] mb-1">
                        {ticket.name}
                      </h3>
                      <p className="text-2xl font-bold text-[#a855f7]">
                        ₦{ticket.price.toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/30 font-semibold">
                      {ticket.sold} / {ticket.quantity} sold
                    </Badge>
                  </div>

                  {/* Progress bar for this ticket type */}
                  <div className="mb-3">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D8D365] to-[#a855f7] transition-all"
                        style={{ width: `${calculateFillPercentage(ticket.sold, ticket.quantity)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#605B51]">Available:</span>
                    <span className="font-bold text-[#2d2a28]">
                      {ticket.quantity - ticket.sold} tickets
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-[#605B51]">Revenue:</span>
                    <span className="font-bold text-green-600">
                      ₦{(ticket.price * ticket.sold).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
