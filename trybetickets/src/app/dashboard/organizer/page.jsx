'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function OrganizerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/organizers/dashboard', { credentials: 'include' });
        // const data = await response.json();
        
        // Mock data matching backend response structure
        const mockData = {
          profile: {
            id: '1',
            email: 'organizer@example.com',
            role: 'organizer',
            organizerProfile: {
              companyName: 'Live Nation Events',
              description: 'Professional event management company specializing in music festivals and concerts.',
              website: 'https://livenation.com',
              logo: null,
              status: 'approved',
              approvedAt: '2026-01-10T00:00:00Z',
            },
          },
          stats: {
            events: {
              total: 12,
              active: 5,
              completed: 6,
              cancelled: 1,
            },
            tickets: {
              totalSold: 2847,
              checkedIn: 1923,
              checkInRate: '67.55%',
            },
            revenue: {
              total: 142350,
              currency: 'USD',
            },
          },
          recentEvents: [
            {
              _id: 'event1',
              title: 'Summer Music Festival 2026',
              date: '2026-06-15T18:00:00Z',
              status: 'active',
              ticketsSold: 850,
              totalTickets: 1000,
              ticketPrice: 45,
            },
            {
              _id: 'event2',
              title: 'Tech Innovation Summit',
              date: '2026-05-20T09:00:00Z',
              status: 'active',
              ticketsSold: 450,
              totalTickets: 500,
              ticketPrice: 199,
            },
            {
              _id: 'event3',
              title: 'Jazz Night Under Stars',
              date: '2026-05-15T19:30:00Z',
              status: 'active',
              ticketsSold: 120,
              totalTickets: 200,
              ticketPrice: 30,
            },
            {
              _id: 'event4',
              title: 'Food & Wine Expo',
              date: '2026-04-25T12:00:00Z',
              status: 'completed',
              ticketsSold: 680,
              totalTickets: 700,
              ticketPrice: 35,
            },
            {
              _id: 'event5',
              title: 'New Year Gala 2026',
              date: '2026-01-01T20:00:00Z',
              status: 'completed',
              ticketsSold: 300,
              totalTickets: 300,
              ticketPrice: 350,
            },
          ],
        };

        setDashboardData(mockData);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
                Organizer Dashboard
              </h1>
              <p className="font-nunito text-[#605B51]">
                {dashboardData?.profile.organizerProfile.companyName}
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
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Events */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#E6F082]/20 rounded-lg">
                <svg className="w-6 h-6 text-[#2d2a28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                {dashboardData?.stats.events.active} Active
              </Badge>
            </div>
            <h3 className="text-sm font-nunito text-[#605B51] mb-1">Total Events</h3>
            <p className="text-3xl font-bold text-[#2d2a28]">{dashboardData?.stats.events.total}</p>
            <div className="flex gap-4 mt-3 text-xs text-[#605B51]">
              <span>{dashboardData?.stats.events.completed} Completed</span>
              <span>•</span>
              <span>{dashboardData?.stats.events.cancelled} Cancelled</span>
            </div>
          </Card>

          {/* Tickets Sold */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#a855f7]/10 rounded-lg">
                <svg className="w-6 h-6 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                {dashboardData?.stats.tickets.checkInRate}
              </Badge>
            </div>
            <h3 className="text-sm font-nunito text-[#605B51] mb-1">Tickets Sold</h3>
            <p className="text-3xl font-bold text-[#2d2a28]">{dashboardData?.stats.tickets.totalSold.toLocaleString()}</p>
            <p className="text-xs text-[#605B51] mt-3">
              {dashboardData?.stats.tickets.checkedIn.toLocaleString()} checked in
            </p>
          </Card>

          {/* Total Revenue */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-nunito text-[#605B51] mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-[#2d2a28]">
              ${dashboardData?.stats.revenue.total.toLocaleString()}
            </p>
            <p className="text-xs text-[#605B51] mt-3">{dashboardData?.stats.revenue.currency}</p>
          </Card>

          {/* Company Profile */}
          <Card className="p-6 bg-linear-to-br from-[#E6F082]/20 to-[#a855f7]/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                {dashboardData?.profile.organizerProfile.status}
              </Badge>
            </div>
            <h3 className="text-sm font-nunito text-[#605B51] mb-1">Your Status</h3>
            <p className="text-lg font-bold text-[#2d2a28]">Verified Organizer</p>
            <Link href="/dashboard/organizer/profile">
              <button className="text-xs text-[#a855f7] hover:underline mt-3">
                View Profile →
              </button>
            </Link>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-roboto text-2xl font-bold text-[#2d2a28]">Recent Events</h2>
            <Link href="/dashboard/organizer/events">
              <Button variant="outline" size="sm">View All Events</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {dashboardData?.recentEvents.map((event) => (
              <div
                key={event._id}
                className="border-2 border-gray-200 rounded-lg p-5 hover:border-[#a855f7] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link href={`/dashboard/organizer/events/${event._id}`}>
                        <h3 className="font-roboto text-lg font-semibold text-[#2d2a28] hover:text-[#a855f7] transition-colors">
                          {event.title}
                        </h3>
                      </Link>
                      <span className={`text-xs px-3 py-1 rounded-full border capitalize ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#605B51] mb-3">
                      {formatDate(event.date)}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-[#605B51] mb-1">
                        <span>Tickets Sold</span>
                        <span className="font-semibold">
                          {event.ticketsSold} / {event.totalTickets} ({calculateFillPercentage(event.ticketsSold, event.totalTickets)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-[#D8D365] to-[#a855f7] transition-all"
                          style={{ width: `${calculateFillPercentage(event.ticketsSold, event.totalTickets)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-[#605B51]">Revenue: </span>
                        <span className="font-semibold text-[#2d2a28]">
                          ${(event.ticketsSold * event.ticketPrice).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#605B51]">Price: </span>
                        <span className="font-semibold text-[#2d2a28]">${event.ticketPrice}</span>
                      </div>
                    </div>
                  </div>

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
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
