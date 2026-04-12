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
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    limit: 10
  });
  const [loadingMore, setLoadingMore] = useState(false);

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

        // Fetch with pagination parameters
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/events/my-events`);
        url.searchParams.append('page', '1');
        url.searchParams.append('limit', '10');

        const response = await fetch(url, {
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
          setPagination({
            page: result.page || 1,
            total: result.total || 0,
            pages: result.pages || 0,
            limit: 10
          });
          console.log('Pagination updated:', { 
            page: result.page, 
            total: result.total, 
            pages: result.pages,
            eventsCount: result.data?.length 
          });
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

  // Load more events
  const loadMoreEvents = async () => {
    if (loadingMore || pagination.page >= pagination.pages) return;

    setLoadingMore(true);

    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const idToken = await currentUser.getIdToken();

      const nextPage = pagination.page + 1;
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/events/my-events`);
      url.searchParams.append('page', nextPage.toString());
      url.searchParams.append('limit', '10');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to load more events');
      }

      if (result.success) {
        setEvents(prevEvents => [...prevEvents, ...(result.data || [])]);
        setPagination(prev => ({
          page: result.page || prev.page,
          total: result.total || prev.total,
          pages: result.pages || prev.pages,
          limit: 10
        }));
        console.log('Loaded more events. Now at page:', result.page);
      }
    } catch (err) {
      console.error('Error loading more events:', err);
      alert(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-roboto text-3xl font-bold text-[#2d2a28] mb-1">
                My Events
              </h1>
              <p className="font-nunito text-[#605B51]">
                Manage all your events in one place
              </p>
            </div>
            <Link href="/dashboard/organizer/events/create">
              <Button variant="primary" size="lg" className="shadow-lg hover:shadow-xl transition-all">
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
        <Card className="p-6 mb-6 shadow-md">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="w-full">
              <label htmlFor="search" className="block text-sm font-bold text-[#2d2a28] mb-2">
                Search Events
              </label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#605B51]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by event title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-[#2d2a28] bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#605B51] hover:text-[#a855f7] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-bold text-[#2d2a28] mb-2">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'active', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-5 py-2.5 rounded-lg font-nunito font-semibold text-sm transition-all capitalize shadow-sm ${
                      filter === status
                        ? 'bg-gradient-to-r from-[#D8D365] to-[#a855f7] text-white shadow-md'
                        : 'bg-white text-[#605B51] hover:bg-gray-50 border border-gray-200 hover:border-[#a855f7]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <Card className="p-12 text-center shadow-md">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-[#2d2a28] mb-2">
              {searchQuery || filter !== 'all' ? 'No events found' : 'No events yet'}
            </h3>
            <p className="text-[#605B51] mb-6">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Create your first event to get started!'}
            </p>
            {!searchQuery && filter === 'all' && (
              <Link href="/dashboard/organizer/events/create">
                <Button variant="primary" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Event
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <>
            {/* Events Count */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm font-medium text-[#2d2a28]">
                    Showing <span className="font-bold text-[#a855f7]">{filteredEvents.length}</span> of{' '}
                    <span className="font-bold text-[#a855f7]">{pagination.total}</span> events
                  </p>
                </div>
                {!searchQuery && filter === 'all' && pagination.total > events.length && (
                  <p className="text-sm text-[#605B51] font-medium">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                )}
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <Card key={event._id} className="p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Link href={`/dashboard/organizer/events/${event._id}`}>
                          <h2 className="font-roboto text-2xl font-bold text-[#2d2a28] hover:text-[#a855f7] transition-colors cursor-pointer">
                            {event.title}
                          </h2>
                        </Link>
                        <Badge className={`${getStatusColor(event.status)} font-semibold`}>
                          {event.status}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-[#605B51]">
                          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center text-[#605B51]">
                          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">{event.venue}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-[#605B51] mb-2">
                          <span className="font-medium">Tickets Sold</span>
                          <span className="font-bold text-[#2d2a28]">
                            {event.ticketsSold} / {event.totalTickets} ({calculateFillPercentage(event.ticketsSold, event.totalTickets)}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-[#D8D365] to-[#a855f7] transition-all duration-500 shadow-sm"
                            style={{ width: `${calculateFillPercentage(event.ticketsSold, event.totalTickets)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-[#605B51]">Revenue:</span>
                          <span className="font-bold text-green-600">
                            ₦{(event.ticketsSold * event.ticketPrice).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-[#605B51]">Price:</span>
                          <span className="font-bold text-[#2d2a28]">
                            ₦{event.ticketPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Link href={`/dashboard/organizer/events/${event._id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/organizer/events/${event._id}/edit`}>
                        <Button variant="outline" size="sm" className="w-full">
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

            {/* Load More Button */}
            {!searchQuery && filter === 'all' && pagination.page < pagination.pages && (
              <div className="mt-8 text-center">
                <Card className="p-6 bg-gradient-to-r from-gray-50 to-white border-2 border-dashed border-gray-300 hover:border-[#a855f7] transition-all">
                  <p className="text-sm text-[#605B51] mb-4 font-medium">
                    {pagination.total - events.length} more events available
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={loadMoreEvents}
                    disabled={loadingMore}
                    className="min-w-[250px] shadow-lg hover:shadow-xl transition-all"
                  >
                    {loadingMore ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Loading Events...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" />
                        </svg>
                        Load More Events
                      </div>
                    )}
                  </Button>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
