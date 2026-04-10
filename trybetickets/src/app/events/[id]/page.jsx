'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function EventDetailsPage({ params }) {
  const resolvedParams = use(params);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  // Mock event data - in real app, fetch based on resolvedParams.id
  const event = {
    id: resolvedParams.id,
    title: 'Summer Music Festival 2026',
    date: 'June 15, 2026',
    time: '6:00 PM - 11:00 PM',
    location: 'Central Park, New York',
    address: '85th Street Transverse, New York, NY 10024',
    category: 'Music',
    image: '/placeholder-event-hero.jpg',
    organizer: {
      name: 'Live Nation Events',
      verified: true,
      followers: '12.5K',
      events: 45,
    },
    description: `Join us for an unforgettable evening of live music under the stars! The Summer Music Festival 2026 brings together some of the biggest names in the industry for a night you won't want to miss.

    Experience world-class performances across multiple stages, featuring diverse genres from rock and pop to electronic and indie. Our carefully curated lineup promises something for everyone.

    Event Highlights:
    • Multiple stages with non-stop performances
    • Food trucks and beverage vendors
    • VIP lounge areas with exclusive amenities
    • Professional sound and lighting production
    • On-site parking and shuttle services

    Please note: This is a rain-or-shine event. Tickets are non-refundable but can be transferred.`,
    ticketTypes: [
      {
        id: 1,
        type: 'General Admission',
        price: 45,
        available: true,
        benefits: ['Access to main grounds', 'All stages access', 'General seating'],
      },
      {
        id: 2,
        type: 'VIP Experience',
        price: 125,
        available: true,
        benefits: ['All GA benefits', 'VIP lounge access', 'Priority entry', 'Complimentary drinks', 'Exclusive merchandise'],
      },
      {
        id: 3,
        type: 'Premium Box',
        price: 350,
        available: true,
        benefits: ['Private box seating', 'Dedicated waiter service', 'Premium catering', 'VIP parking pass', 'Meet & greet opportunity'],
      },
    ],
    stats: {
      attendees: '2.5K+',
      rating: 4.8,
      reviews: 342,
    },
  };

  const relatedEvents = [
    {
      id: 2,
      title: 'Jazz Night Under Stars',
      date: 'May 15, 2026',
      location: 'Waterfront Park',
      price: 'From $30',
      category: 'Music',
    },
    {
      id: 3,
      title: 'Rock Legends Tour',
      date: 'July 8, 2026',
      location: 'Madison Square Garden',
      price: 'From $75',
      category: 'Music',
    },
    {
      id: 4,
      title: 'Electronic Beats Festival',
      date: 'August 20, 2026',
      location: 'Brooklyn Warehouse',
      price: 'From $55',
      category: 'Music',
    },
  ];

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setTicketQuantity(1);
  };

  const totalPrice = selectedTicket ? selectedTicket.price * ticketQuantity : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-125 bg-linear-to-br from-[#D8D365] via-[#a855f7] to-[#9333ea] overflow-hidden">
        <div className="absolute inset-0 bg-[#2d2a28] opacity-40" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-end pb-12">
          <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-[#E6F082] text-[#2d2a28] border-none">
                {event.category}
              </Badge>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {event.stats.attendees} Going
              </span>
            </div>
            <h1 className="font-roboto text-5xl md:text-6xl font-bold text-white mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{event.date}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{event.time}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex gap-8">
                  {['details', 'location', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 font-nunito font-semibold capitalize transition-colors relative ${
                        activeTab === tab
                          ? 'text-[#a855f7]'
                          : 'text-[#605B51] hover:text-[#2d2a28]'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a855f7]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <div>
                  <h2 className="font-roboto text-2xl font-bold text-[#2d2a28] mb-4">
                    About This Event
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="font-nunito text-[#605B51] whitespace-pre-line leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Event Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <Card className="text-center p-6">
                      <div className="text-3xl font-bold text-[#a855f7] mb-1">
                        {event.stats.attendees}
                      </div>
                      <div className="text-sm text-[#605B51]">Attendees</div>
                    </Card>
                    <Card className="text-center p-6">
                      <div className="text-3xl font-bold text-[#a855f7] mb-1">
                        {event.stats.rating}
                      </div>
                      <div className="text-sm text-[#605B51]">Rating</div>
                    </Card>
                    <Card className="text-center p-6">
                      <div className="text-3xl font-bold text-[#a855f7] mb-1">
                        {event.stats.reviews}
                      </div>
                      <div className="text-sm text-[#605B51]">Reviews</div>
                    </Card>
                  </div>

                  {/* Organizer Info */}
                  <Card className="mt-8 p-6">
                    <h3 className="font-roboto text-xl font-semibold text-[#2d2a28] mb-4">
                      Organized By
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-linear-to-br from-[#D8D365] to-[#a855f7] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                          {event.organizer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-roboto font-semibold text-[#2d2a28]">
                              {event.organizer.name}
                            </h4>
                            {event.organizer.verified && (
                              <svg className="w-5 h-5 text-[#a855f7]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-[#605B51]">
                            <span>{event.organizer.followers} Followers</span>
                            <span>•</span>
                            <span>{event.organizer.events} Events</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline">Follow</Button>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'location' && (
                <div>
                  <h2 className="font-roboto text-2xl font-bold text-[#2d2a28] mb-4">
                    Event Location
                  </h2>
                  <Card className="p-6">
                    <div className="mb-4">
                      <h3 className="font-roboto font-semibold text-[#2d2a28] mb-2">
                        {event.location}
                      </h3>
                      <p className="text-[#605B51]">{event.address}</p>
                    </div>
                    {/* Map Placeholder */}
                    <div className="w-full h-64 bg-linear-to-br from-[#D8D365] to-[#a855f7] rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">Map View</span>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" fullWidth>
                        Get Directions
                      </Button>
                      <Button variant="outline" fullWidth>
                        View in Maps
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-roboto text-2xl font-bold text-[#2d2a28]">
                      Reviews & Ratings
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-[#E6F082]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="font-semibold text-[#2d2a28]">
                        {event.stats.rating} ({event.stats.reviews} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-[#D8D365] to-[#a855f7] rounded-full flex items-center justify-center text-white font-bold">
                              U
                            </div>
                            <div>
                              <h4 className="font-roboto font-semibold text-[#2d2a28]">
                                User Name
                              </h4>
                              <p className="text-xs text-[#605B51]">2 days ago</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, j) => (
                              <svg key={j} className="w-4 h-4 text-[#E6F082]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="font-nunito text-[#605B51]">
                          Amazing event! Great organization and fantastic performances. Would definitely attend again!
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Ticket Selection */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="p-6">
                  <h3 className="font-roboto text-xl font-semibold text-[#2d2a28] mb-6">
                    Select Tickets
                  </h3>

                  <div className="space-y-4 mb-6">
                    {event.ticketTypes.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => handleTicketSelect(ticket)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTicket?.id === ticket.id
                            ? 'border-[#a855f7] bg-[#a855f7]/5'
                            : 'border-gray-200 hover:border-[#a855f7]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-roboto font-semibold text-[#2d2a28]">
                              {ticket.type}
                            </h4>
                            <p className="text-2xl font-bold text-[#a855f7] mt-1">
                              ${ticket.price}
                            </p>
                          </div>
                          <input
                            type="radio"
                            checked={selectedTicket?.id === ticket.id}
                            onChange={() => handleTicketSelect(ticket)}
                            className="w-5 h-5 text-[#a855f7] border-gray-300 focus:ring-[#a855f7] cursor-pointer"
                          />
                        </div>
                        <ul className="space-y-1 mt-3">
                          {ticket.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center text-xs text-[#605B51]">
                              <svg className="w-4 h-4 mr-2 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {selectedTicket && (
                    <div className="space-y-4">
                      {/* Quantity Selector */}
                      <div>
                        <label className="block text-sm font-semibold text-[#2d2a28] mb-2">
                          Quantity
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                            className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-[#a855f7] text-[#2d2a28] font-semibold transition-colors"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={ticketQuantity}
                            onChange={(e) => setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent text-[#2d2a28] font-semibold"
                          />
                          <button
                            onClick={() => setTicketQuantity(ticketQuantity + 1)}
                            className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-[#a855f7] text-[#2d2a28] font-semibold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[#605B51]">Total</span>
                          <span className="text-3xl font-bold text-[#2d2a28]">
                            ${totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <Button variant="primary" fullWidth size="lg">
                          Get Tickets
                        </Button>
                      </div>
                    </div>
                  )}

                  {!selectedTicket && (
                    <p className="text-center text-sm text-[#605B51] py-4">
                      Select a ticket type to continue
                    </p>
                  )}
                </Card>

                {/* Share & Actions */}
                <Card className="p-6">
                  <h4 className="font-roboto font-semibold text-[#2d2a28] mb-4">
                    Share Event
                  </h4>
                  <div className="flex gap-2">
                    <button className="flex-1 p-3 border border-gray-300 rounded-lg hover:border-[#a855f7] hover:text-[#a855f7] transition-colors">
                      <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button className="flex-1 p-3 border border-gray-300 rounded-lg hover:border-[#a855f7] hover:text-[#a855f7] transition-colors">
                      <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </button>
                    <button className="flex-1 p-3 border border-gray-300 rounded-lg hover:border-[#a855f7] hover:text-[#a855f7] transition-colors">
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Related Events */}
          <div className="mt-16">
            <h2 className="font-roboto text-3xl font-bold text-[#2d2a28] mb-8">
              You Might Also Like
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedEvents.map((relatedEvent) => (
                <Link key={relatedEvent.id} href={`/events/${relatedEvent.id}`}>
                  <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 bg-linear-to-br from-[#D8D365] to-[#a855f7] rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 bg-[#2d2a28] opacity-20 group-hover:opacity-10 transition-opacity" />
                    </div>
                    <div className="p-5">
                      <Badge className="mb-2 text-xs">{relatedEvent.category}</Badge>
                      <h3 className="font-roboto text-lg font-semibold text-[#2d2a28] mb-2 group-hover:text-[#a855f7] transition-colors">
                        {relatedEvent.title}
                      </h3>
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center text-xs text-[#605B51]">
                          <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {relatedEvent.date}
                        </div>
                        <div className="flex items-center text-xs text-[#605B51]">
                          <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {relatedEvent.location}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="font-roboto font-semibold text-[#a855f7]">
                          {relatedEvent.price}
                        </span>
                        <span className="text-xs font-medium text-[#605B51] group-hover:text-[#a855f7] transition-colors">
                          View Event →
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
