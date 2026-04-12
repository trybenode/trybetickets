'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function OrganizerProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    website: '',
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'organizer') {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch profile
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const { auth } = await import('@/lib/firebase');
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          throw new Error('No authenticated user found');
        }
        
        const idToken = await currentUser.getIdToken();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch profile');
        }

        if (result.success) {
          setProfile(result.data);
          setFormData({
            companyName: result.data.organizerProfile?.companyName || '',
            description: result.data.organizerProfile?.description || '',
            website: result.data.organizerProfile?.website || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading, isAuthenticated]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      if (result.success) {
        setProfile(result.data);
        setEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#605B51]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#2d2a28] mb-2">Failed to Load Profile</h2>
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-roboto text-3xl font-bold text-[#2d2a28] mb-2">
                Organizer Profile
              </h1>
              <p className="font-nunito text-[#605B51]">
                Manage your organizer information and settings
              </p>
            </div>
            <Link href="/dashboard/organizer">
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Account Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-roboto text-xl font-semibold text-[#2d2a28] mb-2">
                Account Status
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${
                  profile?.organizerProfile?.status === 'approved'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : profile?.organizerProfile?.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                } capitalize`}>
                  {profile?.organizerProfile?.status || 'Pending'}
                </Badge>
                {profile?.organizerProfile?.status === 'approved' && (
                  <span className="text-sm text-[#605B51]">
                    Approved on {formatDate(profile?.organizerProfile?.approvedAt)}
                  </span>
                )}
              </div>
              {profile?.organizerProfile?.status === 'pending' && (
                <p className="text-sm text-[#605B51]">
                  Your organizer application is under review. You'll be notified once approved.
                </p>
              )}
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-[#D8D365] to-[#a855f7] rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-roboto text-xl font-semibold text-[#2d2a28]">
              Basic Information
            </h2>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2d2a28] mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2d2a28] mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent"
                  placeholder="Tell us about your organization..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2d2a28] mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      companyName: profile?.organizerProfile?.companyName || '',
                      description: profile?.organizerProfile?.description || '',
                      website: profile?.organizerProfile?.website || '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#605B51] mb-1">
                  Company Name
                </label>
                <p className="text-[#2d2a28]">
                  {profile?.organizerProfile?.companyName || 'Not set'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#605B51] mb-1">
                  Description
                </label>
                <p className="text-[#2d2a28]">
                  {profile?.organizerProfile?.description || 'No description provided'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#605B51] mb-1">
                  Website
                </label>
                {profile?.organizerProfile?.website ? (
                  <a
                    href={profile.organizerProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#a855f7] hover:underline"
                  >
                    {profile.organizerProfile.website}
                  </a>
                ) : (
                  <p className="text-[#2d2a28]">Not set</p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Account Details */}
        <Card className="p-6">
          <h2 className="font-roboto text-xl font-semibold text-[#2d2a28] mb-4">
            Account Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#605B51] mb-1">
                Email
              </label>
              <p className="text-[#2d2a28]">{profile?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#605B51] mb-1">
                Full Name
              </label>
              <p className="text-[#2d2a28]">{profile?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#605B51] mb-1">
                Phone Number
              </label>
              <p className="text-[#2d2a28]">{profile?.phone || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#605B51] mb-1">
                Member Since
              </label>
              <p className="text-[#2d2a28]">{formatDate(profile?.createdAt)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
