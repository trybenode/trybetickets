import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-white py-24 px-6 overflow-hidden">
        {/* Decorative Purple Shadow from Top Right */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#a855f7] opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#E6F082] opacity-30 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-[#2d2a28] mb-6 leading-tight">
              Where Events Come to <span className="text-[#a855f7]">Life</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#454040] mb-10 leading-relaxed">
              Create unforgettable experiences with the most powerful multi-tenant event ticketing platform. 
              From concerts to conferences, we've got you covered.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="purple" size="lg">
                Browse Events
              </Button>
              <Button variant="dark" size="lg">
                Become an Organizer
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {[
                { number: '10K+', label: 'Events Hosted' },
                { number: '500K+', label: 'Tickets Sold' },
                { number: '50K+', label: 'Happy Users' },
                { number: '1K+', label: 'Organizers' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-3xl md:text-4xl font-bold text-[#2d2a28] mb-1">{stat.number}</div>
                  <div className="text-sm text-[#605B51]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2d2a28] mb-4">
              Why Choose TrybeTickets?
            </h2>
            <p className="text-xl text-[#605B51] max-w-2xl mx-auto">
              Everything you need to create, manage, and scale your events successfully
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎫',
                title: 'Easy Ticketing',
                description: 'Create and manage tickets with flexible pricing, early bird deals, and tier-based access control.'
              },
              {
                icon: '📊',
                title: 'Real-time Analytics',
                description: 'Track sales, attendance, and revenue with powerful dashboards and detailed reporting.'
              },
              {
                icon: '💳',
                title: 'Secure Payments',
                description: 'Accept payments globally with industry-leading security and fraud protection.'
              },
              {
                icon: '🎨',
                title: 'Custom Branding',
                description: 'Make every event page uniquely yours with customizable themes and branding options.'
              },
              {
                icon: '📱',
                title: 'Mobile-First',
                description: 'Beautiful experience on any device. Manage events and check-in attendees on the go.'
              },
              {
                icon: '🤝',
                title: 'Multi-Tenant',
                description: 'Perfect for organizations managing multiple event brands under one roof.'
              },
            ].map((feature, i) => (
              <Card key={i} hover padding="lg">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-[#2d2a28] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#605B51] leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2d2a28] mb-4">
              How It Works
            </h2>
            <p className="text-xl text-[#605B51] max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Create Your Event',
                description: 'Set up your event details, add description, upload images, and configure ticket types in minutes.'
              },
              {
                step: '02',
                title: 'Customize & Launch',
                description: 'Brand your event page, set pricing, and publish to start selling tickets immediately.'
              },
              {
                step: '03',
                title: 'Manage & Track',
                description: 'Monitor sales in real-time, check-in attendees, and analyze performance with detailed insights.'
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-[#E6F082] mb-4 opacity-50">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-[#2d2a28] mb-3">
                  {item.title}
                </h3>
                <p className="text-[#605B51] leading-relaxed">
                  {item.description}
                </p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 -right-6 w-12 h-0.5 bg-linear-to-r from-[#E6F082] to-[#a855f7]"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#2d2a28] mb-2">
                Featured Events
              </h2>
              <p className="text-xl text-[#605B51]">
                Don't miss out on these amazing experiences
              </p>
            </div>
            <Button variant="outline">
              View All Events
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Summer Music Festival 2026', 
                date: 'July 15, 2026', 
                location: 'Central Park, NY',
                price: '$49.99',
                category: 'Music',
                attending: '2.5K'
              },
              { 
                title: 'Tech Innovation Summit', 
                date: 'August 20, 2026', 
                location: 'Convention Center, SF',
                price: '$199.99',
                category: 'Conference',
                attending: '1.2K'
              },
              { 
                title: 'Contemporary Art Expo', 
                date: 'September 10, 2026', 
                location: 'Art Gallery, LA',
                price: '$29.99',
                category: 'Art',
                attending: '850'
              },
            ].map((event, i) => (
              <Card key={i} hover padding="none">
                <div className="h-48 bg-linear-to-br from-[#fbeb78] to-[#a855f7] relative">
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-[#2d2a28]">
                    {event.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#2d2a28] mb-3">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[#605B51] text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-[#605B51] text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-[#605B51] text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {event.attending} attending
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-sm text-[#605B51]">From</div>
                      <div className="text-2xl font-bold text-[#D8D365]">{event.price}</div>
                    </div>
                    <Button variant="primary" size="sm">
                      Get Tickets
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[#454040] text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#E6F082] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#a855f7] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Create Your Next Event?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join thousands of organizers who trust TrybeTickets to power their events. 
            Get started today with our free plan.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="primary" size="lg">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-[#454040]">
              Schedule a Demo
            </Button>
          </div>
          
          <div className="mt-12 text-white/70 text-sm">
            No credit card required · 14-day free trial · Cancel anytime
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2d2a28] mb-4">
              Loved by Organizers Worldwide
            </h2>
            <p className="text-xl text-[#605B51]">
              See what our customers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "TrybeTickets transformed how we manage our music festivals. The platform is intuitive and the support is exceptional.",
                author: "Sarah Johnson",
                role: "Festival Director",
                company: "Summer Sounds"
              },
              {
                quote: "The analytics and reporting features are game-changers. We can make data-driven decisions for every event we host.",
                author: "Michael Chen",
                role: "Event Manager",
                company: "Tech Conferences Inc"
              },
              {
                quote: "From small workshops to large conferences, TrybeTickets scales with our needs. Couldn't ask for a better solution.",
                author: "Emily Rodriguez",
                role: "Operations Lead",
                company: "Art & Culture Hub"
              },
            ].map((testimonial, i) => (
              <Card key={i} padding="lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#E6F082]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#605B51] mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-[#2d2a28]">{testimonial.author}</div>
                  <div className="text-sm text-[#605B51]">{testimonial.role}, {testimonial.company}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
