import React from 'react';
import { motion } from 'motion/react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PlayCircle, Target, ArrowRight, BarChart3, Building2, Leaf, Zap, Code, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export function SlidesPage() {
  return (
    <div className="bg-bg flex flex-col font-sans">
      
      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-24">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-primary tracking-tight mb-4">Pitch Deck (Civic Energy)</h1>
          
        </div>

        {/* Slide 1 - Civic Energy */}
        <section className="bg-primary rounded-[2.5rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12 w-full max-w-5xl mx-auto items-center min-h-[500px]">
          <img src="https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80" alt="Chicago skyline" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="flex-1 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white font-medium text-sm mb-8 backdrop-blur-sm border border-white/10">
              <Zap className="w-4 h-4 text-accent" />
              Civic Energy
            </div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-8">
              Turning hidden <span className="text-accent">energy waste</span> into savings, sustainability, and community impact.
            </h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-6 z-10">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-lg leading-relaxed">
              In Chicago alone, more than 3,500 buildings are publicly wasting energy and money every year - but most owners don't know how much they're losing or how to fix it.
            </div>
            <div className="bg-accent text-white p-8 rounded-3xl text-lg leading-relaxed shadow-lg">
              Civic Energy helps commercial and residential building owners instantly identify energy waste, reduce utility costs, and take action toward more sustainable communities.
            </div>
          </div>
        </section>

        {/* Slide 2 - The Problem */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-16 text-primary shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-black/5 flex flex-col w-full max-w-5xl mx-auto min-h-[500px]">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary font-medium text-sm mb-6 border border-primary/10">
              <Target className="w-4 h-4 text-accent" />
              The Problem
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight max-w-2xl">
              Energy waste is invisible — until it becomes a financial burden.
            </h2>
          </div>
          
          <div className="flex-1 grid md:grid-cols-2 gap-6">
            <div className="bg-primary text-white p-8 rounded-3xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3 z-10"><BarChart3 className="text-accent" /> The Numbers</h3>
              <ul className="space-y-4 text-lg text-white/80 z-10">
                <li className="flex items-start gap-3"><span className="text-accent mt-1">•</span> 30% of commercial building energy is wasted</li>
                <li className="flex items-start gap-3"><span className="text-accent mt-1">•</span> Buildings lose $70K–$500K annually due to inefficiency</li>
                <li className="flex items-start gap-3"><span className="text-accent mt-1">•</span> Utility incentives worth millions go unclaimed</li>
                <li className="flex items-start gap-3"><span className="text-accent mt-1">•</span> Existing audits are expensive, slow, and difficult to act on</li>
              </ul>
            </div>
            <div className="bg-bg p-8 rounded-3xl border border-black/5 flex flex-col">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3"><Building2 className="text-primary/40" /> Why This Matters</h3>
              <ul className="space-y-4 text-lg text-primary/70">
                <li className="flex items-start gap-3"><ArrowRight className="w-5 h-5 shrink-0 mt-0.5 text-primary/40" /> Higher operating costs</li>
                <li className="flex items-start gap-3"><ArrowRight className="w-5 h-5 shrink-0 mt-0.5 text-primary/40" /> Higher residential utility bills</li>
                <li className="flex items-start gap-3"><ArrowRight className="w-5 h-5 shrink-0 mt-0.5 text-primary/40" /> Increased carbon emissions</li>
                <li className="flex items-start gap-3"><ArrowRight className="w-5 h-5 shrink-0 mt-0.5 text-primary/40" /> Limited accessibility to energy intelligence</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Slide 3 - The Solution */}
        <section className="bg-primary rounded-[2.5rem] p-8 md:p-16 text-white shadow-xl flex flex-col w-full max-w-5xl mx-auto relative overflow-hidden min-h-[500px]">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" alt="Office building" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="mb-12 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white font-medium text-sm mb-6 shadow-md">
              The Solution
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              A financial decision engine for buildings.
            </h2>
          </div>
          
          <div className="flex-1 grid md:grid-cols-2 gap-6 z-10">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-semibold mb-6">How Civic Energy Works</h3>
              <div className="space-y-4">
                {[
                  "Enter a building address",
                  "Instantly see energy waste and savings potential",
                  "Understand why inefficiency exists",
                  "Get ROI-driven recommendations",
                  "Connect with contractors and incentives"
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-primary/50 p-3 rounded-2xl border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold shrink-0">{idx + 1}</div>
                    <span className="text-white/90 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 flex flex-col">
              <div className="bg-accent p-8 rounded-3xl shadow-lg flex-1">
                <h3 className="text-2xl font-semibold mb-6">What Makes Us Different</h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start gap-3"><span className="bg-white/20 p-1 rounded-full"><ShieldCheck className="w-4 h-4 shrink-0" /></span> We provide instant, accurate analysis by leveraging public Chicago energy benchmarking data.</li>
                  <li className="flex items-start gap-3"><span className="bg-white/20 p-1 rounded-full"><ShieldCheck className="w-4 h-4 shrink-0" /></span> Our platform serves a diverse market with a dedicated focus on both commercial and residential properties.</li>
                  <li className="flex items-start gap-3"><span className="bg-white/20 p-1 rounded-full"><ShieldCheck className="w-4 h-4 shrink-0" /></span> We deliver actionable, ROI-driven financial insights rather than just displaying complex data dashboards.</li>
                  <li className="flex items-start gap-3"><span className="bg-white/20 p-1 rounded-full"><ShieldCheck className="w-4 h-4 shrink-0" /></span> Our solution connects building owners directly with local contractors to simplify implementation.</li>
                  <li className="flex items-start gap-3"><span className="bg-white/20 p-1 rounded-full"><ShieldCheck className="w-4 h-4 shrink-0" /></span> Homeowners and small building operators can easily upload utility bills to receive personalized energy insights.</li>
                  <li className="flex items-start gap-3"><span className="bg-white/20 p-1 rounded-full"><ShieldCheck className="w-4 h-4 shrink-0" /></span> Property owners can manually add and profile their own buildings if public data is not already available.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Slide */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-16 text-primary shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-black/5 flex flex-col items-center justify-center w-full max-w-5xl mx-auto min-h-[500px]">
           <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-12">Product Demo</h2>
           <div className="w-full max-w-3xl aspect-video bg-black/5 rounded-3xl border border-black/10 flex items-center justify-center group cursor-pointer hover:bg-black/10 transition-colors">
              <div className="text-center">
                <PlayCircle className="w-20 h-20 text-accent mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <p className="font-medium text-primary/60 text-lg">Watch Demo</p>
              </div>
           </div>
        </section>

        {/* Slide 4 - Impact + Validation */}
        <section className="bg-bg rounded-[2.5rem] p-8 md:p-16 text-primary border border-black/5 flex flex-col w-full max-w-5xl mx-auto min-h-[500px]">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              Building economic and <span className="text-emerald-600">climate impact</span> together.
            </h2>
          </div>
          
          <div className="flex-1 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 flex flex-col">
              <h3 className="text-xl font-semibold mb-6 text-emerald-800 flex items-center gap-2"><Leaf className="w-5 h-5" /> Community Impact</h3>
              <ul className="space-y-4 text-emerald-900/80">
                <li className="flex items-start gap-2">• Lower utility costs</li>
                <li className="flex items-start gap-2">• Reduced emissions</li>
                <li className="flex items-start gap-2">• Increased energy efficiency adoption</li>
                <li className="flex items-start gap-2">• Support for local green jobs and contractors</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm flex flex-col">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-accent" /> Early Validation</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-bold text-accent mb-1">12</div>
                  <p className="text-sm text-primary/70">energy and climate expert interviews completed</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-1">48</div>
                  <p className="text-sm text-primary/70">people joined our waitlist</p>
                </div>
                <div className="font-medium text-primary bg-primary/5 p-3 rounded-xl text-sm">
                  Product vision already live and in development
                </div>
              </div>
            </div>

            <div className="bg-primary text-white p-8 rounded-3xl flex flex-col lg:col-span-1 md:col-span-2">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-accent" /> Market Opportunity</h3>
              <p className="mb-4 text-white/80">Chicago is the ideal launch market due to:</p>
              <ul className="space-y-3">
                <li className="bg-white/10 p-3 rounded-xl border border-white/5 text-sm">Mandatory energy benchmarking</li>
                <li className="bg-white/10 p-3 rounded-xl border border-white/5 text-sm">Strong incentive programs</li>
                <li className="bg-white/10 p-3 rounded-xl border border-white/5 text-sm">Upcoming building performance regulations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Slide 5 - Business Model */}
        <section className="bg-primary rounded-[2.5rem] p-8 md:p-16 text-white shadow-2xl flex flex-col w-full max-w-5xl mx-auto relative overflow-hidden min-h-[500px]">
           <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80" alt="Data abstract" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay pointer-events-none" />
           <div className="absolute top-1/4 right-0 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
           
           <div className="mb-12 z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-4">
              Scalable revenue tied directly to customer savings.
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent font-medium text-sm border border-accent/20">
              Business Model
            </div>
          </div>

          <div className="flex-1 grid md:grid-cols-2 gap-8 z-10 items-center">
            <div className="grid grid-cols-2 gap-4">
               {["Premium energy reports", "Shared savings agreements", "Contractor lead marketplace", "Portfolio subscriptions"].map((stream, idx) => (
                 <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 shrink-0 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-4 border border-accent/30">
                      ${idx + 1}
                    </div>
                    <span className="font-medium">{stream}</span>
                 </div>
               ))}
            </div>

            <div className="bg-white text-primary p-10 rounded-3xl">
              <h3 className="text-2xl font-bold mb-6">Why It Scales</h3>
              <ul className="space-y-5 text-lg">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0"><ArrowRight className="w-4 h-4" /></div>
                  SaaS + transaction-based revenue
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0"><ArrowRight className="w-4 h-4" /></div>
                  High-margin digital product
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0"><ArrowRight className="w-4 h-4" /></div>
                  Recurring revenue opportunities
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0"><ArrowRight className="w-4 h-4" /></div>
                  Strong B2B expansion potential
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Slide 6 - Why We're Here */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-16 text-primary shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-black/5 flex flex-col w-full max-w-5xl mx-auto min-h-[500px]">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-4">
              Why We're Here
            </h2>
            <p className="text-xl text-primary/60">What the $25K will help us achieve.</p>
          </div>

          <div className="flex-1 bg-bg p-8 rounded-3xl border border-black/5">
            <div className="grid grid-cols-[1fr,auto] gap-x-8 gap-y-4 font-medium text-sm text-primary/50 uppercase tracking-wider mb-6 pb-4 border-b border-black/10">
              <div>Area</div>
              <div className="text-right">Allocation</div>
            </div>
            
            <div className="space-y-4">
              {[
                { area: "Product & Engineering", amount: "$10K" },
                { area: "Pilot Expansion & User Research", amount: "$5K" },
                { area: "Growth & Marketing", amount: "$5K" },
                { area: "Operations & Legal", amount: "$5K" },
              ].map((item, idx) => (
                <div key={idx} className="group grid grid-cols-[1fr,auto] gap-x-8 items-center bg-white p-5 rounded-2xl shadow-sm border border-black/5 hover:border-accent/30 transition-colors">
                  <div className="text-lg font-semibold flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-colors">
                      <Code className="w-5 h-5" />
                    </div>
                    {item.area}
                  </div>
                  <div className="text-2xl font-bold text-accent">{item.amount}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-black/10 flex justify-between items-center text-xl font-bold">
              <span>Total Funding Requested</span>
              <span className="text-3xl text-primary">$25,000</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
