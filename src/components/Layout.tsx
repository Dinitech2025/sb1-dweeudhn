import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  CreditCard,
  Receipt,
  UserCircle,
  Tv,
  Package,
  Wrench,
  DollarSign,
  BarChart3,
  FileText,
  PlayCircle,
  Store,
  Settings as SettingsIcon,
  SwitchCamera
} from 'lucide-react';
import { NotificationCenter } from './notifications/NotificationCenter';
import { TaskCenter } from './tasks/TaskCenter';
import { Dashboard } from '@/pages/Dashboard';
import { Platforms } from '@/pages/Platforms';
import { Accounts } from '@/pages/Accounts';
import { Profiles } from '@/pages/Profiles';
import { Customers } from '@/pages/Customers';
import { Subscriptions } from '@/pages/Subscriptions';
import { Plans } from '@/pages/Plans';
import { Invoices } from '@/pages/Invoices';
import { Products } from '@/pages/Products';
import { Services } from '@/pages/Services';
import { Sales } from '@/pages/Sales';
import { Expenses } from '@/pages/Expenses';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Store as StorePage } from '@/pages/Store';
import { NavItem } from './nav/NavItem';
import { NavGroup } from './nav/NavGroup';
import { Button } from './ui/Button';

export const Layout = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Si on est en mode client, on affiche uniquement la page Store
  if (!isAdminMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-30">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-indigo-600">DINITECH</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsAdminMode(true)}
              className="flex items-center space-x-2"
            >
              <SwitchCamera size={16} />
              <span>Mode Admin</span>
            </Button>
          </div>
        </header>
        <main className="pt-14">
          <StorePage />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
            <h1 className="text-lg font-bold text-indigo-600">
              DINITECH
            </h1>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsAdminMode(false)}
              className="flex items-center space-x-2"
            >
              <Store size={16} />
              <span>Boutique</span>
            </Button>
          </div>

          <nav className="flex-1 px-2 py-2 space-y-2 overflow-y-auto">
            <NavItem
              to="/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              isActive={location.pathname === '/dashboard'}
            />

            <NavGroup 
              title="Streaming VOD" 
              icon={<Tv size={18} />}
              defaultOpen={['/platforms', '/accounts', '/profiles', '/plans', '/subscriptions'].includes(location.pathname)}
            >
              <NavItem
                to="/platforms"
                icon={<Monitor size={18} />}
                label="Plateformes"
                isActive={location.pathname === '/platforms'}
              />
              <NavItem
                to="/accounts"
                icon={<UserCircle size={18} />}
                label="Comptes"
                isActive={location.pathname === '/accounts'}
              />
              <NavItem
                to="/profiles"
                icon={<Users size={18} />}
                label="Profils"
                isActive={location.pathname === '/profiles'}
              />
              <NavItem
                to="/plans"
                icon={<PlayCircle size={18} />}
                label="Offres"
                isActive={location.pathname === '/plans'}
              />
              <NavItem
                to="/subscriptions"
                icon={<CreditCard size={18} />}
                label="Abonnements"
                isActive={location.pathname === '/subscriptions'}
              />
            </NavGroup>

            <NavGroup 
              title="Boutique" 
              icon={<Store size={18} />}
              defaultOpen={['/products', '/services', '/sales'].includes(location.pathname)}
            >
              <NavItem
                to="/products"
                icon={<Package size={18} />}
                label="Produits"
                isActive={location.pathname === '/products'}
              />
              <NavItem
                to="/services"
                icon={<Wrench size={18} />}
                label="Services"
                isActive={location.pathname === '/services'}
              />
              <NavItem
                to="/sales"
                icon={<DollarSign size={18} />}
                label="Ventes"
                isActive={location.pathname === '/sales'}
              />
            </NavGroup>

            <NavGroup 
              title="Finance" 
              icon={<Receipt size={18} />}
              defaultOpen={['/invoices', '/expenses'].includes(location.pathname)}
            >
              <NavItem
                to="/invoices"
                icon={<FileText size={18} />}
                label="Factures"
                isActive={location.pathname === '/invoices'}
              />
              <NavItem
                to="/expenses"
                icon={<Receipt size={18} />}
                label="Dépenses"
                isActive={location.pathname === '/expenses'}
              />
            </NavGroup>

            <NavGroup 
              title="Gestion" 
              icon={<BarChart3 size={18} />}
              defaultOpen={['/customers', '/reports'].includes(location.pathname)}
            >
              <NavItem
                to="/customers"
                icon={<Users size={18} />}
                label="Clients"
                isActive={location.pathname === '/customers'}
              />
              <NavItem
                to="/reports"
                icon={<BarChart3 size={18} />}
                label="Rapports"
                isActive={location.pathname === '/reports'}
              />
            </NavGroup>

            <NavGroup
              title="Paramètres"
              icon={<SettingsIcon size={18} />}
              defaultOpen={location.pathname === '/settings'}
            >
              <NavItem
                to="/settings"
                icon={<SettingsIcon size={18} />}
                label="Général"
                isActive={location.pathname === '/settings' && !location.search}
              />
              <NavItem
                to="/settings?tab=store"
                icon={<Store size={18} />}
                label="Boutique"
                isActive={location.search === '?tab=store'}
              />
              <NavItem
                to="/settings?tab=payment"
                icon={<CreditCard size={18} />}
                label="Paiement"
                isActive={location.search === '?tab=payment'}
              />
              <NavItem
                to="/settings?tab=shipping"
                icon={<Package size={18} />}
                label="Livraison"
                isActive={location.search === '?tab=shipping'}
              />
              <NavItem
                to="/settings?tab=categories"
                icon={<Package size={18} />}
                label="Catégories"
                isActive={location.search === '?tab=categories'}
              />
            </NavGroup>
          </nav>
        </div>
      </aside>

      <div className="ml-64">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-4">
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <TaskCenter />
          </div>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/platforms" element={<Platforms />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/products" element={<Products />} />
            <Route path="/services" element={<Services />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};