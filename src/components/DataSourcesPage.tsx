import { ArrowRight, Building2, Zap, CloudRain, ShieldCheck, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DataSourcesPage() {
  return (
    <div className="bg-bg text-primary min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
          Data Sources
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 max-w-4xl mx-auto leading-tight text-primary">
          Built on verified Chicago data.
        </h1>
        <p className="text-xl text-primary/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          Civic Energy connects public building data, utility rates, and weather records to show you exactly where your money is going.
        </p>
      </section>

      {/* Primary Data Sources Section */}
      <section className="py-24 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-primary tracking-tight">Chicago Energy Benchmarking</h3>
              <p className="text-primary/60 leading-relaxed text-sm">
                Official energy performance records for Chicago commercial buildings. This data provides a verified baseline of your building's actual energy consumption.
              </p>
              <a 
                href="https://data.cityofchicago.org/Environment-Sustainable-Development/Chicago-Energy-Benchmarking/7crp-atry" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent font-medium hover:underline text-sm"
              >
                View Source Data <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            
            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-primary tracking-tight">Chicago Residential Data</h3>
              <p className="text-primary/60 leading-relaxed text-sm">
                Comprehensive data for residential building management and commercial applications throughout Chicago. Used for evaluating regional footprint targets.
              </p>
              <a 
                href="https://data.cityofchicago.org/Community-Economic-Development/Residential/pa69-gxc6/about_data" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent font-medium hover:underline text-sm"
              >
                View Source Data <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-primary tracking-tight">Cook County Assessor Modeling</h3>
              <p className="text-primary/60 leading-relaxed text-sm">
                Archived residential modeling data from the Cook County Assessor. Useful for understanding historical valuation properties, building age, and structural footprint details.
              </p>
              <a 
                href="https://datacatalog.cookcountyil.gov/Property-Taxation/Assessor-Archived-05-11-2022-Residential-Modeling-/8f9d-wy2d/about_data" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent font-medium hover:underline text-sm"
              >
                View Source Data <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-primary tracking-tight">Chicago Building Permits</h3>
              <p className="text-primary/60 leading-relaxed text-sm">
                Real-time tracking of building permits issued by the City of Chicago. Crucial for timeline estimation, contractor checks, and validating reported work scopes.
              </p>
              <a 
                href="https://data.cityofchicago.org/Buildings/Building-Permits/ydr8-5enu/about_data" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent font-medium hover:underline text-sm"
              >
                View Source Data <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-primary tracking-tight">ComEd & Peoples Gas Rates</h3>
              <p className="text-primary/60 leading-relaxed text-sm">
                Current commercial tariffs and incentive program data. We use these to translate energy waste into actual dollars lost.
              </p>
              <a 
                href="https://www.comed.com/MyAccount/MyService/Pages/RatesTariffs.aspx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent font-medium hover:underline text-sm"
              >
                View ComEd Rates <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <CloudRain className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-primary tracking-tight">NOAA Weather Station</h3>
              <p className="text-primary/60 leading-relaxed text-sm">
                Historical degree day data for accurate weather normalization. This ensures we distinguish between a cold winter and an inefficient system.
              </p>
              <a 
                href="https://www.ncdc.noaa.gov/cdo-web/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent font-medium hover:underline text-sm"
              >
                View NOAA Data <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Data Accuracy Section */}
      <section className="py-24 bg-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-primary mb-8 tracking-tight">Data Accuracy and Confidence</h2>
          <p className="text-lg text-primary/70 leading-relaxed mb-12">
            Every financial estimate is clearly labeled with confidence levels and data sources. We prioritize accuracy and transparency in all our calculations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm text-left">
              <h4 className="text-xl font-semibold text-primary mb-4 tracking-tight">High Confidence</h4>
              <p className="text-primary/60 leading-relaxed">
                Buildings with verified benchmarking data and complete utility records. These estimates are highly accurate and can be used for financial planning.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm text-left">
              <h4 className="text-xl font-semibold text-primary mb-4 tracking-tight">Medium Confidence</h4>
              <p className="text-primary/60 leading-relaxed">
                Buildings with estimated data based on NREL/EIA benchmarks. These estimates provide a good starting point but should be verified with actual utility bills.
              </p>
            </div>
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
