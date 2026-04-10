'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Replace with actual API call to backend
      // await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="relative bg-white pt-32 pb-16 overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-40 -right-40 w-150 h-150 bg-[#a855f7] opacity-20 blur-3xl rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-roboto text-5xl md:text-6xl font-bold text-[#2d2a28] mb-6">
              Get in Touch
            </h1>
            <p className="font-nunito text-lg text-[#605B51]">
              Have a question or need support? We're here to help! Send us a message and our team will get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Email */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#E6F082]/20 rounded-lg">
                    <svg className="w-6 h-6 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-roboto font-semibold text-[#2d2a28] mb-2">Email Us</h3>
                    <p className="text-sm text-[#605B51] mb-2">For general inquiries</p>
                    <a href="mailto:support@trybetickets.com" className="text-[#a855f7] hover:underline font-medium">
                      support@trybetickets.com
                    </a>
                  </div>
                </div>
              </Card>

              {/* Phone */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#E6F082]/20 rounded-lg">
                    <svg className="w-6 h-6 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-roboto font-semibold text-[#2d2a28] mb-2">Call Us</h3>
                    <p className="text-sm text-[#605B51] mb-2">Mon-Fri, 9am-6pm EST</p>
                    <a href="tel:+18005551234" className="text-[#a855f7] hover:underline font-medium">
                      +1 (800) 555-1234
                    </a>
                  </div>
                </div>
              </Card>

              {/* Office */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#E6F082]/20 rounded-lg">
                    <svg className="w-6 h-6 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-roboto font-semibold text-[#2d2a28] mb-2">Visit Us</h3>
                    <p className="text-sm text-[#605B51]">
                      123 Event Plaza<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                </div>
              </Card>

              {/* FAQ Link */}
              <Card className="p-6 bg-linear-to-br from-[#E6F082]/20 to-[#a855f7]/10">
                <h3 className="font-roboto font-semibold text-[#2d2a28] mb-2">
                  Looking for quick answers?
                </h3>
                <p className="text-sm text-[#605B51] mb-4">
                  Check out our FAQ section for instant help with common questions.
                </p>
                <Button variant="outline" size="sm">
                  View FAQ
                </Button>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                <h2 className="font-roboto text-2xl font-bold text-[#2d2a28] mb-6">
                  Send us a Message
                </h2>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-green-700 font-medium">
                        Message sent successfully! We'll get back to you soon.
                      </p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 font-medium">
                        Something went wrong. Please try again or email us directly.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-[#2d2a28] mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white text-[#2d2a28] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-colors placeholder:text-gray-400"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-[#2d2a28] mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white text-[#2d2a28] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-colors placeholder:text-gray-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-[#2d2a28] mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white text-[#2d2a28] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="event">Event Management</option>
                      <option value="partnership">Partnership & Business</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-[#2d2a28] mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white text-[#2d2a28] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-colors placeholder:text-gray-400"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-[#2d2a28] mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white text-[#2d2a28] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-colors placeholder:text-gray-400 resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#2d2a28] border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </Button>

                  <p className="text-xs text-center text-[#605B51] mt-4">
                    By submitting this form, you agree to our Privacy Policy and Terms of Service.
                  </p>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
