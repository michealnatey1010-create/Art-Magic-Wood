"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { 
  BookOpen, 
  Mail, 
  Phone,
  Smartphone,
  Info,
  ShieldCheck,
  FileText,
  HelpCircle
} from "lucide-react";

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-slate-950 border-t border-slate-800 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Summary */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white">
                <BookOpen size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                {t("logoName")}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t("footDesc")}
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-accent-500 hover:text-white flex items-center justify-center transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Info size={16} className="text-primary-400" />
              {t("quickLinks")}
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/" className="hover:text-primary-400 transition-colors">
                  {t("navHome")}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-primary-400 transition-colors">
                  {t("navShop")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors">
                  {t("navAbout")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors">
                  {t("navContact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent-400" />
              {t("legal")}
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors flex items-center gap-1">
                  <FileText size={14} /> {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors flex items-center gap-1">
                  <FileText size={14} /> {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors flex items-center gap-1">
                  <HelpCircle size={14} /> {t("faq")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors flex items-center gap-1">
                  <HelpCircle size={14} /> {t("support")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Download & Support */}
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Smartphone size={16} className="text-primary-400" />
                {t("downloadApp")}
              </h3>
              <div className="flex flex-col gap-2.5">
                <a href="#" className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl border border-slate-700 transition-all group">
                  <div className="text-slate-400 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22.05 13.89,21.24 12.37,21.24C10.84,21.24 10.37,21.97 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase tracking-tight">Download on the</p>
                    <p className="text-xs font-bold text-white">{t("downloadStore")}</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl border border-slate-700 transition-all group">
                  <div className="text-slate-400 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M5,3L17.5,10.25L20,12L17.5,13.75L5,21V3M7,5.5V18.5L16,12L7,5.5Z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase tracking-tight">Get it on</p>
                    <p className="text-xs font-bold text-white">{t("downloadPlay")}</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1 pt-2">
              <p className="flex items-center gap-2"><Phone size={12} /> +966 50 123 4567</p>
              <p className="flex items-center gap-2"><Mail size={12} /> info@edulib-library.com</p>
            </div>

          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t("logoName")}. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for schools, teachers, parents, and partner stationery brands.</p>
        </div>

      </div>
    </footer>
  );
};
