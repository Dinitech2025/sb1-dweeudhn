export interface StoreSettings {
  id: string;
  store_name: string;
  store_description: string;
  store_enabled: boolean;
  store_logo_url: string | null;
  store_banner_url: string | null;
  store_email: string | null;
  store_phone: string | null;
  store_address: string | null;
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

export interface CartItem extends Product {
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  created_at: string;
}