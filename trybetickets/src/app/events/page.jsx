'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          page: pagination.page,
          limit: pagination.limit,
          status: 'active',
          upcoming: 'true'
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        
        if (data.success) {
          setEvents(data.data || []);
          setPagination(prev => ({
            ...prev,
            total: data.total || 0,
            pages: data.pages || 1
          }));
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [pagination.page, pagination.limit]);

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time helper
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Extract category from description or use default
  const getEventCategory = (event) => {
    // Try to find category in description or default to 'Event'
    const description = event.description?.toLowerCase() || '';
    if (description.includes('music') || description.includes('concert')) return 'Music';
    if (description.includes('sport') || description.includes('marathon')) return 'Sports';
    if (description.includes('tech') || description.includes('conference')) return 'Technology';
    if (description.includes('art') || description.includes('gallery')) return 'Arts';
    if (description.includes('food') || description.includes('wine')) return 'Food & Drink';
    if (description.includes('business')) return 'Business';
    return 'Event';
  };

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    // Search filter
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const eventCategory = getEventCategory(event);
      if (eventCategory !== selectedCategory) {
        return false;
      }
    }

    // Price filter
    if (priceRange !== 'all') {
      const price = event.ticketPrice;
      if (priceRange === 'free' && price > 0) return false;
      if (priceRange === 'under50' && price >= 50) return false;
      if (priceRange === '50-100' && (price < 50 || price > 100)) return false;
      if (priceRange === 'over100' && price <= 100) return false;
    }

    return true;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date) - new Date(b.date);
      case 'price-low':
        return a.ticketPrice - b.ticketPrice;
      case 'price-high':
        return b.ticketPrice - a.ticketPrice;
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Get featured events (first 3)
  const featuredEvents = sortedEvents.slice(0, 3);

  const categories = [
    'All Events',
    'Music',
    'Arts',
    'Sports',
    'Technology',
    'Food & Drink',
    'Business',
    'Entertainment',
  ];

  const dateFilters = [
    { label: 'All Dates', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
  ];

  const priceFilters = [
    { label: 'All Prices', value: 'all' },
    { label: 'Free', value: 'free' },
    { label: 'Under $50', value: 'under50' },
    { label: '$50 - $100', value: '50-100' },
    { label: 'Over $100', value: 'over100' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#605B51]">Loading events...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <section className="relative bg-white pt-32 pb-20 overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#a855f7] opacity-20 blur-3xl rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-roboto text-5xl md:text-6xl font-bold text-[#2d2a28] mb-6">
              Discover Amazing Events
            </h1>
            <p className="font-nunito text-lg text-[#605B51] mb-10">
              Find and book tickets for concerts, festivals, sports, and more
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search events, categories, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-14 bg-white text-[#2d2a28] border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all placeholder:text-gray-400 shadow-lg"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#E6F082] hover:bg-[#D8D365] rounded-lg transition-colors">
                <svg className="w-6 h-6 text-[#2d2a28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === 'All Events' ? 'all' : category)}
                  className={`px-5 py-2 rounded-full font-nunito font-medium text-sm transition-all ${
                    (selectedCategory === 'all' && category === 'All Events') ||
                    selectedCategory === category
                      ? 'bg-[#a855f7] text-white shadow-md'
                      : 'bg-white text-[#605B51] border border-gray-200 hover:border-[#a855f7] hover:text-[#a855f7]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-roboto text-3xl font-bold text-[#2d2a28] mb-2">
                Featured Events
              </h2>
              <p className="font-nunito text-[#605B51]">
                Don't miss out on these popular events
              </p>
            </div>
            <Link href="/events/featured">
              <Button variant="outline">View All Featured</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredEvents.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-[#605B51] text-lg">No featured events available at the moment.</p>
              </div>
            ) : (
              featuredEvents.map((event) => (
                <Link key={event._id} href={`/events/${event._id}`}>
                  <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Event Image */}
                    <div className="relative h-56 bg-gradient-to-br from-[#D8D365] to-[#a855f7] overflow-hidden">
                      <div className="absolute inset-0 bg-[#2d2a28] opacity-20 group-hover:opacity-10 transition-opacity" />
                      <Badge className="absolute top-4 right-4 bg-[#E6F082] text-[#2d2a28] border-none">
                        Featured
                      </Badge>
                    </div>

                    {/* Event Info */}
                    <div className="p-6">
                      <Badge className="mb-3">{getEventCategory(event.title)}</Badge>
                      <h3 className="font-roboto text-xl font-semibold text-[#2d2a28] mb-3 group-hover:text-[#a855f7] transition-colors">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-[#605B51]">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(event.date)} • {formatTime(event.date)}
                        </div>
                        <div className="flex items-center text-sm text-[#605B51]">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.venue}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="font-roboto font-semibold text-[#a855f7] text-lg">
                          {event.ticketPrice === 0 ? 'Free' : `From ₦${event.ticketPrice.toLocaleString()}`}
                        </span>
                        <span className="text-sm font-medium text-[#605B51] group-hover:text-[#a855f7] transition-colors">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* All Events with Filters */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 space-y-6">
              <div>
                <h3 className="font-roboto font-semibold text-[#2d2a28] mb-4">
                  Filters
                </h3>
              </div>

              {/* Date Filter */}
              <div>
                <h4 className="font-nunito font-semibold text-sm text-[#2d2a28] mb-3">
                  Date
                </h4>
                <div className="space-y-2">
                  {dateFilters.map((filter) => (
                    <label key={filter.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="date"
                        value={filter.value}
                        checked={selectedDate === filter.value}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-4 h-4 text-[#a855f7] border-gray-300 focus:ring-[#a855f7]"
                      />
                      <span className="ml-3 text-sm text-[#605B51]">{filter.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h4 className="font-nunito font-semibold text-sm text-[#2d2a28] mb-3">
                  Price Range
                </h4>
                <div className="space-y-2">
                  {priceFilters.map((filter) => (
                    <label key={filter.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value={filter.value}
                        checked={priceRange === filter.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-4 h-4 text-[#a855f7] border-gray-300 focus:ring-[#a855f7]"
                      />
                      <span className="ml-3 text-sm text-[#605B51]">{filter.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h4 className="font-nunito font-semibold text-sm text-[#2d2a28] mb-3">
                  Sort By
                </h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-[#2d2a28] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-colors text-sm"
                >
                  <option value="date">Date</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popularity">Popularity</option>
                  <option value="name">Event Name</option>
                </select>
              </div>

              {/* Clear Filters */}
              <Button variant="outline" fullWidth onClick={() => {
                setSelectedCategory('all');
                setSelectedDate('all');
                setPriceRange('all');
                setSortBy('date');
                setSearchQuery('');
              }}>
                Clear All Filters
              </Button>
            </aside>

            {/* Events Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-roboto text-2xl font-bold text-[#2d2a28]">
                  All Events
                </h2>
                <span className="text-sm text-[#605B51]">
                  Showing {sortedEvents.length} events
                </span>
              </div>

              {sortedEvents.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">🎫</div>
                  <h3 className="text-xl font-semibold text-[#2d2a28] mb-2">No Events Found</h3>
                  <p className="text-[#605B51] mb-6">
                    {searchQuery || selectedCategory !== 'all' || priceRange !== 'all' 
                      ? 'Try adjusting your filters to find more events.'
                      : 'No events are currently available.'}
                  </p>
                  {(searchQuery || selectedCategory !== 'all' || priceRange !== 'all') && (
                    <Button variant="outline" onClick={() => {
                      setSelectedCategory('all');
                      setSelectedDate('all');
                      setPriceRange('all');
                      setSortBy('date');
                      setSearchQuery('');
                    }}>
                      Clear All Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedEvents.map((event) => (
                    <Link key={event._id} href={`/events/${event._id}`}>
                      <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 h-full">
                        {/* Event Image */}
                        <div className="relative h-48 bg-gradient-to-br from-[#D8D365] to-[#a855f7] overflow-hidden rounded-t-lg">
                          <div className="absolute inset-0 bg-[#2d2a28] opacity-20 group-hover:opacity-10 transition-opacity" />
                        </div>

                        {/* Event Info */}
                        <div className="p-5">
                          <Badge className="mb-2 text-xs">{getEventCategory(event.title)}</Badge>
                          <h3 className="font-roboto text-lg font-semibold text-[#2d2a28] mb-2 group-hover:text-[#a855f7] transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                          
                          <div className="space-y-1.5 mb-3">
                            <div className="flex items-center text-xs text-[#605B51]">
                              <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(event.date)} • {formatTime(event.date)}
                            </div>
                            <div className="flex items-center text-xs text-[#605B51] line-clamp-1">
                              <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.venue}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="font-roboto font-semibold text-[#a855f7]">
                              {event.ticketPrice === 0 ? 'Free' : `From ₦${event.ticketPrice.toLocaleString()}`}
                            </span>
                            <span className="text-xs font-medium text-[#605B51] group-hover:text-[#a855f7] transition-colors">
                              Details →
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-[#605B51] hover:border-[#a855f7] hover:text-[#a855f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setPagination(p => ({ ...p, page: pageNum }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-[#a855f7] text-white'
                          : 'border border-gray-300 text-[#605B51] hover:border-[#a855f7] hover:text-[#a855f7]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-[#605B51] hover:border-[#a855f7] hover:text-[#a855f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
