"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";
import { useApp, UserRole } from "@/context/AppContext";
import { 
  ShoppingBag, 
  Heart, 
  Globe, 
  Search, 
  Menu, 
  X, 
  User, 
  BookOpen,
  Award,
  Bell
} from "lucide-react";

export const Header: React.FC = () => {
  const { t, locale, toggleLanguage, direction } = useTranslation();
  const { cart, wishlist, userPoints, currentRole, setCurrentRole, notifications, clearNotifications } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { href: "/", label: t("navHome") },
    { href: "/shop", label: t("navShop") },
    { href: "/about", label: t("navAbout") },
    { href: "/contact", label: t("navContact") },
  ];

  // Map role to translation key
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "parent": return t("userRole");
      case "school": return t("schoolRole");
      case "seller": return t("marketRole");
      case "admin": return t("adminRole");
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 glass-panel border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-md transform group-hover:rotate-12 transition-transform duration-300">
                <BookOpen size={22} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-900 dark:from-white dark:to-primary-200 bg-clip-text text-transparent">
                {t("logoName")}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary-500 relative py-1 ${
                    isActive 
                      ? "text-primary-600 dark:text-primary-400 font-semibold" 
                      : "text-foreground-custom/80"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Quick dashboard route link */}
            <Link 
              href={`/dashboard/${currentRole}`}
              className="text-sm font-medium text-accent-500 hover:text-accent-600 transition-colors"
            >
              {t("navDashboards")}
            </Link>
          </nav>

          {/* User Controls / Actions */}
          <div className="hidden md:flex items-center gap-5">
            
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-foreground-custom/80 hover:text-primary-600 transition-all text-sm font-semibold"
            >
              <Globe size={16} />
              <span>{t("langName")}</span>
            </button>

            {/* Points Indicator */}
            <Link 
              href={`/dashboard/${currentRole}`} 
              className="flex items-center gap-1.5 bg-accent-50 dark:bg-accent-950/20 border border-accent-200 dark:border-accent-900/50 px-3 py-1.5 rounded-lg text-accent-600 dark:text-accent-400 hover:scale-105 transition-transform"
            >
              <Award size={16} className="animate-pulse" />
              <span className="text-xs font-bold font-mono">{userPoints} {t("points")}</span>
            </Link>

            {/* Notifications Panel */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground-custom/80 relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500" />
                )}
              </button>

              {notificationsOpen && (
                <div className={`absolute top-full mt-2 w-80 glass-panel rounded-2xl p-4 shadow-xl border z-50 ${direction === 'rtl' ? 'left-0' : 'right-0'}`}>
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="font-bold text-sm">{t("dashMenuNotifications")}</span>
                    <button onClick={clearNotifications} className="text-xs text-primary-500 hover:underline">Clear</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center text-slate-400 py-4">No notifications</p>
                    ) : (
                      notifications.map((msg, index) => (
                        <div key={index} className="text-xs p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                          {msg}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link 
              href={`/dashboard/${currentRole}`} 
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground-custom/80 relative"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link 
              href="/shop"
              className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors relative"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-500 text-[10px] text-white flex items-center justify-center font-bold animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2.5 rounded-xl shadow-md text-sm font-semibold transition-all hover:shadow-lg active:scale-95"
              >
                <User size={16} />
                <span>{getRoleLabel(currentRole)}</span>
              </button>

              {roleDropdownOpen && (
                <div className={`absolute top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 z-50 ${direction === 'rtl' ? 'left-0' : 'right-0'}`}>
                  {(["parent", "school", "seller", "admin"] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                        currentRole === role ? "text-primary-600 dark:text-primary-400 font-bold" : "text-foreground-custom/80"
                      } ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                    >
                      {getRoleLabel(role)}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground-custom/80"
            >
              <Globe size={18} />
            </button>
            <Link href="/shop" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground-custom/80 relative">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-accent-500 text-[8px] text-white rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground-custom/80"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-b py-4 px-6 space-y-4 animate-fade-in absolute w-full left-0 z-50">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-foreground-custom/80 hover:text-primary-500 py-1"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={`/dashboard/${currentRole}`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-accent-500 hover:text-accent-600 py-1"
            >
              {t("navDashboards")}
            </Link>
          </nav>
          
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Role Mode:</span>
              <span className="font-bold text-primary-600">{getRoleLabel(currentRole)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {(["parent", "school", "seller", "admin"] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`px-3 py-2 text-xs rounded-lg border text-center transition-colors ${
                    currentRole === role 
                      ? "bg-primary-500 text-white font-bold" 
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-foreground-custom"
                  }`}
                >
                  {role.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between bg-accent-50 dark:bg-accent-950/20 p-2.5 rounded-lg text-accent-600">
              <span className="text-xs font-medium flex items-center gap-1"><Award size={14} /> My Points:</span>
              <span className="text-sm font-bold font-mono">{userPoints} pts</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
