import React from 'react';
import { TrendingUp, Shield, PieChart, Users, Target, Briefcase } from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: TrendingUp,
      title: "Investment Planning",
      description: "Strategic portfolio management tailored to your financial goals and risk tolerance."
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Comprehensive protection strategies to safeguard your wealth and investments."
    },
    {
      icon: PieChart,
      title: "Portfolio Analysis",
      description: "In-depth analysis and optimization of your investment portfolio performance."
    },
    {
      icon: Users,
      title: "Financial Advisory",
      description: "Expert guidance from certified financial advisors with decades of experience."
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Clear financial roadmaps to help you achieve your short and long-term objectives."
    },
    {
      icon: Briefcase,
      title: "Wealth Management",
      description: "Comprehensive wealth preservation and growth strategies for high-net-worth individuals."
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-40 h-40 bg-blue-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-200/30 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-cyan-200/30 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive financial solutions designed to help you achieve your goals and secure your future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 hover:border-blue-300/50 transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}