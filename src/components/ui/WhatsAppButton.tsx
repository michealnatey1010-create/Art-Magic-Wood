"use client";

import React from "react";
import { useTranslation } from "@/context/LanguageContext";
import { MessageCircle } from "lucide-react";

export const WhatsAppButton: React.FC = () => {
  const { direction } = useTranslation();

  const phoneNumber = "966501234567"; // Mock support phone
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello!%20I%20have%20a%20question%20about%20the%20Electronic%20Library%20services.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20ba5a] hover:scale-110 active:scale-95 transition-all duration-300 group ${
        direction === "rtl" ? "left-6" : "right-6"
      }`}
      aria-label="Contact support on WhatsApp"
    >
      {/* Pulse Rings */}
      <span className="absolute w-full h-full rounded-full bg-[#25D366] opacity-40 animate-ping scale-110 -z-10 group-hover:hidden" />
      <span className="absolute w-full h-full rounded-full bg-[#25D366] opacity-20 animate-pulse scale-125 -z-10 group-hover:hidden" />
      
      <MessageCircle size={28} className="fill-current text-white" />
      
      {/* Tooltip */}
      <span className={`absolute bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap ${
        direction === "rtl" ? "left-16" : "right-16"
      }`}>
        WhatsApp Support
      </span>
    </a>
  );
};
