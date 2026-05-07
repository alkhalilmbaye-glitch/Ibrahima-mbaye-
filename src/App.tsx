import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Wallet,
  Bell
} from 'lucide-react';
import { cn } from './lib/utils';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import { useSettings } from './hooks/useSettings';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const POS = React.lazy(() => import('./pages/POS'));
const Products = React.lazy(() => import('./pages/Products'));
const Clients = React.lazy(() => import('./pages/Clients'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Expenses = React.lazy(() => import('./pages/Expenses'));
const SettingsPage = React.lazy(() => import('./pages/Settings'));
const Login = React.lazy(() => import('./pages/Login'));

interface NavItemProps {
  key?: string;
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function NavItem({ to, icon, label, active, onClick }: NavItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent",
        active 
          ? "bg-accent/10 text-accent border-accent/20 font-semibold" 
          : "text-gray-500 hover:bg-gray-100 hover:text-primary"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
    </Link>
  );
}

function Layout({ children, user }: { children: React.ReactNode, user: User | null }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useSettings();

  const navigation = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Tableau de bord" },
    { to: "/pos", icon: <ShoppingCart size={20} />, label: "Caisse" },
    { to: "/products", icon: <Package size={20} />, label: "Produits" },
    { to: "/clients", icon: <Users size={20} />, label: "Clients" },
    { to: "/expenses", icon: <Wallet size={20} />, label: "Dépenses" },
    { to: "/reports", icon: <BarChart3 size={20} />, label: "Rapports" },
    { to: "/settings", icon: <Settings size={20} />, label: "Paramètres" },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {settings.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="font-bold text-primary leading-tight text-sm uppercase tracking-wider">{settings.name}</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Boutique</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname === item.to}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-gray-100">
            <button 
              onClick={() => auth.signOut()}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-primary">
              {navigation.find(n => n.to === location.pathname)?.label || "Application"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             <button className="p-2 text-gray-400 hover:text-primary transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user.displayName || 'Utilisateur'}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="avatar" 
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            {children}
          </React.Suspense>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-primary gap-4">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white font-medium animate-pulse tracking-widest uppercase text-xs">AL KHALIL</p>
      </div>
    );
  }

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Login />} />
          <Route path="/pos" element={user ? <POS /> : <Login />} />
          <Route path="/products" element={user ? <Products /> : <Login />} />
          <Route path="/clients" element={user ? <Clients /> : <Login />} />
          <Route path="/expenses" element={user ? <Expenses /> : <Login />} />
          <Route path="/reports" element={user ? <Reports /> : <Login />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Login />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </Router>
  );
}
