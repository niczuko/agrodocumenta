
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Glass } from '@/components/ui/Glass';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type NavLinkProps = {
  to: string;
  label: string;
  icon: string;
  isActive: boolean;
};

const NavLink = ({ to, label, icon, isActive }: NavLinkProps) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300",
      isActive 
        ? "bg-primary text-primary-foreground"
        : "hover:bg-mono-200/50"
    )}
  >
    <i className={`${icon} w-5`}></i>
    <span>{label}</span>
  </Link>
);

const ThemeSelector = () => {
  const { accentColor, setAccentColor } = useTheme();
  
  const themeOptions = [
    { value: 'green' as const, label: 'Verde', color: '#588157' },
    { value: 'blue' as const, label: 'Azul', color: '#457b9d' },
    { value: 'brown' as const, label: 'Marrom', color: '#6c584c' }
  ];
  
  return (
    <div className="mt-4 px-4">
      <p className="text-mono-500 text-sm mb-2">Tema</p>
      <div className="flex gap-2">
        {themeOptions.map((option) => (
          <button 
            key={option.value}
            onClick={() => setAccentColor(option.value)}
            className={cn(
              "w-8 h-8 rounded-full transition-all duration-300",
              accentColor === option.value 
                ? "ring-2 ring-mono-300 scale-110" 
                : "hover:scale-105"
            )}
            style={{ backgroundColor: option.color }}
            title={option.label}
          />
        ))}
      </div>
    </div>
  );
};

export function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "fa-solid fa-gauge-high" },
    { to: "/fazendas", label: "Fazendas", icon: "fa-solid fa-wheat-awn" },
    { to: "/talhoes", label: "Talhões", icon: "fa-solid fa-layer-group" },
    { to: "/maquinarios", label: "Maquinários", icon: "fa-solid fa-tractor" },
    { to: "/trabalhadores", label: "Trabalhadores", icon: "fa-solid fa-users" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  // Navbar para dispositivos móveis - com fundo claro
  const mobileNav = (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-subtle"
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
      </button>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-mono-900/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-sm border-r border-mono-200 p-4 animate-slide-in shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="mb-6 mt-10">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <i className="fa-solid fa-seedling text-primary text-xl"></i>
                  <h1 className="text-xl font-semibold text-mono-900">AgroTerra</h1>
                </Link>
              </div>
              
              <nav className="flex-1">
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        label={link.label}
                        icon={link.icon}
                        isActive={isActive(link.to)}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
              
              <div className="mt-auto">
                <ThemeSelector />
                <div className="mt-4 border-t border-mono-200 pt-4">
                  <Link
                    to="/perfil"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-mono-100 rounded-lg text-mono-800"
                  >
                    <i className="fa-solid fa-user-circle"></i>
                    <span>Perfil</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 w-full text-left hover:bg-mono-100 rounded-lg mt-2"
                  >
                    <i className="fa-solid fa-sign-out-alt"></i>
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Navbar para desktop
  const desktopNav = (
    <div className="hidden lg:block fixed inset-y-0 left-0 w-64">
      <Glass
        variant="light"
        intensity="high"
        className="h-full flex flex-col p-6"
      >
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <i className="fa-solid fa-seedling text-primary text-xl"></i>
            <h1 className="text-xl font-semibold">AgroTerra</h1>
          </Link>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  label={link.label}
                  icon={link.icon}
                  isActive={isActive(link.to)}
                />
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto">
          <ThemeSelector />
          <div className="mt-4 border-t border-mono-200 pt-4">
            <Link
              to="/perfil"
              className="flex items-center gap-2 px-4 py-2 hover:bg-mono-100 rounded-lg"
            >
              <i className="fa-solid fa-user-circle"></i>
              <span>Perfil</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-red-600 w-full text-left hover:bg-mono-100 rounded-lg mt-2"
            >
              <i className="fa-solid fa-sign-out-alt"></i>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </Glass>
    </div>
  );

  return (
    <>
      {mobileNav}
      {desktopNav}
    </>
  );
}
