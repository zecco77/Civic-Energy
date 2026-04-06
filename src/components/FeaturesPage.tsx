import { Zap, LineChart, ShieldCheck, Building2, FileText, Settings, Map, Receipt, Users } from 'lucide-react';

export function FeaturesPage() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Energy Benchmarking",
      description: "Compare your building's energy performance against similar properties in Chicago using verified public data."
    },
    {
      icon: <LineChart className="w-6 h-6" />,
      title: "Financial Projections",
      description: "Translate energy waste into actionable financial metrics, including ROI and payback periods for retrofits."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Compliance Tracking",
      description: "Stay ahead of Chicago's Energy Benchmarking Ordinance requirements and avoid potential fines."
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Portfolio Management",
      description: "Manage multiple properties from a single dashboard and identify your best opportunities for savings."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Custom Reports",
      description: "Generate detailed, board-ready reports on your building's performance and proposed efficiency projects."
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Utility Integration",
      description: "Seamlessly integrate with ComEd and Peoples Gas rate schedules for accurate cost calculations."
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Neighborhood Map",
      description: "Visualize building performance across Chicago neighborhoods to identify geographic trends and local benchmarks."
    },
    {
      icon: <Receipt className="w-6 h-6" />,
      title: "Upload Utility Bills",
      description: "Easily upload and parse your utility bills to automatically track actual spend versus projected savings."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Contractor Matching",
      description: "Connect directly with vetted local contractors who specialize in the specific retrofits your building needs."
    }
  ];

  return (
    <div className="bg-bg text-primary min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
          Platform Features
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 max-w-4xl mx-auto leading-tight text-primary">
          Everything you need to optimize your building.
        </h1>
        <p className="text-xl text-primary/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          Powerful tools designed specifically for Chicago commercial real estate owners and operators.
        </p>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-bg rounded-3xl p-8 border border-black/5 hover:border-primary/30 transition-colors shadow-sm group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-primary tracking-tight mb-4">{feature.title}</h3>
                <p className="text-primary/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
