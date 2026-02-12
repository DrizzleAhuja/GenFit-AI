import React from "react";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { useTheme } from '../../context/ThemeContext';
import { Mail, Phone, MapPin, Send, Sparkles } from 'lucide-react';

export default function Contactus() {
  const { darkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col ${
      darkMode ? 'bg-[#05010d] text-white' : 'bg-[#020617] text-gray-100'
    }`}>
      <NavBar />
      
      <main className="flex-grow">
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          {/* Background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Header */}
            <header className="text-center mb-6 sm:mb-8 lg:mb-10">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FACC15]" />
                <span className="text-xs sm:text-sm font-semibold text-gray-100">
                  Get in touch
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
                Contact{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
                  GenFit AI
                </span>
              </h1>

              <p className="max-w-3xl mx-auto text-sm sm:text-base lg:text-lg text-gray-300">
                Have questions or feedback? We're here to help. Reach out and we'll get back to you as soon as possible.
              </p>
            </header>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mb-12">
              {/* Contact Information */}
              <div className="relative h-full rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 sm:p-8 flex flex-col shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-white">Contact Information</h2>
                <div className="space-y-6 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#020617] border border-[#1F2937] flex-shrink-0">
                      <Mail className="w-6 h-6 text-[#22D3EE]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">Email</h3>
                      <p className="text-white">info@genfitai.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#020617] border border-[#1F2937] flex-shrink-0">
                      <Phone className="w-6 h-6 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">Phone</h3>
                      <p className="text-white">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#020617] border border-[#1F2937] flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#22D3EE]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">Address</h3>
                      <p className="text-white">123 AI Wellness St, Future City, FW 98765</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="relative h-full rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 sm:p-8 flex flex-col shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-white">Send us a Message</h2>
                <form className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full p-3 rounded-xl border border-[#1F2937] bg-[#020617] text-white focus:ring-2 focus:ring-[#22D3EE]/50 focus:border-[#22D3EE] transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 rounded-xl border border-[#1F2937] bg-[#020617] text-white focus:ring-2 focus:ring-[#22D3EE]/50 focus:border-[#22D3EE] transition-all"
                      placeholder="your@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2 text-gray-300">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full p-3 rounded-xl border border-[#1F2937] bg-[#020617] text-white focus:ring-2 focus:ring-[#22D3EE]/50 focus:border-[#22D3EE] transition-all"
                      placeholder="Subject of your message"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-300">Message</label>
                    <textarea
                      id="message"
                      rows="5"
                      className="w-full p-3 rounded-xl border border-[#1F2937] bg-[#020617] text-white focus:ring-2 focus:ring-[#22D3EE]/50 focus:border-[#22D3EE] transition-all resize-none"
                      placeholder="Your message..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] hover:opacity-95 transition-all duration-300 shadow-lg hover:shadow-[#22D3EE]/40"
                  >
                    Send Message
                    <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
