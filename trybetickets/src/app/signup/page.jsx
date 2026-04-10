'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';


export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'user',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Signup attempted:', formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative Purple Shadow */}
      <div className="absolute -top-40 -right-40 w-150 h-150 bg-[#a855f7] opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E6F082] opacity-30 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2d2a28] mb-3">
            Create Account
          </h1>
          <p className="text-[#605B51] text-lg">
            Join TrybeTickets and start your journey
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-[#2d2a28] mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white text-[#2d2a28] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-colors placeholder:text-gray-400"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#2d2a28] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white text-[#2d2a28] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-colors placeholder:text-gray-400"
                placeholder="you@example.com"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-semibold text-[#2d2a28] mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`
                  flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all
                  ${formData.accountType === 'user' 
                    ? 'border-[#a855f7] bg-[#a855f7]/5' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}>
                  <input
                    type="radio"
                    name="accountType"
                    value="user"
                    checked={formData.accountType === 'user'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <svg className="w-5 h-5 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-[#2d2a28]">Attendee</span>
                </label>
                <label className={`
                  flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all
                  ${formData.accountType === 'organizer' 
                    ? 'border-[#a855f7] bg-[#a855f7]/5' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}>
                  <input
                    type="radio"
                    name="accountType"
                    value="organizer"
                    checked={formData.accountType === 'organizer'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <svg className="w-5 h-5 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-[#2d2a28]">Organizer</span>
                </label>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#2d2a28] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 bg-white text-[#2d2a28] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-colors placeholder:text-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#605B51] hover:text-[#a855f7] transition-colors"
                >
                  {showPassword ? (
                    <VisibilityOffOutlinedIcon className="w-5 h-5" />
                  ) : (
                    <VisibilityOutlinedIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#605B51] mt-1">At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#2d2a28] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 bg-white text-[#2d2a28] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-colors placeholder:text-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#605B51] hover:text-[#a855f7] transition-colors"
                >
                  {showConfirmPassword ? (
                    <VisibilityOffOutlinedIcon className="w-5 h-5" />
                  ) : (
                    <VisibilityOutlinedIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 mt-1 text-[#a855f7] border-gray-300 rounded focus:ring-[#a855f7]"
                />
                <span className="text-sm text-[#605B51]">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#a855f7] hover:text-[#9333ea] font-medium">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#a855f7] hover:text-[#9333ea] font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="purple" size="lg" fullWidth>
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#605B51]">Or sign up with</span>
            </div>
          </div>

          {/* Social Signup */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-[#2d2a28]">Google</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm font-medium text-[#2d2a28]">GitHub</span>
            </button>
          </div>
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-8 text-[#605B51]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#a855f7] hover:text-[#9333ea] font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
