import { ArrowRight, Info, Users, Target, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="bg-bg text-primary min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
          About Civic Energy
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 max-w-4xl mx-auto leading-tight text-primary">
          Our mission is to make Chicago the most energy-efficient city in the world.
        </h1>
        <p className="text-xl text-primary/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          We believe that energy efficiency should be accessible, actionable, and financially rewarding for every building owner in Chicago.
        </p>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white border-y border-black/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl font-semibold text-primary tracking-tight">Our Story</h2>
          <p className="text-lg text-primary/70 leading-relaxed">
            Civic Energy was founded in 2026 with a simple goal: to help Chicago building owners navigate the complex world of energy efficiency. We saw a gap between the public data available and the actionable insights owners needed to make informed decisions.
          </p>
          <p className="text-lg text-primary/70 leading-relaxed">
            By combining public benchmarking data with advanced analytics and a deep understanding of local utility programs, we've built a platform that turns data into dollars.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-primary tracking-tight">Transparency</h3>
              <p className="text-primary/60 leading-relaxed">
                We believe in being open about our data sources, methodologies, and confidence levels. You deserve to know exactly how we arrive at our numbers.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-primary tracking-tight">Community</h3>
              <p className="text-primary/60 leading-relaxed">
                We're built for Chicago, by Chicagoans. We're committed to supporting local contractors and building owners to create a more sustainable city.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-primary tracking-tight">Impact</h3>
              <p className="text-primary/60 leading-relaxed">
                We measure our success by the real-world impact we have on energy consumption and building owner savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white border-t border-black/5 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-primary mb-8 tracking-tight">Join us in our mission.</h2>
          <Link 
            to="/signup"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-sm"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
