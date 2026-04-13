'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function EventTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [event, setEvent] = useState(null);
  const [qrCodeUrls, setQrCodeUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const fetchEventTickets = async () => {
      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');

        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (!currentUser) {
            router.push('/login');
            return;
          }

          try {
            setLoading(true);
            setError(null);

            const idToken = await currentUser.getIdToken();
            const ticketsResponse = await fetch(`${API_URL}/api/users/tickets`, {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            });

            if (!ticketsResponse.ok) {
              throw new Error('Failed to fetch tickets');
            }

            const ticketsData = await ticketsResponse.json();
            const allTickets = ticketsData?.data?.all || [];
            const eventTickets = allTickets
              .filter((ticket) => ticket?.eventId?._id === params.id)
              .sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt));

            if (!eventTickets.length) {
              throw new Error('No tickets found for this event');
            }

            setTickets(eventTickets);
            setEvent(eventTickets[0].eventId || null);

            const qrEntries = await Promise.all(
              eventTickets.map(async (ticket) => {
                if (ticket.status !== 'valid') {
                  return [ticket._id, null];
                }

                try {
                  const qrResponse = await fetch(`${API_URL}/api/tickets/${ticket._id}/qr`, {
                    headers: {
                      Authorization: `Bearer ${idToken}`,
                    },
                  });

                  if (!qrResponse.ok) {
                    return [ticket._id, null];
                  }

                  const blob = await qrResponse.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  return [ticket._id, blobUrl];
                } catch {
                  return [ticket._id, null];
                }
              })
            );

            setQrCodeUrls(Object.fromEntries(qrEntries));
          } catch (fetchError) {
            console.error('Error fetching event tickets:', fetchError);
            setError(fetchError.message);
          } finally {
            setLoading(false);
          }
        });
      } catch (setupError) {
        console.error('Firebase setup error:', setupError);
        setError(setupError.message);
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEventTickets();
    }

    return () => {
      if (unsubscribe) unsubscribe();
      Object.values(qrCodeUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [params.id, router]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-NG', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-NG', {
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

  const getTicketTypeName = (ticket) => {
    if (ticket?.ticketType) {
      return ticket.ticketType;
    }

    const ticketTypes = event?.ticketTypes || [];
    const matchByPrice = ticketTypes.find(
      (type) => Number(type?.price || 0) === Number(ticket?.amountPaid || 0)
    );
    return matchByPrice?.name || 'General Admission';
  };

  const totals = useMemo(() => {
    const totalSpent = tickets.reduce((sum, ticket) => sum + (ticket.amountPaid || 0), 0);
    const validCount = tickets.filter((ticket) => ticket.status === 'valid').length;
    return { totalSpent, validCount };
  }, [tickets]);

  const downloadQRCode = async (ticket) => {
    try {
      const { auth } = await import('@/lib/firebase');
      const idToken = await auth.currentUser?.getIdToken();

      const response = await fetch(`${API_URL}/api/tickets/${ticket._id}/qr`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
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
    } catch (downloadError) {
      console.error('Error downloading QR code:', downloadError);
      alert('Failed to download QR code. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFBF7] py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#605B51]">Loading event tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#FEFBF7] py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Card className="text-center py-12">
            <h3 className="font-roboto font-semibold text-xl text-[#2d2a28] mb-2">Tickets Not Found</h3>
            <p className="text-[#605B51] mb-6">{error || 'No tickets were found for this event.'}</p>
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-[#605B51] hover:text-[#a855f7] transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Badge className="capitalize mb-2">{event.category || 'Event'}</Badge>
              <h1 className="font-roboto text-2xl sm:text-3xl font-bold text-[#2d2a28] mb-2 break-words">{event.title}</h1>
              <p className="text-[#605B51] text-sm sm:text-base">
                {event.date ? `${formatDate(event.date)} at ${formatTime(event.date)}` : 'Date TBD'} • {event.venue || 'Venue TBD'}
              </p>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-0 mt-4 sm:mt-0">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-[#605B51]">Tickets</p>
                <p className="text-xl sm:text-2xl font-bold text-[#2d2a28]">{tickets.length}</p>
                <p className="text-xs sm:text-sm text-[#605B51] mt-1">Valid: {totals.validCount}</p>
                <p className="text-base sm:text-lg font-bold text-[#a855f7] mt-2">₦{totals.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {tickets.map((ticket, index) => (
            <Card key={ticket._id} className="p-6">
              <div className="grid md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm px-3 py-1 rounded-full border bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20">
                      Ticket #{index + 1}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full border capitalize font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-[#605B51]">
                    <p>
                      Ticket Type: <span className="font-semibold text-[#2d2a28]">{getTicketTypeName(ticket)}</span>
                    </p>
                    <p>
                      Buyer: <span className="font-semibold text-[#2d2a28]">{ticket.buyerName}</span>
                    </p>
                    <p>
                      Amount: <span className="font-semibold text-[#2d2a28]">₦{(ticket.amountPaid || 0).toLocaleString()}</span>
                    </p>
                    <p>
                      Purchased: <span className="font-semibold text-[#2d2a28]">{formatDate(ticket.purchaseDate || ticket.createdAt)}</span>
                    </p>
                    <p>
                      Ref: <span className="font-mono text-[#2d2a28]">{ticket.paymentReference || ticket._id}</span>
                    </p>
                    <p>
                      QR Token: <span className="font-mono text-[#2d2a28]">{ticket.qrToken}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  {ticket.status === 'valid' && qrCodeUrls[ticket._id] ? (
                    <img
                      src={qrCodeUrls[ticket._id]}
                      alt={`QR code for ticket ${ticket._id}`}
                      className="w-40 h-40 border-2 border-[#a855f7] rounded-lg p-2 bg-white"
                    />
                  ) : (
                    <div className="w-40 h-40 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center text-xs text-gray-500 text-center px-2">
                      {ticket.status === 'valid' ? 'QR unavailable' : `Ticket ${ticket.status}`}
                    </div>
                  )}

                  {ticket.status === 'valid' && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => downloadQRCode(ticket)}>
                      Download QR
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
