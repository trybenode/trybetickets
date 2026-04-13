'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [tickets, setTickets] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      // Check if user has correct role
      if (user?.role === 'organizer') {
        router.push('/dashboard/organizer');
        return;
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch user profile and tickets
  useEffect(() => {
    // Don't fetch if still checking auth or not authenticated
    if (authLoading || !isAuthenticated) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { auth } = await import('@/lib/firebase');
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          throw new Error('No authenticated user found');
        }
        
        // Store Firebase user for displayName access
        setFirebaseUser(currentUser);
        
        // Force reload to get latest profile data from Firebase
        await currentUser.reload();
        
        const idToken = await currentUser.getIdToken(true); // Force refresh token

        // Fetch user profile
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (!profileRes.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile(profileData.data);
        }

        // Fetch user tickets
        const ticketsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/tickets`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (!ticketsRes.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const ticketsData = await ticketsRes.json();
        if (ticketsData.success) {
          setTickets({
            upcoming: ticketsData.data.upcoming || [],
            past: ticketsData.data.past || [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, isAuthenticated]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      used: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || colors.confirmed;
  };

  const groupTicketsByEvent = (ticketList = []) => {
    const grouped = ticketList.reduce((acc, ticket) => {
      const eventId = ticket.eventId?._id;
      if (!eventId) return acc;

      if (!acc[eventId]) {
        acc[eventId] = {
          eventId,
          event: ticket.eventId,
          tickets: [],
          totalSpent: 0,
        };
      }

      acc[eventId].tickets.push(ticket);
      acc[eventId].totalSpent += ticket.amountPaid || 0;
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const groupedUpcoming = groupTicketsByEvent(tickets.upcoming);
  const groupedPast = groupTicketsByEvent(tickets.past);
  const currentGroups = activeTab === 'upcoming' ? groupedUpcoming : groupedPast;

  // Show loading while checking authentication or fetching data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#605B51]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-roboto text-3xl font-bold text-[#2d2a28] mb-2">
                My Dashboard
              </h1>
              <p className="font-nunito text-[#605B51]">
                Welcome back, {profile?.name || firebaseUser?.displayName || user?.name || 'User'}!
              </p>
            </div>
            <Link href="/events">
              <Button variant="primary">Browse Events</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-linear-to-br from-[#D8D365] to-[#a855f7] rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                  {(profile?.name || firebaseUser?.displayName || user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <h2 className="font-roboto text-xl font-semibold text-[#2d2a28] mb-1">
                  {profile?.name || firebaseUser?.displayName || user?.name || 'Guest User'}
                </h2>
                <p className="text-sm text-[#605B51] mb-4">{profile?.email}</p>
                <Badge className="mb-4 capitalize">{profile?.role}</Badge>
                
                <Link href="/dashboard/profile">
                  <Button variant="outline" fullWidth size="sm">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-6">
              <h3 className="font-roboto font-semibold text-[#2d2a28] mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#605B51]">Upcoming Events</span>
                  <span className="font-bold text-[#a855f7]">{groupedUpcoming.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#605B51]">Past Events</span>
                  <span className="font-bold text-[#605B51]">{groupedPast.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#605B51]">Total Events</span>
                  <span className="font-bold text-[#2d2a28]">
                    {groupedUpcoming.length + groupedPast.length}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-sm text-[#605B51]">Total Spent</span>
                  <p className="text-2xl font-bold text-[#2d2a28] mt-1">
                    ₦
                    {(
                      tickets.upcoming.reduce((sum, t) => sum + (t.amountPaid || 0), 0) +
                      tickets.past.reduce((sum, t) => sum + (t.amountPaid || 0), 0)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Tickets */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`pb-4 font-nunito font-semibold transition-colors relative ${
                      activeTab === 'upcoming'
                        ? 'text-[#a855f7]'
                        : 'text-[#605B51] hover:text-[#2d2a28]'
                    }`}
                  >
                    Upcoming Events ({groupedUpcoming.length})
                    {activeTab === 'upcoming' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a855f7]" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`pb-4 font-nunito font-semibold transition-colors relative ${
                      activeTab === 'past'
                        ? 'text-[#a855f7]'
                        : 'text-[#605B51] hover:text-[#2d2a28]'
                    }`}
                  >
                    Past Events ({groupedPast.length})
                    {activeTab === 'past' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a855f7]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Ticket List */}
              <div className="space-y-4">
                {currentGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                    <h3 className="font-roboto font-semibold text-[#2d2a28] mb-2">
                      No {activeTab} events
                    </h3>
                    <p className="text-sm text-[#605B51] mb-4">
                      {activeTab === 'upcoming'
                        ? "You haven't purchased any tickets yet."
                        : "You don't have any past events."}
                    </p>
                    {activeTab === 'upcoming' && (
                      <Link href="/events">
                        <Button variant="primary">Browse Events</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  currentGroups.map((group) => (
                    <div
                      key={group.eventId}
                      className="border-2 border-gray-200 rounded-lg p-5 hover:border-[#a855f7] transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="text-xs capitalize">{group.event?.category || 'Event'}</Badge>
                            <span className="text-xs px-3 py-1 rounded-full border bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20">
                              {group.tickets.length} {group.tickets.length === 1 ? 'ticket' : 'tickets'}
                            </span>
                          </div>
                          <Link href={`/events/${group.event?._id}`}>
                            <h3 className="font-roboto text-lg font-semibold text-[#2d2a28] hover:text-[#a855f7] transition-colors mb-2">
                              {group.event?.title || 'Unknown Event'}
                            </h3>
                          </Link>
                          <div className="space-y-1.5">
                            <div className="flex items-center text-sm text-[#605B51]">
                              <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {group.event?.date ? `${formatDate(group.event.date)} at ${formatTime(group.event.date)}` : 'Date TBD'}
                            </div>
                            <div className="flex items-center text-sm text-[#605B51]">
                              <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {group.event?.venue || 'Venue TBD'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#a855f7]">₦{group.totalSpent.toLocaleString()}</p>
                          <p className="text-xs text-[#605B51] mt-1">{group.tickets[0]?.buyerName}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-xs text-[#605B51]">
                          Latest Ticket: <span className="font-mono font-semibold">{group.tickets[0]?.qrToken?.substring(0, 8)}...</span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/tickets/${group.eventId}`}>
                            <Button variant="outline" size="sm">
                              View Tickets
                            </Button>
                          </Link>
                          {group.tickets.some((t) => t.status === 'valid') && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${group.tickets.find((t) => t.status === 'valid')._id}/qr`}
                              download={`ticket-${group.tickets.find((t) => t.status === 'valid').qrToken}.png`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="primary" size="sm">
                                Download Latest QR
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
