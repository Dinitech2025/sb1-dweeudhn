import { supabase } from './supabase';

export async function seedData() {
  // Add platforms
  const { data: platforms } = await supabase
    .from('platforms')
    .insert([
      { name: 'Netflix', max_profiles: 5 },
      { name: 'Prime Video', max_profiles: 4 },
      { name: 'Disney+', max_profiles: 4 }
    ])
    .select();

  if (!platforms) return;

  // Add accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .insert([
      {
        platform_id: platforms[0].id,
        account_email: 'netflix1@example.com',
        password: 'password123',
        name: 'Netflix Account 1',
        expiration_date: '2024-12-31',
        is_active: true,
        max_profiles: 5
      },
      {
        platform_id: platforms[1].id,
        account_email: 'prime1@example.com',
        password: 'password123',
        name: 'Prime Account 1',
        expiration_date: '2024-12-31',
        is_active: true,
        max_profiles: 4
      }
    ])
    .select();

  if (!accounts) return;

  // Add profiles
  await supabase
    .from('profiles')
    .insert([
      {
        account_id: accounts[0].id,
        profile_name: 'Netflix Profile 1',
        is_available: true
      },
      {
        account_id: accounts[0].id,
        profile_name: 'Netflix Profile 2',
        is_available: true
      },
      {
        account_id: accounts[1].id,
        profile_name: 'Prime Profile 1',
        is_available: true
      }
    ]);

  // Add customers
  const { data: customers } = await supabase
    .from('customers')
    .insert([
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+261 34 12 345 67',
        contact_channel: 'facebook_sb'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+261 33 12 345 67',
        contact_channel: 'whatsapp_yas'
      }
    ])
    .select();

  if (!customers) return;

  // Add subscription plans
  const { data: plans } = await supabase
    .from('subscription_plans')
    .insert([
      {
        platform_id: platforms[0].id,
        name: 'Netflix Basic',
        profiles_count: 1,
        price_ar: 15000,
        duration_months: 1
      },
      {
        platform_id: platforms[0].id,
        name: 'Netflix Standard',
        profiles_count: 2,
        price_ar: 25000,
        duration_months: 1
      },
      {
        platform_id: platforms[1].id,
        name: 'Prime Basic',
        profiles_count: 1,
        price_ar: 12000,
        duration_months: 1
      }
    ])
    .select();

  // Add products
  const { data: products } = await supabase
    .from('products')
    .insert([
      {
        name: 'Clé USB 32GB',
        description: 'Clé USB haute vitesse 32GB',
        price: 45000,
        stock: 20
      },
      {
        name: 'Câble HDMI 2m',
        description: 'Câble HDMI haute qualité 2 mètres',
        price: 25000,
        stock: 15
      },
      {
        name: 'Souris sans fil',
        description: 'Souris optique sans fil',
        price: 35000,
        stock: 10
      },
      {
        name: 'Chargeur universel',
        description: 'Chargeur compatible multi-appareils',
        price: 30000,
        stock: 25
      }
    ])
    .select();

  // Add services
  const { data: services } = await supabase
    .from('services')
    .insert([
      {
        name: 'Configuration Netflix',
        description: 'Configuration complète de compte Netflix',
        price: 10000,
        duration_minutes: 30
      },
      {
        name: 'Installation Disney+',
        description: 'Installation et configuration Disney+',
        price: 10000,
        duration_minutes: 30
      },
      {
        name: 'Support technique',
        description: 'Assistance technique générale',
        price: 20000,
        duration_minutes: 60
      },
      {
        name: 'Formation streaming',
        description: 'Formation sur l\'utilisation des services de streaming',
        price: 25000,
        duration_minutes: 45
      }
    ])
    .select();

  // Add expenses
  await supabase
    .from('expenses')
    .insert([
      {
        description: 'Achat fournitures bureau',
        amount: 150000,
        category: 'Équipement',
        date: new Date().toISOString().split('T')[0]
      },
      {
        description: 'Facture Internet',
        amount: 200000,
        category: 'Internet',
        date: new Date().toISOString().split('T')[0]
      },
      {
        description: 'Location bureau',
        amount: 500000,
        category: 'Loyer',
        date: new Date().toISOString().split('T')[0]
      }
    ]);

  // Add some sales
  if (customers && products && services) {
    const { data: sale } = await supabase
      .from('sales')
      .insert([
        {
          customer_id: customers[0].id,
          total_amount: 80000,
          date: new Date().toISOString().split('T')[0],
          status: 'completed'
        }
      ])
      .select()
      .single();

    if (sale && products[0] && services[0]) {
      await supabase
        .from('sale_items')
        .insert([
          {
            sale_id: sale.id,
            product_id: products[0].id,
            service_id: null,
            quantity: 1,
            unit_price: products[0].price,
            total_price: products[0].price
          },
          {
            sale_id: sale.id,
            product_id: null,
            service_id: services[0].id,
            quantity: 1,
            unit_price: services[0].price,
            total_price: services[0].price
          }
        ]);
    }
  }
}
