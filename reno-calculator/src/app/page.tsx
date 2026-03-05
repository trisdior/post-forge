'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  Bath, 
  Layers, 
  Paintbrush, 
  Home, 
  MoreHorizontal,
  ArrowRight,
  CheckCircle2,
  Shield,
  Clock,
  Award
} from 'lucide-react';
import Calculator from '@/components/Calculator';

export default function LandingPage() {
  const [showCalculator, setShowCalculator] = useState(false);

  const projectTypes = [
    { icon: ChefHat, label: 'Kitchen', desc: 'Full kitchen renovations' },
    { icon: Bath, label: 'Bathroom', desc: 'Bath & shower remodels' },
    { icon: Layers, label: 'Flooring', desc: 'All flooring types' },
    { icon: Paintbrush, label: 'Painting', desc: 'Interior & exterior' },
    { icon: Home, label: 'Full Remodel', desc: 'Whole home renovations' },
    { icon: MoreHorizontal, label: 'Other', desc: 'Custom projects' },
  ];

  const trustBadges = [
    { icon: Shield, label: 'Licensed & Insured' },
    { icon: Clock, label: '20+ Years Experience' },
    { icon: Award, label: '500+ Projects Completed' },
    { icon: CheckCircle2, label: 'Free Consultations' },
  ];

  if (showCalculator) {
    return <Calculator onBack={() => setShowCalculator(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full mb-8"
          >
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-gold text-sm font-medium">Free Instant Estimate • No Obligation</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            How Much Does Your{' '}
            <span className="text-gold">Remodel</span>{' '}
            Cost?
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            Get an instant estimate for your Chicago home renovation in under 2 minutes. 
            Based on 2026 market rates.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => setShowCalculator(true)}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gold hover:bg-gold-500 text-black font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gold/25 pulse-gold"
          >
            Calculate My Estimate
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Trust text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm text-gray-500 mt-4"
          >
            Trusted by 500+ Chicago homeowners
          </motion.p>
        </div>
      </section>

      {/* Project Types Preview */}
      <section className="px-4 py-16 bg-black/50">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white text-center mb-10"
          >
            We Handle All Types of Renovations
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {projectTypes.map((project, index) => (
              <motion.div
                key={project.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setShowCalculator(true)}
                className="group p-4 bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 rounded-xl cursor-pointer transition-all duration-300"
              >
                <project.icon className="w-8 h-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-semibold text-sm mb-1">{project.label}</h3>
                <p className="text-gray-500 text-xs">{project.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mb-3">
                  <badge.icon className="w-7 h-7 text-gold" />
                </div>
                <span className="text-white font-medium text-sm">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 bg-gradient-to-b from-black/50 to-black">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white text-center mb-12"
          >
            Get Your Estimate in 3 Simple Steps
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Tell Us About Your Project',
                desc: 'Select your project type, size, and quality preferences.',
              },
              {
                step: '2',
                title: 'Get Instant Estimate',
                desc: 'See detailed cost breakdown based on Chicago market rates.',
              },
              {
                step: '3',
                title: 'Request Free Quote',
                desc: 'Connect with Valencia Construction for an exact quote.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="w-12 h-12 bg-gold text-black font-bold text-xl rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] border-t border-dashed border-gold/30" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Second CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button
              onClick={() => setShowCalculator(true)}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gold hover:bg-gold-500 text-black font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105"
            >
              Start My Free Estimate
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10"
          >
            <div className="absolute -top-4 left-8 text-gold text-6xl font-serif">"</div>
            <p className="text-white text-lg md:text-xl mb-6 pt-4">
              Valencia Construction transformed our outdated kitchen into a modern masterpiece. 
              The estimate tool was spot-on, and the team delivered exactly what they promised. 
              Highly recommend!
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                <span className="text-gold font-bold">MR</span>
              </div>
              <div>
                <p className="text-white font-semibold">Maria Rodriguez</p>
                <p className="text-gray-400 text-sm">Lincoln Park, Chicago</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-t from-gold/10 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Ready to Start Your Renovation?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg mb-8"
          >
            Get your free estimate now and take the first step toward your dream home.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowCalculator(true)}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gold hover:bg-gold-500 text-black font-bold text-xl rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-gold/30"
          >
            Get My Free Estimate
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
}
