import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Store } from '@/pages/Store';
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
import { Users } from '@/pages/Users';

export const Routes = () => {
  return (
    <RouterRoutes>
      {/* Routes publiques */}
      <Route path="/" element={<Store />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes admin protégées */}
      <Route path="/admin" element={
        <AuthGuard>
          <Layout />
        </AuthGuard>
      }>
        <Route index element={<Dashboard />} />
        
        {/* Routes admin uniquement */}
        <Route path="platforms" element={
          <AuthGuard requireAdmin>
            <Platforms />
          </AuthGuard>
        } />
        <Route path="accounts" element={
          <AuthGuard requireAdmin>
            <Accounts />
          </AuthGuard>
        } />
        <Route path="profiles" element={
          <AuthGuard requireAdmin>
            <Profiles />
          </AuthGuard>
        } />
        <Route path="plans" element={
          <AuthGuard requireAdmin>
            <Plans />
          </AuthGuard>
        } />
        <Route path="users" element={
          <AuthGuard requireAdmin>
            <Users />
          </AuthGuard>
        } />
        <Route path="settings" element={
          <AuthGuard requireAdmin>
            <Settings />
          </AuthGuard>
        } />

        {/* Routes staff */}
        <Route path="customers" element={
          <AuthGuard requireStaff>
            <Customers />
          </AuthGuard>
        } />
        <Route path="subscriptions" element={
          <AuthGuard requireStaff>
            <Subscriptions />
          </AuthGuard>
        } />
        <Route path="products" element={
          <AuthGuard requireStaff>
            <Products />
          </AuthGuard>
        } />
        <Route path="services" element={
          <AuthGuard requireStaff>
            <Services />
          </AuthGuard>
        } />
        <Route path="sales" element={
          <AuthGuard requireStaff>
            <Sales />
          </AuthGuard>
        } />
        <Route path="expenses" element={
          <AuthGuard requireStaff>
            <Expenses />
          </AuthGuard>
        } />
        <Route path="reports" element={
          <AuthGuard requireStaff>
            <Reports />
          </AuthGuard>
        } />
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
};
