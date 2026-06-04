export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PENDING_VERIFICATION: 'pending_verification',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING_PAYMENT]: 'Pending Payment',
  [ORDER_STATUS.PENDING_VERIFICATION]: 'Pending Verification',
  [ORDER_STATUS.ACCEPTED]: 'Accepted',
  [ORDER_STATUS.REJECTED]: 'Rejected',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.EXPIRED]: 'Expired',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING_PAYMENT]: 'warm',
  [ORDER_STATUS.PENDING_VERIFICATION]: 'warm',
  [ORDER_STATUS.ACCEPTED]: 'blue',
  [ORDER_STATUS.REJECTED]: 'red',
  [ORDER_STATUS.COMPLETED]: 'green',
  [ORDER_STATUS.CANCELLED]: 'gray',
  [ORDER_STATUS.EXPIRED]: 'gray',
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  LOGIN: '/login',
  REGISTER: '/register',
  CART: '/cart',
  CHECKOUT: '/checkout',
  CUSTOMER: {
    ORDERS: '/customer/orders',
    FAVORITES: '/customer/favorites',
    CHAT: '/customer/chat',
  },
  SELLER: {
    DASHBOARD: '/seller/dashboard',
    ORDERS: '/seller/orders',
    PRODUCTS: '/seller/products',
    SETTINGS: '/seller/settings',
    CHAT: '/seller/chat',
  },
  ADMIN: {
    SELLERS: '/admin/sellers',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    DISPUTES: '/admin/disputes',
    ANALYTICS: '/admin/analytics',
  },
} as const;

export const FULFILLMENT_TYPES = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
} as const;

export type FulfillmentType = (typeof FULFILLMENT_TYPES)[keyof typeof FULFILLMENT_TYPES];

export const SUPABASE_STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product_images',
  PAYMENT_PROOFS: 'payment_proofs',
  AVATARS: 'avatars',
  SELLER_DOCUMENTS: 'seller_documents',
} as const;
