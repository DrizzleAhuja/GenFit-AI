import React from 'react';
import NavBar from '../HomePage/NavBar';
import Footer from '../HomePage/Footer';
import { useTheme } from '../../context/ThemeContext';

export default function About() {
  const { darkMode } = useTheme();
  
  const features = [
    {
      title: "AI-Powered Insights",
      description: "Personalized recommendations based on your unique health data and goals",
      icon: "🧠"
    },
    {
      title: "Custom Workouts",
      description: "Tailored exercise plans that adapt to your fitness level and preferences",
      icon: "💪"
    },
    {
      title: "Mindfulness & Meditation",
      description: "Guided sessions to reduce stress and improve mental clarity",
      icon: "🧘"
    },
    {
      title: "Nutrition Tracking",
      description: "Smart meal planning and nutritional insights for optimal health",
      icon: "🥗"
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Workouts Completed" },
    { value: "95%", label: "Satisfaction Rate" },
    { value: "24/7", label: "AI Support" }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <NavBar />
      
      {/* Hero Section */}
      <div className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16 lg:mb-20">
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              About <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">MindFit AI</span>
            </h1>
            <div className={`w-20 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6 sm:mb-8 rounded-full`}></div>
            <p className={`text-base sm:text-lg lg:text-xl leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Revolutionizing personal wellness through intelligent, data-driven solutions
            </p>
          </div>

          {/* Mission Statement */}
          <div className={`max-w-5xl mx-auto mb-16 sm:mb-20 lg:mb-24 p-6 sm:p-8 lg:p-12 rounded-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-xl'}`}>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h2 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Our Mission
                </h2>
                <p className={`text-sm sm:text-base lg:text-lg leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  We empower individuals to achieve optimal mental and physical health through personalized guidance, cutting-edge AI technology, and a supportive community.
                </p>
                <p className={`text-sm sm:text-base lg:text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Our platform integrates innovative solutions to help you build sustainable habits for a balanced and fulfilling life.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className={`w-full h-48 sm:h-56 lg:h-64 rounded-xl flex items-center justify-center text-6xl sm:text-7xl lg:text-8xl ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                  🎯
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-6xl mx-auto mb-16 sm:mb-20 lg:mb-24">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              What We Offer
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`p-6 sm:p-8 rounded-xl transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-800 border border-gray-700 hover:border-blue-500' 
                      : 'bg-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="text-4xl sm:text-5xl mb-4">{feature.icon}</div>
                  <h3 className={`text-lg sm:text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className={`max-w-6xl mx-auto mb-16 sm:mb-20 p-8 sm:p-12 lg:p-16 rounded-2xl ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-900 to-purple-900' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-white">
              MindFit AI by the Numbers
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base lg:text-lg text-blue-100">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className={`max-w-4xl mx-auto text-center p-8 sm:p-12 rounded-2xl ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-xl'
          }`}>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ready to Transform Your Life?
            </h2>
            <p className={`text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Join thousands of users who are already on their journey to better health and wellness
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              Get Started Today
            </button>
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
}