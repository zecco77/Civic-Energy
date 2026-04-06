import { ArrowRight, Search, Zap, BarChart3, Wrench, LineChart, CheckCircle2, Building2, CloudRain, FileText, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export function PlatformPage() {
  return (
    <div className="bg-bg text-primary min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
          How It Works
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 max-w-4xl mx-auto leading-tight text-primary">
          From address to action plan in under 60 seconds.
        </h1>
        <p className="text-xl text-primary/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          Civic Energy connects public building data, utility rates, and AI analysis to show you exactly where your money is going — and how to get it back.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-sm"
        >
          Analyze Your Building
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Four-Step Process Section */}
      <section id="how-it-works" className="py-24 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Enter Your Address",
                description: "We instantly pull your building's energy benchmarking data from Chicago's public records database — no forms, no utility login required."
              },
              {
                step: "02",
                title: "See Your Losses",
                description: "We calculate your annual energy waste in dollars using ComEd rates, building size, type, and Chicago weather patterns. Real numbers, not averages."
              },
              {
                step: "03",
                title: "Get Your Action Plan",
                description: "We rank your top savings opportunities by return on investment, payback period, and available rebates — so you know exactly where to start."
              },
              {
                step: "04",
                title: "Execute and Track",
                description: "Connect with vetted Chicago contractors, claim your rebates, and watch your dashboard as predicted savings become real savings month by month."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-bg rounded-3xl p-8 border border-black/5 relative overflow-hidden group hover:border-primary/30 transition-colors shadow-sm">
                <div className="text-primary font-mono text-xl mb-4 font-medium">{item.step}</div>
                <h3 className="text-xl font-semibold text-primary mb-3 tracking-tight">{item.title}</h3>
                <p className="text-primary/60 leading-relaxed text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources Trust Section */}
      <section className="py-24 bg-bg text-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-16 tracking-tight">Built on verified Chicago data.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto mb-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Building2 className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-primary">City of Chicago Benchmarking Ordinance Data</h4>
              <p className="text-sm text-primary/60 leading-relaxed">Official energy performance records for Chicago commercial buildings.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Zap className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-primary">ComEd and Peoples Gas Rate Schedules</h4>
              <p className="text-sm text-primary/60 leading-relaxed">Current commercial tariffs and incentive program data.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <CloudRain className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-primary">NOAA Chicago Weather Station</h4>
              <p className="text-sm text-primary/60 leading-relaxed">Historical degree day data for accurate weather normalization.</p>
            </div>
          </div>
          <p className="text-sm text-primary/40">All financial estimates are clearly labeled with confidence levels and data sources.</p>
        </div>
      </section>

      {/* Feature Deep Dive Section */}
      <section className="py-24 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-bg border border-black/5 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center shadow-sm">
            <div className="md:w-1/3">
              <h3 className="text-3xl font-semibold text-primary leading-tight tracking-tight">Financial Clarity, Not Technical Jargon.</h3>
            </div>
            <div className="md:w-2/3">
              <p className="text-lg text-primary/70 leading-relaxed">
                Every output is expressed in dollars, not kilowatt hours or BTUs. Because building owners make financial decisions, they deserve financial language. We translate complex engineering metrics into clear ROI, payback periods, and bottom-line impact.
              </p>
            </div>
          </div>

          <div className="bg-bg border border-black/5 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center shadow-sm">
            <div className="md:w-1/3">
              <h3 className="text-3xl font-semibold text-primary leading-tight tracking-tight">Chicago-Specific, Not National Averages.</h3>
            </div>
            <div className="md:w-2/3">
              <p className="text-lg text-primary/70 leading-relaxed">
                We use Chicago's actual benchmarking ordinance data, local utility rates from ComEd and Peoples Gas, and O'Hare weather station degree day data — not national estimates applied generically to every city. Your analysis reflects the reality of operating a building in Chicago.
              </p>
            </div>
          </div>

          <div className="bg-bg border border-black/5 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center shadow-sm">
            <div className="md:w-1/3">
              <h3 className="text-3xl font-semibold text-primary leading-tight tracking-tight">A Loop, Not a One-Time Report.</h3>
            </div>
            <div className="md:w-2/3">
              <p className="text-lg text-primary/70 leading-relaxed">
                The value cycle is ongoing: analyze, fix, track, improve again. The platform continuously identifies new savings as your building changes, utility rates fluctuate, and new rebate programs become available. It's a living dashboard for your building's efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 bg-primary/5 border-t border-primary/10 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-semibold text-primary mb-6 tracking-tight">Your building's losses are already calculated.</h2>
          <p className="text-xl text-primary/60 mb-10">Enter your address and see the number in under a minute.</p>
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white px-10 py-5 rounded-full font-medium text-xl transition-colors shadow-sm"
          >
            Analyze Your Building
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
