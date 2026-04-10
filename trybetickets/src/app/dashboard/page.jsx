'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual API calls
        // const profileRes = await fetch('/api/users/profile', { credentials: 'include' });
        // const ticketsRes = await fetch('/api/users/tickets', { credentials: 'include' });
        
        // Mock data matching backend response structure
        const mockProfile = {
          _id: '1',
          email: 'user@example.com',
          name: 'John Doe',
          phone: '+1234567890',
          role: 'user',
          avatar: null,
          createdAt: '2026-01-15T00:00:00Z',
        };

        const mockTickets = {
          upcoming: [
            {
              _id: 'ticket1',
              ticketNumber: 'TT-2026-001234',
              eventId: {
                _id: 'event1',
                title: 'Summer Music Festival 2026',
                date: '2026-06-15T18:00:00Z',
                location: 'Central Park, New York',
                category: 'Music',
              },
              ticketType: 'VIP Experience',
              amountPaid: 125,
              quantity: 2,
              status: 'confirmed',
              qrCode: 'QR_CODE_STRING',
              purchaseDate: '2026-04-01T10:00:00Z',
            },
            {
              _id: 'ticket2',
              ticketNumber: 'TT-2026-001235',
              eventId: {
                _id: 'event2',
                title: 'Tech Innovation Summit',
                date: '2026-05-20T09:00:00Z',
                location: 'Convention Center, SF',
                category: 'Technology',
              },
              ticketType: 'General Admission',
              amountPaid: 199,
              quantity: 1,
              status: 'confirmed',
              qrCode: 'QR_CODE_STRING_2',
              purchaseDate: '2026-03-25T15:30:00Z',
            },
          ],
          past: [
            {
              _id: 'ticket3',
              ticketNumber: 'TT-2026-001100',
              eventId: {
                _id: 'event3',
                title: 'New Year Gala 2026',
                date: '2026-01-01T20:00:00Z',
                location: 'Grand Ballroom, NY',
                category: 'Entertainment',
              },
              ticketType: 'Premium Box',
              amountPaid: 350,
              quantity: 2,
              status: 'used',
              qrCode: 'QR_CODE_STRING_3',
              purchaseDate: '2025-12-15T12:00:00Z',
            },
          ],
        };

        setProfile(mockProfile);
        setTickets(mockTickets);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#605B51]">Loading your dashboard...</p>
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
                My Dashboard
              </h1>
              <p className="font-nunito text-[#605B51]">
                Welcome back, {profile?.name || 'User'}!
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
                  {profile?.name?.charAt(0) || 'U'}
                </div>
                <h2 className="font-roboto text-xl font-semibold text-[#2d2a28] mb-1">
                  {profile?.name}
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
                  <span className="font-bold text-[#a855f7]">{tickets.upcoming.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#605B51]">Past Events</span>
                  <span className="font-bold text-[#605B51]">{tickets.past.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#605B51]">Total Tickets</span>
                  <span className="font-bold text-[#2d2a28]">
                    {tickets.upcoming.reduce((sum, t) => sum + t.quantity, 0) +
                      tickets.past.reduce((sum, t) => sum + t.quantity, 0)}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-sm text-[#605B51]">Total Spent</span>
                  <p className="text-2xl font-bold text-[#2d2a28] mt-1">
                    $
                    {(
                      tickets.upcoming.reduce((sum, t) => sum + t.amountPaid, 0) +
                      tickets.past.reduce((sum, t) => sum + t.amountPaid, 0)
                    ).toFixed(2)}
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
                    Upcoming Events ({tickets.upcoming.length})
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
                    Past Events ({tickets.past.length})
                    {activeTab === 'past' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a855f7]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Ticket List */}
              <div className="space-y-4">
                {(activeTab === 'upcoming' ? tickets.upcoming : tickets.past).length === 0 ? (
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
                  (activeTab === 'upcoming' ? tickets.upcoming : tickets.past).map((ticket) => (
                    <div
                      key={ticket._id}
                      className="border-2 border-gray-200 rounded-lg p-5 hover:border-[#a855f7] transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="text-xs">{ticket.eventId.category}</Badge>
                            <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <Link href={`/events/${ticket.eventId._id}`}>
                            <h3 className="font-roboto text-lg font-semibold text-[#2d2a28] hover:text-[#a855f7] transition-colors mb-2">
                              {ticket.eventId.title}
                            </h3>
                          </Link>
                          <div className="space-y-1.5">
                            <div className="flex items-center text-sm text-[#605B51]">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(ticket.eventId.date)} at {formatTime(ticket.eventId.date)}
                            </div>
                            <div className="flex items-center text-sm text-[#605B51]">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {ticket.eventId.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#a855f7]">${ticket.amountPaid}</p>
                          <p className="text-xs text-[#605B51] mt-1">{ticket.quantity} x {ticket.ticketType}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-xs text-[#605B51]">
                          Ticket: <span className="font-mono font-semibold">{ticket.ticketNumber}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/tickets/${ticket._id}`}>
                            <Button variant="outline" size="sm">
                              View Ticket
                            </Button>
                          </Link>
                          {ticket.status === 'confirmed' && (
                            <Button variant="primary" size="sm">
                              Download QR
                            </Button>
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
