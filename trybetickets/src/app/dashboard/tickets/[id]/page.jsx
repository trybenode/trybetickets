'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (!currentUser) {
            router.push('/login');
            return;
          }

          try {
            const idToken = await currentUser.getIdToken();
            
            // Fetch ticket details
            const response = await fetch(`${API_URL}/api/tickets/${params.id}`, {
              headers: {
                'Authorization': `Bearer ${idToken}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch ticket');
            }

            const data = await response.json();
            setTicket(data.data);

            // Fetch QR code if ticket is valid
            if (data.data.status === 'valid') {
              const qrResponse = await fetch(`${API_URL}/api/tickets/${params.id}/qr`, {
                headers: {
                  'Authorization': `Bearer ${idToken}`,
                },
              });
              
              if (qrResponse.ok) {
                const blob = await qrResponse.blob();
                const blobUrl = URL.createObjectURL(blob);
                setQrCodeUrl(blobUrl);
              }
            }
            
            setLoading(false);
          } catch (err) {
            console.error('Error fetching ticket:', err);
            setError(err.message);
            setLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Firebase setup error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTicket();
    }

    // Cleanup blob URL on unmount
    return () => {
      if (qrCodeUrl && qrCodeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [params.id, router, qrCodeUrl]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'used':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const downloadQRCode = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      const idToken = await auth.currentUser?.getIdToken();
      
      const response = await fetch(`${API_URL}/api/tickets/${params.id}/qr`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to download QR code');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticket.qrToken}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading QR code:', err);
      alert('Failed to download QR code. Please try again.');
    }
  };

  const printTicket = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFBF7] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#FEFBF7] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="font-roboto font-semibold text-xl text-[#2d2a28] mb-2">
              Ticket Not Found
            </h3>
            <p className="text-[#605B51] mb-6">
              {error || 'The ticket you are looking for does not exist.'}
            </p>
            <Link href="/dashboard">
              <Button variant="primary">Back to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFBF7] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Ticket Card */}
        <Card className="overflow-hidden print:shadow-none">
          {/* Status Banner */}
          {ticket.status === 'used' && (
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 print:hidden">
              <div className="flex items-center text-blue-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  This ticket was checked in on {formatDate(ticket.checkedInAt)} at {formatTime(ticket.checkedInAt)}
                </span>
              </div>
            </div>
          )}

          {ticket.status === 'cancelled' && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-3 print:hidden">
              <div className="flex items-center text-red-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">This ticket has been cancelled</span>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Event Info */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="capitalize">{ticket.eventId?.category || 'Event'}</Badge>
                <span className={`text-sm px-3 py-1 rounded-full border capitalize font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              
              <Link href={`/events/${ticket.eventId?._id}`}>
                <h1 className="font-roboto text-3xl font-bold text-[#2d2a28] hover:text-[#a855f7] transition-colors mb-4">
                  {ticket.eventId?.title || 'Unknown Event'}
                </h1>
              </Link>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-[#a855f7] mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-[#605B51]">Date & Time</p>
                    <p className="font-semibold text-[#2d2a28]">
                      {ticket.eventId?.date ? `${formatDate(ticket.eventId.date)} at ${formatTime(ticket.eventId.date)}` : 'Date TBD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-[#a855f7] mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-[#605B51]">Venue</p>
                    <p className="font-semibold text-[#2d2a28]">{ticket.eventId?.venue || 'Venue TBD'}</p>
                  </div>
                </div>
              </div>

              {ticket.eventId?.description && (
                <p className="text-[#605B51] leading-relaxed mb-6">{ticket.eventId.description}</p>
              )}
            </div>

            {/* QR Code Section */}
            <div className="border-t-2 border-dashed border-gray-300 pt-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <h3 className="font-roboto font-semibold text-lg text-[#2d2a28] mb-4">
                    Your QR Code
                  </h3>
                  
                  {qrCodeUrl && ticket.status === 'valid' ? (
                    <div className="bg-white border-4 border-[#a855f7] rounded-lg p-4 mb-4">
                      <img
                        src={qrCodeUrl}
                        alt="Ticket QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                  ) : ticket.status === 'used' ? (
                    <div className="bg-gray-100 border-4 border-gray-300 rounded-lg p-4 mb-4 w-56 h-56 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm text-gray-500 font-medium">Checked In</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 border-4 border-gray-300 rounded-lg p-4 mb-4 w-56 h-56 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm text-gray-500 font-medium">Ticket Cancelled</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-[#605B51] text-center mb-4">
                    Show this QR code at the event entrance
                  </p>

                  {ticket.status === 'valid' && (
                    <Button variant="primary" onClick={downloadQRCode} className="w-full">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download QR Code
                    </Button>
                  )}
                </div>

                {/* Ticket Details */}
                <div>
                  <h3 className="font-roboto font-semibold text-lg text-[#2d2a28] mb-4">
                    Ticket Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm text-[#605B51]">Ticket ID</span>
                      <span className="font-mono text-sm font-semibold text-[#2d2a28]">
                        {ticket.qrToken?.substring(0, 16)}...
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm text-[#605B51]">Buyer Name</span>
                      <span className="font-semibold text-[#2d2a28]">{ticket.buyerName}</span>
                    </div>

                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm text-[#605B51]">Email</span>
                      <span className="font-semibold text-[#2d2a28] text-right break-all">{ticket.buyerEmail}</span>
                    </div>

                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm text-[#605B51]">Phone</span>
                      <span className="font-semibold text-[#2d2a28]">{ticket.buyerPhone}</span>
                    </div>

                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm text-[#605B51]">Purchase Date</span>
                      <span className="font-semibold text-[#2d2a28]">
                        {formatDate(ticket.purchaseDate)}
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm text-[#605B51]">Amount Paid</span>
                      <span className="font-bold text-2xl text-[#a855f7]">
                        ₦{(ticket.amountPaid || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 print:hidden">
              <Button variant="outline" onClick={printTicket} className="flex-1">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Ticket
              </Button>
              
              <Link href={`/events/${ticket.eventId?._id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Event Details
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <Card className="mt-6 print:hidden">
          <div className="p-6">
            <h3 className="font-roboto font-semibold text-lg text-[#2d2a28] mb-4">
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-[#605B51]">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-[#a855f7] mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Please arrive at the venue at least 30 minutes before the event starts.
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-[#a855f7] mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Have your QR code ready (digital or printed) for quick check-in.
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-[#a855f7] mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Each QR code can only be used once. Do not share your ticket.
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-[#a855f7] mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Contact the event organizer for any questions or concerns.
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
