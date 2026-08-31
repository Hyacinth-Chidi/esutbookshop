'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  LogOut,
  X,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  ClipboardList,
  BookOpen,
  FileText,
  HelpCircle
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

const MATERIAL_SUBPAGES = [
  { name: 'Textbooks', category: 'textbook', icon: BookOpen },
  { name: 'Handouts', category: 'handout', icon: FileText },
  { name: 'Past Questions', category: 'past questions', icon: HelpCircle },
];

export default function AdminSidebar({ isOpen, onClose, isCollapsed, toggleCollapse }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { admin, logout, isAdmin } = useAdminAuth();

  const currentCategory = searchParams.get('category');
  const isMaterialsSection = pathname === '/admin/books' || pathname?.startsWith('/admin/books/');

  // Auto-expand materials when we're in that section
  const [materialsExpanded, setMaterialsExpanded] = useState(isMaterialsSection);

  const isActive = (path) => pathname === path || pathname?.startsWith(path + '/');

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Sub-Admins',
      href: '/admin/sub-admins',
      icon: Users,
      adminOnly: true,
    },
    {
      name: 'Activity Logs',
      href: '/admin/logs',
      icon: ClipboardList,
      adminOnly: true,
    },
    {
      name: 'Academic Config',
      href: '/admin/settings',
      icon: Settings,
    },
    {
      name: 'Profile',
      href: '/admin/profile',
      icon: UserCircle,
    },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-neutral-900 text-white flex flex-col border-r border-neutral-700 z-50
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Brand with Close Button (Mobile) & Collapse (Desktop) */}
        <div className={`p-4 ${isCollapsed ? 'justify-center' : 'sm:p-6'} border-b border-neutral-700 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Image
              src="/esut logo.png"
              alt="ESUT Logo"
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain mx-auto"
            />
            <div className={`transition-opacity duration-300 ${isCollapsed ? 'hidden opacity-0 w-0' : 'block opacity-100'}`}>
              <h2 className="text-lg sm:text-xl font-bold whitespace-nowrap">ESUT Bookshop</h2>
              <p className="text-xs text-neutral-400">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Info */}
        <div className={`p-4 border-b border-neutral-700 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-semibold">
                {admin?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <p className="text-sm font-medium whitespace-nowrap">{admin?.username}</p>
              <p className="text-xs text-neutral-400 capitalize whitespace-nowrap">{admin?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 scrollbar-hide">
          {/* Dashboard */}
          <Link
            href="/admin/dashboard"
            onClick={handleNavClick}
            className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg transition-all duration-300 group relative ${isActive('/admin/dashboard')
                ? 'bg-primary text-white'
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            title={isCollapsed ? 'Dashboard' : ''}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className={`font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              Dashboard
            </span>
          </Link>

          {/* Materials - Expandable Section */}
          <div>
            {/* Materials Header (click to expand/collapse AND navigate) */}
            <button
              onClick={() => {
                if (isCollapsed) {
                  // When collapsed, just navigate to default
                  window.location.href = '/admin/books?category=textbook';
                  handleNavClick();
                } else {
                  setMaterialsExpanded(!materialsExpanded);
                }
              }}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg transition-all duration-300 group relative ${isMaterialsSection
                  ? 'bg-primary/20 text-white'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              title={isCollapsed ? 'Materials' : ''}
            >
              <Package className="w-5 h-5 shrink-0" />
              <span className={`font-medium transition-all duration-300 whitespace-nowrap overflow-hidden flex-1 text-left ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                Materials
              </span>
              {!isCollapsed && (
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${materialsExpanded ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Sub-pages */}
            {materialsExpanded && !isCollapsed && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-neutral-700 pl-3">
                {MATERIAL_SUBPAGES.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = isMaterialsSection && currentCategory === sub.category;
                  return (
                    <Link
                      key={sub.category}
                      href={`/admin/books?category=${encodeURIComponent(sub.category)}`}
                      onClick={handleNavClick}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${isSubActive
                          ? 'bg-primary text-white'
                          : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                        }`}
                    >
                      <SubIcon className="w-4 h-4 shrink-0" />
                      <span className="font-medium whitespace-nowrap">{sub.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rest of nav items */}
          {navItems.filter(item => item.name !== 'Dashboard').map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg transition-all duration-300 group relative ${active
                  ? 'bg-primary text-white'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={`font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-neutral-700">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-300 hover:bg-error hover:text-white transition-smooth w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              Logout
            </span>
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white rounded-full p-1 shadow-md z-50 items-center justify-center w-6 h-6 hover:bg-primary hover:border-primary transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}