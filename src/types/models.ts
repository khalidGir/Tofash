import type { UserRole, OrderStatus, FulfillmentType } from '@/lib/utils/constants';

export interface Profile {
  id: string;
  phone: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  seller_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  preparation_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  is_available: boolean;
  preparation_time_minutes: number | null;
  created_at: string;
  updated_at: string;
  store?: Store;
  category?: Category;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  store_id: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  total_amount: number;
  notes: string | null;
  scheduled_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer?: Profile;
  store?: Store;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  store_id: string;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  notes: string;
  store_name?: string;
}

export interface Cart {
  items: CartItem[];
  store_id: string | null;
  notes: string;
}

export interface Chat {
  id: string;
  order_id: string;
  customer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  order?: Order;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  order_id: string;
  customer_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  customer?: Profile;
}

export interface PaymentProof {
  id: string;
  order_id: string;
  image_url: string;
  note: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  store_name: string;
  id_document_url: string;
  social_links: Record<string, string>;
  payment_info: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}
