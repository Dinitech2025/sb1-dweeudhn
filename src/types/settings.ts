export interface AppSettings {
  id: string;
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  shipping_fee: number;
  min_order_amount: number;
  max_order_amount: number;
  order_prefix: string;
  invoice_prefix: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
  payment_methods: {
    cash: boolean;
    mobile_money: boolean;
    bank_transfer: boolean;
  };
  mobile_money_numbers: {
    orange: string[];
    airtel: string[];
    telma: string[];
  };
  bank_accounts: {
    bank_name: string;
    account_name: string;
    account_number: string;
  }[];
  business_hours: {
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }[];
  maintenance_mode: boolean;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  store_description: string;
  store_logo_url: string | null;
  store_banner_url: string | null;
  store_email: string | null;
  store_phone: string | null;
  store_address: string | null;
  store_enabled: boolean;
  allow_guest_checkout: boolean;
  show_out_of_stock: boolean;
  low_stock_threshold: number;
  shipping_zones: ShippingZone[];
  product_categories: ProductCategory[];
  seo_settings: SeoSettings;
  social_links: SocialLinks;
}

export interface ShippingZone {
  name: string;
  fee: number;
  min_delivery_days: number;
  max_delivery_days: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

export interface SeoSettings {
  title: string;
  description: string;
  keywords: string[];
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  whatsapp: string;
}
