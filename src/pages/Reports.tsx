import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, ShoppingCart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const Reports = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<{ category: string; total: number }[]>([]);
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    new: 0,
    active: 0
  });

  useEffect(() => {
    fetchReports();
  }, [period, startDate, endDate]);

  const fetchReports = async () => {
    setLoading(true);

    // Fetch sales and subscription data
    const [salesData, subscriptionsData, expensesData, customersData] = await Promise.all([
      // Sales data
      supabase.rpc('get_sales_report', {
        start_date: startDate,
        end_date: endDate,
        report_type: period
      }),

      // Subscription data
      supabase
        .from('subscriptions')
        .select(`
          created_at,
          plan:subscription_plans(price_ar)
        `)
        .eq('status', 'active')
        .gte('start_date', startDate)
        .lte('start_date', endDate),

      // Expenses data
      supabase
        .from('expenses')
        .select('category, amount, date')
        .gte('date', startDate)
        .lte('date', endDate),

      // Customer data
      supabase
        .from('customers')
        .select('created_at')
    ]);

    if (salesData.error) console.error('Error fetching sales:', salesData.error);
    if (subscriptionsData.error) console.error('Error fetching subscriptions:', subscriptionsData.error);
    if (expensesData.error) console.error('Error fetching expenses:', expensesData.error);
    if (customersData.error) console.error('Error fetching customers:', customersData.error);

    // Process revenue data
    const combinedRevenueData = salesData.data?.map((sale: any) => {
      const periodSubscriptions = subscriptionsData.data?.filter(sub => 
        format(parseISO(sub.created_at), 'yyyy-MM-dd') === sale.period
      );
      
      const subscriptionRevenue = periodSubscriptions?.reduce(
        (sum: number, sub: any) => sum + (sub.plan?.price_ar || 0),
        0
      ) || 0;

      return {
        period: sale.period,
        sales: Number(sale.total_revenue),
        subscriptions: subscriptionRevenue,
        total: Number(sale.total_revenue) + subscriptionRevenue
      };
    }) || [];

    setRevenueData(combinedRevenueData);

    // Process expenses data
    const expensesByCategory = expensesData.data?.reduce((acc: any[], expense: any) => {
      const existing = acc.find(item => item.category === expense.category);
      if (existing) {
        existing.total += expense.amount;
      } else {
        acc.push({ category: expense.category, total: expense.amount });
      }
      return acc;
    }, []).sort((a: any, b: any) => b.total - a.total) || [];

    setExpensesByCategory(expensesByCategory);

    // Process customer stats
    const totalCustomers = customersData.data?.length || 0;
    const newCustomers = customersData.data?.filter((customer: any) => 
      parseISO(customer.created_at) >= parseISO(startDate)
    ).length || 0;
    const activeCustomers = subscriptionsData.data?.length || 0;

    setCustomerStats({
      total: totalCustomers,
      new: newCustomers,
      active: activeCustomers
    });

    setLoading(false);
  };

  const handlePeriodChange = (newPeriod: 'daily' | 'weekly' | 'monthly') => {
    setPeriod(newPeriod);
    
    const today = new Date();
    if (newPeriod === 'daily') {
      setStartDate(format(subDays(today, 30), 'yyyy-MM-dd'));
    } else if (newPeriod === 'weekly') {
      setStartDate(format(subDays(today, 90), 'yyyy-MM-dd'));
    } else {
      setStartDate(format(startOfMonth(subDays(today, 180)), 'yyyy-MM-dd'));
    }
    setEndDate(format(today, 'yyyy-MM-dd'));
  };

  // Calculate totals
  const totalRevenue = revenueData.reduce((sum, data) => sum + data.total, 0);
  const totalSales = revenueData.reduce((sum, data) => sum + data.sales, 0);
  const totalSubscriptions = revenueData.reduce((sum, data) => sum + data.subscriptions, 0);
  const totalExpenses = expensesByCategory.reduce((sum, category) => sum + category.total, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Chart data
  const revenueChartData = {
    labels: revenueData.map(data => data.period),
    datasets: [
      {
        label: 'Ventes',
        data: revenueData.map(data => data.sales),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Abonnements',
        data: revenueData.map(data => data.subscriptions),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      }
    ]
  };

  const expensesChartData = {
    labels: expensesByCategory.map(cat => cat.category),
    datasets: [{
      data: expensesByCategory.map(cat => cat.total),
      backgroundColor: [
        'rgba(239, 68, 68, 0.5)',
        'rgba(245, 158, 11, 0.5)',
        'rgba(16, 185, 129, 0.5)',
        'rgba(59, 130, 246, 0.5)',
        'rgba(139, 92, 246, 0.5)',
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(245, 158, 11)',
        'rgb(16, 185, 129)',
        'rgb(59, 130, 246)',
        'rgb(139, 92, 246)',
      ],
      borderWidth: 1
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Analytique</h1>
          <p className="text-sm text-gray-500">
            Période: {format(parseISO(startDate), 'PP', { locale: fr })} - {format(parseISO(endDate), 'PP', { locale: fr })}
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="daily">Quotidien</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuel</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalRevenue.toLocaleString()} Ar
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Ventes: {totalSales.toLocaleString()} Ar</p>
                  <p>Abonnements: {totalSubscriptions.toLocaleString()} Ar</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Bénéfice Net</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {netProfit.toLocaleString()} Ar
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Marge: {profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                {netProfit >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {customerStats.total}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Nouveaux: +{customerStats.new}</p>
                  <p>Actifs: {customerStats.active}</p>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Dépenses</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalExpenses.toLocaleString()} Ar
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {expensesByCategory.length} catégories
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Évolution des Revenus</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <Bar
              data={revenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: true,
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Expenses Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Répartition des Dépenses</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <Doughnut
                data={expensesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Analyse des Performances</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Répartition des Revenus</h3>
                <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${(totalSales / totalRevenue) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-sm">
                  <span>Ventes: {((totalSales / totalRevenue) * 100).toFixed(1)}%</span>
                  <span>Abonnements: {((totalSubscriptions / totalRevenue) * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Taux d'Engagement Client</h3>
                <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full"
                    style={{ width: `${(customerStats.active / customerStats.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-sm">
                  <span>Clients Actifs: {customerStats.active}</span>
                  <span>{((customerStats.active / customerStats.total) * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Marge Bénéficiaire</h3>
                <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${profitMargin >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.abs(profitMargin)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-sm">
                  <span>Marge: {profitMargin.toFixed(1)}%</span>
                  <span>{netProfit.toLocaleString()} Ar</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
