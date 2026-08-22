/** Shared contracts for every delivery and payment integration. */

// ─── DELIVERY ─────────────────────────────────────────────────────────────

export type DeliveryOperator = 'kaspi' | 'cdek' | 'kazpost';
export type DeliveryKind = 'pvz' | 'postamat' | 'courier' | 'express';

export interface DeliveryCity {
  id: string;
  name: string;
  region: string;
  country: string;
  /** Each carrier numbers cities its own way. */
  operatorCityId?: Partial<Record<DeliveryOperator, string>>;
}

export interface DeliveryPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'pvz' | 'postamat' | 'courier';
  operator: DeliveryOperator;
  workHours?: string;
  phone?: string;
}

export interface DeliveryTariff {
  id: string;
  name: { ru: string; kz: string };
  operator: DeliveryOperator;
  type: DeliveryKind;
  /** Kazakhstani tenge. */
  price: number;
  priceMin?: number;
  priceMax?: number;
  daysMin: number;
  daysMax: number;
  daysLabel: string;
  isFree?: boolean;
  /** Free once the order total reaches this amount. */
  freeFrom?: number;
}

export interface DeliveryCalculateParams {
  /** Our warehouse. */
  fromCity: string;
  toCity: string;
  /** Kilograms. */
  weight: number;
  /** Centimetres. */
  length: number;
  width: number;
  height: number;
  /** Order total in tenge. */
  declaredValue: number;
}

export interface DeliveryOrder {
  orderId: string;
  trackNumber: string;
  operator: DeliveryOperator;
  status: string;
  estimatedDelivery: string;
}

// ─── PAYMENT ──────────────────────────────────────────────────────────────

export type PaymentState = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PaymentCreateParams {
  orderId: string;
  amount: number;
  currency: 'KZT';
  description: string;
  customerEmail?: string;
  customerPhone: string;
  returnUrl: string;
  failUrl: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  /** Send the customer here to pay. */
  redirectUrl?: string;
  status: Exclude<PaymentState, 'refunded'>;
  error?: string;
  /** True when the response came from a stub rather than the live gateway. */
  stubbed?: boolean;
}

export interface PaymentStatus {
  paymentId: string;
  orderId: string;
  status: PaymentState;
  amount: number;
  paidAt?: string;
}

// ─── ORDER ────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  flavor?: string;
  strength?: string;
}

export interface CustomerInfo {
  name: string;
  lastName?: string;
  phone: string;
  email?: string;
  telegram?: string;
}

export interface DeliveryInfo {
  operator: DeliveryOperator;
  method: string;
  city: string;
  address?: string;
  pointId?: string;
  price: number;
  trackNumber?: string;
}

export interface PaymentInfo {
  method: 'freedom_pay' | 'kaspi_pay' | 'manual';
  status: Exclude<PaymentState, 'refunded'>;
  transactionId?: string;
  paidAt?: string;
}

export interface OrderTotals {
  items: number;
  delivery: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  payment: PaymentInfo;
  totals: OrderTotals;
}
