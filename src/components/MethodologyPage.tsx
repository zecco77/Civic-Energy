import { ArrowRight, Calculator, LineChart, ShieldCheck, Zap, Building2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MethodologyPage() {
  return (
    <div className="bg-bg text-primary min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
          Our Methodology
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 max-w-4xl mx-auto leading-tight text-primary">
          How we calculate your building's energy waste.
        </h1>
        <p className="text-xl text-primary/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          Civic Energy uses a rigorous, data-driven approach to translate public energy benchmarking data into actionable financial insights.
        </p>
      </section>

      {/* Core Principles Section */}
      <section className="py-24 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Calculator className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-primary tracking-tight">Verified Benchmarking</h3>
              <p className="text-primary/60 leading-relaxed">
                We start with the official Energy Benchmarking records submitted to the City of Chicago. This data provides a verified baseline of your building's actual energy consumption over a full calendar year.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <LineChart className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-primary tracking-tight">Weather Normalization</h3>
              <p className="text-primary/60 leading-relaxed">
                Chicago weather is extreme. We use historical degree day data from NOAA to normalize your building's performance, ensuring we distinguish between a cold winter and an inefficient heating system.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-primary tracking-tight">Peer Comparison</h3>
              <p className="text-primary/60 leading-relaxed">
                We compare your building only to its true peers — other Chicago buildings of the same primary use type, size, and age. This identifies the "efficiency gap" between your building and the top performers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calculation Process Section */}
      <section className="py-24 bg-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-primary mb-12 text-center tracking-tight">The Calculation Process</h2>
          <div className="space-y-12">
            {[
              {
                title: "1. Baseline Establishment",
                description: "We extract your building's Site EUI (Energy Use Intensity) and Energy Star Score from the public record. This represents your current performance state."
              },
              {
                title: "2. Potential Efficiency Target",
                description: "We identify the 75th percentile performance for your specific building type in Chicago. This becomes our 'Practical Efficiency Target' — a level of performance already achieved by 25% of your peers."
              },
              {
                title: "3. Energy Waste Quantification",
                description: "The difference between your current EUI and the target EUI represents your 'Energy Waste' in BTUs and kWh. We then apply current ComEd and Peoples Gas commercial rate schedules to convert this waste into dollars."
              },
              {
                title: "4. Actionable ROI Analysis",
                description: "We apply industry-standard costs for common retrofits (LED, HVAC, Envelope) and subtract available utility rebates to calculate the net investment and payback period for each improvement."
              }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-primary mb-2 tracking-tight">{step.title}</h4>
                  <p className="text-primary/60 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white border-t border-black/5 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-primary mb-8 tracking-tight">Ready to see your building's analysis?</h2>
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-sm"
          >
            Analyze Your Building
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
