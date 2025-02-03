import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { seedData } from '../lib/seed-data';
import { format, subDays } from 'date-fns';
import {
  TrendingUp,
  Users,
  Monitor,
  AlertCircle,
  DollarSign,
  Package,
  Wrench,
  Receipt
} from 'lucide-react';

interface DashboardStats {
  activeSubscriptions: number;
  totalCustomers: number;
  availableProfiles: number;
  expiringAccounts: number;
  totalRevenue: number;
  totalExpenses: number;
  productsSold: number;
  servicesDelivered: number;
}

interface RevenueByPeriod {
  period: string;
  subscriptions: number;
  sales: number;
  total: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeSubscriptions: 0,
    totalCustomers: 0,
    availableProfiles: 0,
    expiringAccounts: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    productsSold: 0,
    servicesDelivered: 0
  });
  const [revenueData, setRevenueData] = useState<RevenueByPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    fetchStats();
    fetchRevenueData();
  }, [period]);

  const fetchStats = async () => {
    // Fetch active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    // Fetch total customers
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact' });

    // Fetch available profiles
    const { count: availableProfiles } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('is_available', true);

    // Fetch expiring accounts
    const { data: expiringAccounts } = await supabase
      .rpc('get_expiring_accounts', { days_threshold: 7 });

    // Fetch total revenue from sales
    const { data: salesRevenue } = await supabase
      .from('sales')
      .select('total_amount')
      .eq('status', 'completed');

    // Fetch total revenue from subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(price_ar)
      `)
      .eq('status', 'active');

    const subscriptionRevenue = subscriptions?.reduce(
      (sum, sub) => sum + (sub.plan?.price_ar || 0),
      0
    ) || 0;

    // Fetch total expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount');

    // Fetch products sold
    const { data: saleItems } = await supabase
      .from('sale_items')
      .select('quantity')
      .not('product_id', 'is', null);

    const productsSold = saleItems?.reduce(
      (sum, item) => sum + item.quantity,
      0
    ) || 0;

    // Fetch services delivered
    const { count: servicesDelivered } = await supabase
      .from('sale_items')
      .select('*', { count: 'exact' })
      .not('service_id', 'is', null);

    setStats({
      activeSubscriptions: activeSubscriptions || 0,
      totalCustomers: totalCustomers || 0,
      availableProfiles: availableProfiles || 0,
      expiringAccounts: expiringAccounts?.length || 0,
      totalRevenue: (salesRevenue?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0) + subscriptionRevenue,
      totalExpenses: expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0,
      productsSold,
      servicesDelivered: servicesDelivered || 0
    });

    setLoading(false);
  };

  const fetchRevenueData = async () => {
    const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const endDate = format(new Date(), 'yyyy-MM-dd');

    // Fetch sales data
    const { data: salesData } = await supabase
      .rpc('get_sales_report', {
        start_date: startDate,
        end_date: endDate,
        report_type: period
      });

    // Fetch subscription data
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select(`
        created_at,
        plan:subscription_plans(price_ar)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'active');

    // Combine and format data
    const revenueByPeriod = salesData?.map((sale: any) => {
      const subscriptionsInPeriod = subscriptionData?.filter(sub => {
        const subDate = format(new Date(sub.created_at), 'yyyy-MM-dd');
        return subDate === sale.period;
      });

      const subscriptionRevenue = subscriptionsInPeriod?.reduce(
        (sum, sub) => sum + (sub.plan?.price_ar || 0),
        0
      ) || 0;

      return {
        period: sale.period,
        subscriptions: subscriptionRevenue,
        sales: sale.total_revenue,
        total: sale.total_revenue + subscriptionRevenue
      };
    }) || [];

    setRevenueData(revenueByPeriod);
  };

  const netProfit = stats.totalRevenue - stats.totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-sm text-gray-500">
            Vue d'ensemble de votre activité
          </p>
        </div>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => seedData()}
          >
            Ajouter des Données de Test
          </Button>
        </div>
      </div>

      {/* Statistiques Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Chiffre d'Affaires"
          value={`${stats.totalRevenue.toLocaleString()} Ar`}
          icon={<DollarSign className="text-green-500" />}
          color="bg-green-50"
        />
        <StatCard
          title="Dépenses"
          value={`${stats.totalExpenses.toLocaleString()} Ar`}
          icon={<Receipt className="text-red-500" />}
          color="bg-red-50"
        />
        <StatCard
          title="Bénéfice Net"
          value={`${netProfit.toLocaleString()} Ar`}
          icon={<TrendingUp className={netProfit >= 0 ? 'text-green-500' : 'text-red-500'} />}
          color={netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}
        />
        <StatCard
          title="Clients"
          value={stats.totalCustomers}
          icon={<Users className="text-blue-500" />}
          color="bg-blue-50"
        />
      </div>

      {/* Statistiques Secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Abonnements Actifs"
          value={stats.activeSubscriptions}
          icon={<Monitor className="text-indigo-500" />}
          color="bg-indigo-50"
        />
        <StatCard
          title="Profils Disponibles"
          value={stats.availableProfiles}
          icon={<Users className="text-purple-500" />}
          color="bg-purple-50"
        />
        <StatCard
          title="Produits Vendus"
          value={stats.productsSold}
          icon={<Package className="text-orange-500" />}
          color="bg-orange-50"
        />
        <StatCard
          title="Services Délivrés"
          value={stats.servicesDelivered}
          icon={<Wrench className="text-cyan-500" />}
          color="bg-cyan-50"
        />
      </div>

      {/* Alertes */}
      {stats.expiringAccounts > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <p className="ml-3 text-sm text-yellow-700">
              {stats.expiringAccounts} compte(s) arrivent à expiration dans les 7 prochains jours
            </p>
          </div>
        </div>
      )}

      {/* Graphique des Revenus */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Évolution des Revenus
            </h2>
            <div className="flex space-x-2">
              <Button
                variant={period === 'daily' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPeriod('daily')}
              >
                Jour
              </Button>
              <Button
                variant={period === 'weekly' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPeriod('weekly')}
              >
                Semaine
              </Button>
              <Button
                variant={period === 'monthly' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPeriod('monthly')}
              >
                Mois
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnements
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData.map((data, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {data.subscriptions.toLocaleString()} Ar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {data.sales.toLocaleString()} Ar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {data.total.toLocaleString()} Ar
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className={`${color} p-6 rounded-lg border border-gray-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-white">{icon}</div>
    </div>
  </div>
);
