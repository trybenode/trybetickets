'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled
  const [searchQuery, setSearchQuery] = useState('');

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'organizer') {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch organizer's events
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const { auth } = await import('@/lib/firebase');
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          throw new Error('No authenticated user found');
        }
        
        const idToken = await currentUser.getIdToken();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/my-events`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch events');
        }

        if (result.success) {
          setEvents(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [authLoading, isAuthenticated]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
    return ((sold / total) * 100).toFixed(0);
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    if (filter !== 'all' && event.status !== filter) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#605B51]">Loading your events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#2d2a28] mb-2">Failed to Load Events</h2>
          <p className="text-[#605B51] mb-6">{error}</p>
          <Button variant="purple" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-roboto text-3xl font-bold text-[#2d2a28] mb-2">
                My Events
              </h1>
              <p className="font-nunito text-[#605B51]">
                Manage all your events in one place
              </p>
            </div>
            <Link href="/dashboard/organizer/events/create">
              <Button variant="primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-96">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'active', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-nunito font-medium text-sm transition-all capitalize ${
                    filter === status
                      ? 'bg-[#a855f7] text-white'
                      : 'bg-gray-100 text-[#605B51] hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-[#2d2a28] mb-2">
              {searchQuery || filter !== 'all' ? 'No events found' : 'No events yet'}
            </h3>
            <p className="text-[#605B51] mb-6">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first event to get started!'}
            </p>
            {!searchQuery && filter === 'all' && (
              <Link href="/dashboard/organizer/events/create">
                <Button variant="primary">Create Event</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.map((event) => (
              <Card key={event._id} className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Link href={`/dashboard/organizer/events/${event._id}`}>
                        <h2 className="font-roboto text-2xl font-semibold text-[#2d2a28] hover:text-[#a855f7] transition-colors">
                          {event.title}
                        </h2>
                      </Link>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-[#605B51]">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-[#605B51]">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.venue}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-[#605B51] mb-2">
                        <span>Tickets Sold</span>
                        <span className="font-semibold">
                          {event.ticketsSold} / {event.totalTickets} ({calculateFillPercentage(event.ticketsSold, event.totalTickets)}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D8D365] to-[#a855f7] transition-all"
                          style={{ width: `${calculateFillPercentage(event.ticketsSold, event.totalTickets)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-[#605B51]">Revenue: </span>
                        <span className="font-semibold text-[#2d2a28]">
                          ₦{(event.ticketsSold * event.ticketPrice).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#605B51]">Price: </span>
                        <span className="font-semibold text-[#2d2a28]">
                          ₦{event.ticketPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <Link href={`/dashboard/organizer/events/${event._id}`}>
                      <Button variant="outline" size="sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/organizer/events/${event._id}/edit`}>
                      <Button variant="outline" size="sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
