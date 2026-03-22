import React from "react";
import { LifeBuoy, Mail, Phone, MessageCircle } from "lucide-react";

export default function Support() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
          User Support & Helpdesk
        </h1>
        <p className="text-gray-400 mt-1">Manage technical support and assistance queries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#0c0520]/40 p-6 rounded-2xl backdrop-blur-md border border-purple-500/20 hover:border-[#22D3EE]/30 transition-all cursor-pointer shadow-xl hover:shadow-[#22D3EE]/5">
          <Mail className="text-[#22D3EE] mb-4" size={32} />
          <h2 className="text-xl font-bold text-white mb-2 font-sans">Email Support</h2>
          <p className="text-gray-400 text-sm">Review incoming support tickets sent via official support mail.</p>
          <div className="mt-4 text-[#22D3EE] font-medium hover:underline text-sm">support@genfit.ai</div>
        </div>

        <div className="bg-[#0c0520]/40 p-6 rounded-2xl backdrop-blur-md border border-purple-500/20 hover:border-[#8B5CF6]/30 transition-all cursor-pointer shadow-xl hover:shadow-[#8B5CF6]/5">
          <Phone className="text-[#8B5CF6] mb-4" size={32} />
          <h2 className="text-xl font-bold text-white mb-2 font-sans">Help Desk Hotline</h2>
          <p className="text-gray-400 text-sm">Telephonic routing parameters setup forwards query managers securely.</p>
          <div className="mt-4 text-[#8B5CF6] font-medium hover:underline text-sm">+1 (555) 123-4567</div>
        </div>

        <div className="bg-[#0c0520]/40 p-6 rounded-2xl backdrop-blur-md border border-purple-500/20 hover:border-pink-500/30 transition-all cursor-pointer shadow-xl hover:shadow-pink-500/5">
          <MessageCircle className="text-pink-500 mb-4" size={32} />
          <h2 className="text-xl font-bold text-white mb-2 font-sans">Live Chat Tickets</h2>
          <p className="text-gray-400 text-sm">Read active sessions logs streaming interactive responses setups correctly.</p>
          <div className="mt-4 text-pink-500 font-medium hover:underline text-sm">0 Active Sessions</div>
        </div>
      </div>

      <div className="bg-[#0c0520]/20 border border-purple-500/20 p-10 rounded-2xl text-center mt-10 shadow-inner">
        <LifeBuoy className="text-gray-600 mx-auto mb-4 animate-bounce" size={48} />
        <h3 className="text-lg font-bold text-gray-200">Support Ticket System Under Construction</h3>
        <p className="text-gray-500 text-sm mt-2">Integrating custom helpdesk pipelines soon!</p>
      </div>
    </div>
  );
}
