'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

// Event categories
const EVENT_CATEGORIES = [
  'Music & Concerts',
  'Sports & Fitness',
  'Arts & Culture',
  'Food & Drink',
  'Business & Professional',
  'Technology & Innovation',
  'Health & Wellness',
  'Education & Career',
  'Community & Social',
  'Film & Media',
  'Fashion & Beauty',
  'Travel & Outdoor',
  'Charity & Causes',
  'Family & Kids',
  'Other'
];

export default function CreateEventPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    venue: '',
    eventCapacity: '',
    organizerName: user?.name || '',
    organizerContact: user?.email || '',
  });
  
  // Ticket types state - starts with one default ticket type
  const [ticketTypes, setTicketTypes] = useState([
    { id: 1, name: 'General Admission', price: '', quantity: '' }
  ]);

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'organizer') {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Pre-fill organizer info when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        organizerName: user.name || '',
        organizerContact: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Add a new ticket type
  const addTicketType = () => {
    const newId = Math.max(...ticketTypes.map(t => t.id), 0) + 1;
    setTicketTypes([...ticketTypes, { id: newId, name: '', price: '', quantity: '' }]);
  };

  // Remove a ticket type
  const removeTicketType = (id) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter(t => t.id !== id));
      // Clear errors for this ticket type
      const newErrors = { ...errors };
      delete newErrors[`ticketType_${id}_name`];
      delete newErrors[`ticketType_${id}_price`];
      delete newErrors[`ticketType_${id}_quantity`];
      setErrors(newErrors);
    }
  };

  // Update ticket type field
  const updateTicketType = (id, field, value) => {
    setTicketTypes(ticketTypes.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
    // Clear error for this field
    const errorKey = `ticketType_${id}_${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  // Calculate total capacity from ticket types
  const calculateTotalCapacity = () => {
    return ticketTypes.reduce((sum, ticket) => {
      const qty = parseInt(ticket.quantity) || 0;
      return sum + qty;
    }, 0);
  };

  // Calculate potential revenue
  const calculatePotentialRevenue = () => {
    return ticketTypes.reduce((sum, ticket) => {
      const price = parseFloat(ticket.price) || 0;
      const qty = parseInt(ticket.quantity) || 0;
      return sum + (price * qty);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const eventDate = new Date(formData.date);
      const now = new Date();
      if (eventDate <= now) {
        newErrors.date = 'Event date must be in the future';
      }
    }

    // Venue validation
    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    // Event capacity validation
    if (!formData.eventCapacity) {
      newErrors.eventCapacity = 'Event capacity is required';
    } else {
      const capacity = parseInt(formData.eventCapacity);
      if (isNaN(capacity) || capacity < 1) {
        newErrors.eventCapacity = 'Event capacity must be at least 1';
      } else {
        // Check if total tickets exceed capacity
        const totalTickets = calculateTotalCapacity();
        if (totalTickets > capacity) {
          newErrors.eventCapacity = `Total tickets (${totalTickets}) cannot exceed event capacity`;
        }
      }
    }

    // Ticket types validation
    if (ticketTypes.length === 0) {
      newErrors.ticketTypes = 'At least one ticket type is required';
    } else {
      ticketTypes.forEach((ticket) => {
        if (!ticket.name.trim()) {
          newErrors[`ticketType_${ticket.id}_name`] = 'Ticket name is required';
        }
        if (!ticket.price) {
          newErrors[`ticketType_${ticket.id}_price`] = 'Price is required';
        } else {
          const price = parseFloat(ticket.price);
          if (isNaN(price) || price < 0) {
            newErrors[`ticketType_${ticket.id}_price`] = 'Price must be positive';
          }
        }
        if (!ticket.quantity) {
          newErrors[`ticketType_${ticket.id}_quantity`] = 'Quantity is required';
        } else {
          const qty = parseInt(ticket.quantity);
          if (isNaN(qty) || qty < 1) {
            newErrors[`ticketType_${ticket.id}_quantity`] = 'Quantity must be at least 1';
          }
        }
      });
    }

    // Organizer name validation
    if (!formData.organizerName.trim()) {
      newErrors.organizerName = 'Organizer name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setCreating(true);

    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const idToken = await currentUser.getIdToken();

      // For now, use first ticket type for backward compatibility
      // TODO: Update backend to accept multiple ticket types
      const firstTicket = ticketTypes[0];
      const totalTickets = calculateTotalCapacity();

      // Prepare data with proper types
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        venue: formData.venue.trim(),
        eventCapacity: parseInt(formData.eventCapacity),
        ticketPrice: parseFloat(firstTicket.price),
        totalTickets: totalTickets,
        organizerName: formData.organizerName.trim(),
        organizerContact: formData.organizerContact?.trim() || '',
        // Store ticket types info (for future use)
        ticketTypesData: ticketTypes.map(t => ({
          name: t.name.trim(),
          price: parseFloat(t.price),
          quantity: parseInt(t.quantity)
        }))
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (result.errors && Array.isArray(result.errors)) {
          const backendErrors = {};
          result.errors.forEach(err => {
            backendErrors[err.field] = err.message;
          });
          setErrors(backendErrors);
          throw new Error(result.message || 'Failed to create event');
        }
        throw new Error(result.message || 'Failed to create event');
      }

      if (result.success && result.data) {
        // Redirect to events list with success message
        router.push(`/dashboard/organizer/events`);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#605B51]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-roboto text-3xl font-bold text-[#2d2a28] mb-1">
                Create New Event
              </h1>
              <p className="font-nunito text-[#605B51]">
                Fill in the details below to create your event
              </p>
            </div>
            <Link href="/dashboard/organizer/events">
              <Button variant="outline" size="md">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Details */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D8D365] to-[#a855f7] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="font-roboto text-2xl font-semibold text-[#2d2a28]">
                Event Details
              </h2>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-[#2d2a28] mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full px-4 py-3 text-[#2d2a28] bg-white border ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all`}
                  placeholder="e.g., Summer Music Festival 2024"
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.title && (
                    <p className="text-sm text-red-500 font-medium">{errors.title}</p>
                  )}
                  <p className="text-sm text-[#605B51] ml-auto">
                    {formData.title.length}/100
                  </p>
                </div>
              </div>

              {/* Category & Event Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-bold text-[#2d2a28] mb-2">
                    Event Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 text-[#2d2a28] bg-white border ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent appearance-none transition-all`}
                    >
                      <option value="" className="text-gray-400">Select a category</option>
                      {EVENT_CATEGORIES.map((category) => (
                        <option key={category} value={category} className="text-[#2d2a28]">
                          {category}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#605B51] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {errors.category && (
                    <p className="text-sm text-red-500 font-medium mt-2">{errors.category}</p>
                  )}
                </div>

                {/* Event Capacity */}
                <div>
                  <label htmlFor="eventCapacity" className="block text-sm font-bold text-[#2d2a28] mb-2">
                    Event Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="eventCapacity"
                    type="number"
                    name="eventCapacity"
                    value={formData.eventCapacity}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    className={`w-full px-4 py-3 text-[#2d2a28] bg-white border ${
                      errors.eventCapacity ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all`}
                    placeholder="e.g., 500"
                  />
                  {errors.eventCapacity && (
                    <p className="text-sm text-red-500 font-medium mt-2">{errors.eventCapacity}</p>
                  )}
                  <p className="text-xs text-[#605B51] mt-1">Maximum number of attendees for this event</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-[#2d2a28] mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  maxLength={1000}
                  className={`w-full px-4 py-3 text-[#2d2a28] bg-white border ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all resize-none`}
                  placeholder="Describe your event, what attendees can expect, special guests, etc."
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.description && (
                    <p className="text-sm text-red-500 font-medium">{errors.description}</p>
                  )}
                  <p className="text-sm text-[#605B51] ml-auto">
                    {formData.description.length}/1000
                  </p>
                </div>
              </div>

              {/* Date and Venue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date and Time */}
                <div>
                  <label htmlFor="date" className="block text-sm font-bold text-[#2d2a28] mb-2">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="date"
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-[#2d2a28] bg-white border ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all`}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500 font-medium mt-2">{errors.date}</p>
                  )}
                </div>

                {/* Venue */}
                <div>
                  <label htmlFor="venue" className="block text-sm font-bold text-[#2d2a28] mb-2">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="venue"
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-[#2d2a28] bg-white border ${
                      errors.venue ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all`}
                    placeholder="e.g., National Stadium, Lagos"
                  />
                  {errors.venue && (
                    <p className="text-sm text-red-500 font-medium mt-2">{errors.venue}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Ticket Types */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D8D365] to-[#a855f7] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-roboto text-2xl font-semibold text-[#2d2a28]">
                    Ticket Types
                  </h2>
                  <p className="text-sm text-[#605B51]">Define your ticket categories and pricing</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTicketType}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Ticket Type
              </Button>
            </div>

            {errors.ticketTypes && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{errors.ticketTypes}</p>
              </div>
            )}

            <div className="space-y-4">
              {ticketTypes.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-[#a855f7] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-[#605B51]">Ticket Type {index + 1}</span>
                    </div>
                    {ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(ticket.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Remove ticket type"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Ticket Name */}
                    <div>
                      <label className="block text-sm font-bold text-[#2d2a28] mb-2">
                        Ticket Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                        className={`w-full px-4 py-2.5 text-[#2d2a28] bg-white border ${
                          errors[`ticketType_${ticket.id}_name`] ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all`}
                        placeholder="e.g., VIP, General"
                      />
                      {errors[`ticketType_${ticket.id}_name`] && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          {errors[`ticketType_${ticket.id}_name`]}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-bold text-[#2d2a28] mb-2">
                        Price (₦) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#605B51] font-medium">
                          ₦
                        </span>
                        <input
                          type="number"
                          value={ticket.price}
                          onChange={(e) => updateTicketType(ticket.id, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                          className={`w-full pl-8 pr-4 py-2.5 text-[#2d2a28] bg-white border ${
                            errors[`ticketType_${ticket.id}_price`] ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all`}
                          placeholder="5000"
                        />
                      </div>
                      {errors[`ticketType_${ticket.id}_price`] && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          {errors[`ticketType_${ticket.id}_price`]}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-bold text-[#2d2a28] mb-2">
                        Available <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => updateTicketType(ticket.id, 'quantity', e.target.value)}
                        min="1"
                        step="1"
                        className={`w-full px-4 py-2.5 text-[#2d2a28] bg-white border ${
                          errors[`ticketType_${ticket.id}_quantity`] ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all`}
                        placeholder="100"
                      />
                      {errors[`ticketType_${ticket.id}_quantity`] && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          {errors[`ticketType_${ticket.id}_quantity`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {calculateTotalCapacity() > 0 && (
              <div className="mt-6 p-5 bg-gradient-to-r from-[#D8D365]/10 via-[#a855f7]/10 to-[#D8D365]/10 rounded-xl border border-[#a855f7]/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#605B51] font-medium mb-1">Total Tickets</p>
                    <p className="text-3xl font-bold text-[#2d2a28]">
                      {calculateTotalCapacity().toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#605B51] font-medium mb-1">Potential Revenue</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#D8D365] to-[#a855f7] bg-clip-text text-transparent">
                      ₦{calculatePotentialRevenue().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Organizer Information */}
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

            <div className="space-y-6">
              {/* Organizer Name */}
              <div>
                <label htmlFor="organizerName" className="block text-sm font-bold text-[#2d2a28] mb-2">
                  Organizer Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="organizerName"
                  type="text"
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-[#2d2a28] bg-white border ${
                    errors.organizerName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all`}
                  placeholder="Your name or company name"
                />
                {errors.organizerName && (
                  <p className="text-sm text-red-500 font-medium mt-2">{errors.organizerName}</p>
                )}
              </div>

              {/* Organizer Contact */}
              <div>
                <label htmlFor="organizerContact" className="block text-sm font-bold text-[#2d2a28] mb-2">
                  Contact Email
                </label>
                <input
                  id="organizerContact"
                  type="email"
                  name="organizerContact"
                  value={formData.organizerContact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-[#2d2a28] bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all"
                  placeholder="contact@example.com"
                />
                <p className="text-sm text-[#605B51] mt-2">
                  This will be visible to attendees for event-related inquiries
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={creating}
              className="flex-1 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {creating ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Creating Event...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </div>
              )}
            </Button>
            <Link href="/dashboard/organizer/events" className="flex-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={creating}
                className="w-full h-14 text-base font-semibold"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
