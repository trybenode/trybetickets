'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function EventDetailsPage({ params }) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  
  // Review form state
  const [user, setUser] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState(null);
  
  // Purchase state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${resolvedParams.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch event: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch event');
        }
        
        setEvent(data.data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchEvent();
    }
  }, [resolvedParams.id]);

  // Fetch reviews when reviews tab is active
  useEffect(() => {
    const fetchReviews = async () => {
      if (activeTab !== 'reviews' || !resolvedParams.id) return;
      
      try {
        setReviewsLoading(true);
        setReviewError(null);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events/${resolvedParams.id}/reviews`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setReviews(data.data || []);
          setReviewStats(data.stats || { averageRating: 0, totalReviews: 0 });
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviewError(err.message);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [activeTab, resolvedParams.id]);

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTicketTypes = () => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes;
    }
    // Fallback for events without ticketTypes array
    return [{
      _id: 'default',
      name: 'General Admission',
      price: event.ticketPrice || 0,
      quantity: event.totalTickets || 0,
      sold: event.ticketsSold || 0
    }];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#605B51]">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#2d2a28] mb-2">Event Not Found</h2>
          <p className="text-[#605B51] mb-6">
            {error || 'The event you are looking for does not exist or has been removed.'}
          </p>
          <Link href="/events">
            <Button variant="purple">Browse All Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate available tickets
  const availableTickets = event.totalTickets - event.ticketsSold;
  const ticketsSoldPercentage = (event.ticketsSold / event.totalTickets) * 100;

  const relatedEvents = [
    // You can fetch related events from API later
  ];

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setTicketQuantity(1);
  };

  const totalPrice = selectedTicket ? selectedTicket.price * ticketQuantity : 0;

  // Handle review submission
  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setReviewSubmitError('You must be logged in to submit a review');
      return;
    }
    
    if (reviewRating === 0) {
      setReviewSubmitError('Please select a rating');
      return;
    }
    
    if (!reviewComment.trim()) {
      setReviewSubmitError('Please enter a comment');
      return;
    }
    
    try {
      setSubmittingReview(true);
      setReviewSubmitError(null);
      
      const token = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${resolvedParams.id}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: reviewRating,
            comment: reviewComment.trim(),
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }
      
      // Add new review to the list
      setReviews([data.data, ...reviews]);
      setReviewStats(data.stats);
      
      // Reset form
      setReviewRating(0);
      setReviewComment('');
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewSubmitError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Handle purchase with Paystack
  const handlePurchase = async (e) => {
    e.preventDefault();
    
    if (!selectedTicket) {
      setPurchaseError('Please select a ticket type');
      return;
    }
    
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      setPurchaseError('Please fill in all fields');
      return;
    }
    
    // Validate email
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(buyerEmail)) {
      setPurchaseError('Please enter a valid email address');
      return;
    }
    
    try {
      setPurchasing(true);
      setPurchaseError(null);
      
      // Initialize payment with backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/initialize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: resolvedParams.id,
            buyerName: buyerName.trim(),
            buyerEmail: buyerEmail.trim(),
            buyerPhone: buyerPhone.trim(),
            userId: user?.uid || null,
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.errors && data.errors.length > 0 
          ? data.errors.join(', ')
          : (data.message || 'Failed to initialize payment');
        throw new Error(errorMessage);
      }
      
      // Load Paystack inline script
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        // Initialize Paystack payment
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: buyerEmail.trim(),
          amount: selectedTicket.price * 100, // Amount in kobo
          ref: data.data.reference,
          callback: async (response) => {
            // Payment successful - verify and create ticket
            try {
              const verifyResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    reference: response.reference,
                  }),
                }
              );
              
              const verifyData = await verifyResponse.json();
              
              if (!verifyResponse.ok) {
                throw new Error(verifyData.message || 'Payment verification failed');
              }
              
              // Success!
              setPurchasedTicket(verifyData.data);
              setPurchaseSuccess(true);
              
              // Reset form
              setBuyerName('');
              setBuyerEmail('');
              setBuyerPhone('');
              setSelectedTicket(null);
              setTicketQuantity(1);
              
              // Refresh event data
              const eventResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${resolvedParams.id}`);
              if (eventResponse.ok) {
                const eventData = await eventResponse.json();
                if (eventData.success) {
                  setEvent(eventData.data);
                }
              }
            } catch (err) {
              console.error('Error verifying payment:', err);
              setPurchaseError(err.message);
            } finally {
              setPurchasing(false);
            }
          },
          onClose: () => {
            setPurchasing(false);
            setPurchaseError('Payment was cancelled');
          },
        });
        
        handler.openIframe();
      };
      
      script.onerror = () => {
        setPurchasing(false);
        setPurchaseError('Failed to load payment gateway');
      };
      
    } catch (err) {
      console.error('Error initializing payment:', err);
      setPurchaseError(err.message);
      setPurchasing(false);
    }
  };

  // Open checkout modal
  const openCheckout = async () => {
    if (!selectedTicket) {
      alert('Please select a ticket type first');
      return;
    }
    
    // Pre-fill user data if logged in
    if (user) {
      // Force refresh user profile to get latest displayName
      await user.reload();
      const displayName = user.displayName || user.email?.split('@')[0] || '';
      setBuyerEmail(user.email || '');
      setBuyerName(displayName);
    }
    
    setShowCheckoutModal(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);
  };

  // Close modal and reset
  const closeCheckout = () => {
    setShowCheckoutModal(false);
    setPurchaseError(null);
    if (purchaseSuccess) {
      setPurchaseSuccess(false);
      setPurchasedTicket(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-125 bg-linear-to-br from-[#D8D365] via-[#a855f7] to-[#9333ea] overflow-hidden">
        <div className="absolute inset-0 bg-[#2d2a28] opacity-40" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-end pb-12">
          <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-[#E6F082] text-[#2d2a28] border-none capitalize">
                {event.category || 'Event'}
              </Badge>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {event.ticketsSold} Tickets Sold
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
                <span className="font-medium">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{formatTime(event.date)}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{event.venue}</span>
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
                        {event.totalTickets}
                      </div>
                      <div className="text-sm text-[#605B51]">Total Tickets</div>
                    </Card>
                    <Card className="text-center p-6">
                      <div className="text-3xl font-bold text-[#a855f7] mb-1">
                        {event.ticketsSold}
                      </div>
                      <div className="text-sm text-[#605B51]">Sold</div>
                    </Card>
                    <Card className="text-center p-6">
                      <div className="text-3xl font-bold text-[#a855f7] mb-1">
                        {availableTickets}
                      </div>
                      <div className="text-sm text-[#605B51]">Available</div>
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
                          {event.organizerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-roboto font-semibold text-[#2d2a28]">
                              {event.organizerName}
                            </h4>
                            <svg className="w-5 h-5 text-[#a855f7]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          {event.organizerContact && (
                            <p className="mt-1 text-sm text-[#605B51]">
                              {event.organizerContact}
                            </p>
                          )}
                        </div>
                      </div>
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
                        {event.venue}
                      </h3>
                      <p className="text-[#605B51]">Event venue location</p>
                    </div>
                    {/* Google Maps Embed */}
                    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${encodeURIComponent(event.venue)}`}
                      ></iframe>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.venue)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" fullWidth>
                          Get Directions
                        </Button>
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" fullWidth>
                          View in Maps
                        </Button>
                      </a>
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
                          <svg 
                            key={i} 
                            className={`w-5 h-5 ${
                              i < Math.round(reviewStats.averageRating)
                                ? 'text-[#E6F082]'
                                : 'text-gray-300'
                            }`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="font-semibold text-[#2d2a28]">
                        {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Review Submission Form - Only for logged in users */}
                  {user && (
                    <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-yellow-50">
                      {!showReviewForm ? (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="w-full py-3 px-6 bg-gradient-to-r from-[#D8D365] to-[#a855f7] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                        >
                          Write a Review
                        </button>
                      ) : (
                        <form onSubmit={submitReview} className="space-y-4">
                          <h3 className="font-roboto text-lg font-semibold text-[#2d2a28]">
                            Share Your Experience
                          </h3>
                          
                          {/* Rating Selection */}
                          <div>
                            <label className="block text-sm font-medium text-[#605B51] mb-2">
                              Rating *
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <svg
                                    className={`w-8 h-8 ${
                                      star <= reviewRating
                                        ? 'text-[#E6F082]'
                                        : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Comment */}
                          <div>
                            <label className="block text-sm font-medium text-[#605B51] mb-2">
                              Your Review *
                            </label>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Tell us about your experience..."
                              rows={4}
                              maxLength={500}
                              className="w-full px-4 py-3 text-[#2d2a28] bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all placeholder:text-gray-400"
                            />
                            <p className="text-xs text-[#605B51] mt-1">
                              {reviewComment.length}/500 characters
                            </p>
                          </div>

                          {reviewSubmitError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-600">{reviewSubmitError}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              type="submit"
                              disabled={submittingReview}
                              className="flex-1 py-3 px-6 bg-gradient-to-r from-[#D8D365] to-[#a855f7] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowReviewForm(false);
                                setReviewRating(0);
                                setReviewComment('');
                                setReviewSubmitError(null);
                              }}
                              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-[#605B51] hover:border-[#a855f7] hover:text-[#a855f7] transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </Card>
                  )}

                  {/* Login prompt for non-logged in users */}
                  {!user && (
                    <Card className="p-6 mb-6 bg-gray-50 text-center">
                      <p className="text-[#605B51] mb-3">
                        Please log in to write a review
                      </p>
                      <Link href="/login">
                        <Button variant="purple">Log In</Button>
                      </Link>
                    </Card>
                  )}

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-[#605B51]">Loading reviews...</p>
                    </div>
                  ) : reviewError ? (
                    <div className="text-center py-12">
                      <p className="text-red-600">Failed to load reviews</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <div className="text-5xl mb-3">💭</div>
                      <p className="text-[#605B51] font-medium">No reviews yet</p>
                      <p className="text-sm text-[#605B51] mt-2">
                        Be the first to review this event!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review._id} className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#D8D365] to-[#a855f7] rounded-full flex items-center justify-center text-white font-bold">
                                {review.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-roboto font-semibold text-[#2d2a28]">
                                  {review.userName}
                                </h4>
                                <p className="text-xs text-[#605B51]">
                                  {formatTimeAgo(review.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-[#E6F082]' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="font-nunito text-[#605B51]">
                            {review.comment}
                          </p>
                        </Card>
                      ))}
                    </div>
                  )}
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

                  {availableTickets > 0 ? (
                    <>
                      <div className="space-y-4 mb-6">
                        {getTicketTypes().map((ticketType) => {
                          const ticketAvailable = (ticketType.quantity || 0) - (ticketType.sold || 0);
                          const isSelected = selectedTicket?.id === ticketType._id;
                          
                          if (ticketAvailable <= 0) return null;
                          
                          return (
                            <div
                              key={ticketType._id}
                              onClick={() => setSelectedTicket({ 
                                id: ticketType._id, 
                                type: ticketType.name, 
                                price: ticketType.price,
                                available: ticketAvailable
                              })}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[#a855f7] bg-[#a855f7]/5'
                                  : 'border-gray-200 hover:border-[#a855f7]/50'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-roboto font-semibold text-[#2d2a28]">
                                    {ticketType.name}
                                  </h4>
                                  <p className="text-2xl font-bold text-[#a855f7] mt-1">
                                    {ticketType.price === 0 ? 'Free' : `₦${ticketType.price.toLocaleString()}`}
                                  </p>
                                </div>
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  onChange={() => setSelectedTicket({ 
                                    id: ticketType._id, 
                                    type: ticketType.name, 
                                    price: ticketType.price,
                                    available: ticketAvailable
                                  })}
                                  className="w-5 h-5 text-[#a855f7] border-gray-300 focus:ring-[#a855f7] cursor-pointer"
                                />
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center text-xs text-[#605B51] mb-2">
                                  <svg className="w-4 h-4 mr-2 text-[#a855f7] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Access to event
                                </div>
                                <div className="flex items-center text-xs text-[#605B51]">
                                  <svg className="w-4 h-4 mr-2 text-[#a855f7] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                  </svg>
                                  {ticketAvailable} tickets available
                                </div>
                                {ticketType.sold > 0 && (
                                  <div className="flex items-center text-xs text-green-600 mt-1">
                                    <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {ticketType.sold} already sold
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
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
                                onChange={(e) => setTicketQuantity(Math.max(1, Math.min(selectedTicket.available || availableTickets, parseInt(e.target.value) || 1)))}
                                max={selectedTicket.available || availableTickets}
                                className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent text-[#2d2a28] font-semibold"
                              />
                              <button
                                onClick={() => setTicketQuantity(Math.min(selectedTicket.available || availableTickets, ticketQuantity + 1))}
                                disabled={ticketQuantity >= (selectedTicket.available || availableTickets)}
                                className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-[#a855f7] text-[#2d2a28] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                {totalPrice === 0 ? 'Free' : `₦${totalPrice.toLocaleString()}`}
                              </span>
                            </div>
                            <button
                              onClick={openCheckout}
                              className="w-full py-4 px-6 bg-gradient-to-r from-[#D8D365] to-[#a855f7] text-white font-bold text-lg rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              Get Tickets
                            </button>
                          </div>
                        </div>
                      )}

                  {!selectedTicket && (
                    <p className="text-center text-sm text-[#605B51] py-4">
                      Select a ticket type to continue
                    </p>
                  )}
                </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">🎟️</div>
                      <h4 className="font-roboto font-semibold text-[#2d2a28] mb-2">
                        Sold Out
                      </h4>
                      <p className="text-[#605B51] text-sm">
                        All tickets for this event have been sold.
                      </p>
                    </div>
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

      {/* Checkout Modal */}
      {showCheckoutModal && !purchaseSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
              {/* Close Button */}
              <button
                onClick={closeCheckout}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Header */}
              <h3 className="font-roboto text-2xl font-bold text-[#2d2a28] mb-2">
                Complete Your Purchase
              </h3>
              <p className="text-[#605B51] text-sm mb-6">
                {selectedTicket && `${selectedTicket.type} - ₦${(selectedTicket.price * ticketQuantity).toLocaleString()}`}
              </p>

              {/* Purchase Form */}
              <form onSubmit={handlePurchase} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-[#2d2a28] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a855f7] focus:border-transparent bg-white text-[#2d2a28] placeholder:text-gray-400"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-[#2d2a28] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a855f7] focus:border-transparent bg-white text-[#2d2a28] placeholder:text-gray-400"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-[#2d2a28] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a855f7] focus:border-transparent bg-white text-[#2d2a28] placeholder:text-gray-400"
                    placeholder="+234..."
                    required
                  />
                </div>

                {/* Error Display */}
                {purchaseError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{purchaseError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={purchasing}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#D8D365] to-[#a855f7] text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {purchasing ? 'Processing...' : `Pay ₦${selectedTicket ? (selectedTicket.price * ticketQuantity).toLocaleString() : '0'}`}
                </button>
              </form>
            </div>
          </div>
        )}

      {/* Success Modal */}
      {purchaseSuccess && purchasedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
              {/* Success Icon */}
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Success Message */}
              <h3 className="font-roboto text-2xl font-bold text-[#2d2a28] mb-2">
                Purchase Successful!
              </h3>
              <p className="text-[#605B51] mb-6">
                Your ticket has been purchased successfully. Check your email for the QR code.
              </p>

              {/* Ticket Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#605B51]">Event</span>
                    <span className="text-sm font-semibold text-[#2d2a28]">{event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#605B51]">Ticket Type</span>
                    <span className="text-sm font-semibold text-[#2d2a28]">{purchasedTicket.ticketType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#605B51]">Confirmation</span>
                    <span className="text-sm font-mono text-[#2d2a28]">{purchasedTicket._id?.slice(-8)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    closeCheckout();
                    window.location.href = '/dashboard';
                  }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#D8D365] to-[#a855f7] text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  View My Tickets
                </button>
                <button
                  onClick={closeCheckout}
                  className="w-full py-2 px-6 text-[#605B51] hover:text-[#2d2a28] transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
