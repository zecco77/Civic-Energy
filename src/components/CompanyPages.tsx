import { ArrowLeft, ArrowRight, Calendar, User, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BlogPage() {
  const posts = [
    {
      title: "How Chicago's New Benchmarking Ordinance Impacts Building Owners",
      date: "Oct 12, 2024",
      author: "Sarah Miller",
      category: "Regulation",
      excerpt: "The latest updates to the Chicago Energy Benchmarking ordinance are here. Learn what's changed and how to stay compliant while maximizing your savings."
    },
    {
      title: "5 Quick Energy-Saving Tips for Commercial Buildings",
      date: "Sep 28, 2024",
      author: "David Chen",
      category: "Efficiency",
      excerpt: "From LED retrofits to smart thermostat scheduling, these five simple changes can have a significant impact on your building's bottom line."
    },
    {
      title: "Understanding ComEd's Latest Commercial Rate Schedules",
      date: "Sep 15, 2024",
      author: "Michael Rodriguez",
      category: "Utility Rates",
      excerpt: "ComEd's new commercial tariffs are now in effect. We break down the changes and show you how they impact your energy costs."
    }
  ];

  return (
    <div className="bg-bg text-primary min-h-screen py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight">The Civic Energy Blog</h1>
          <p className="text-xl text-primary/60 max-w-2xl mx-auto">Insights, updates, and expert advice for Chicago building owners.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-black/5 hover:border-primary/30 transition-colors shadow-sm flex flex-col">
              <div className="flex items-center gap-4 text-xs text-primary/50 mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {post.category}</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4 leading-tight tracking-tight">{post.title}</h3>
              <p className="text-sm text-primary/60 mb-8 flex-grow leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                <span className="text-xs font-medium text-primary/70 flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                <button className="text-accent hover:underline text-sm font-medium flex items-center gap-1">Read More <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CareersPage() {
  const jobs = [
    {
      title: "Senior Full-Stack Engineer",
      location: "Chicago, IL (Hybrid)",
      type: "Full-time",
      department: "Engineering"
    },
    {
      title: "Energy Data Analyst",
      location: "Chicago, IL (Hybrid)",
      type: "Full-time",
      department: "Data Science"
    },
    {
      title: "Sales Development Representative",
      location: "Chicago, IL (Hybrid)",
      type: "Full-time",
      department: "Sales"
    }
  ];

  return (
    <div className="bg-bg text-primary min-h-screen py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight">Join the Team</h1>
          <p className="text-xl text-primary/60 max-w-2xl mx-auto">Help us build a more sustainable future for Chicago.</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-black/5 shadow-sm space-y-8">
          <h2 className="text-3xl font-semibold text-primary tracking-tight">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-bg rounded-2xl border border-black/5 hover:border-primary/30 transition-colors group cursor-pointer">
                <div>
                  <h4 className="text-xl font-semibold text-primary mb-1 tracking-tight group-hover:text-accent transition-colors">{job.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-primary/50">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{job.department}</span>
                  </div>
                </div>
                <button className="mt-4 md:mt-0 bg-white border border-black/10 hover:bg-black/5 text-primary px-6 py-2 rounded-full font-medium text-sm transition-colors shadow-sm">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
