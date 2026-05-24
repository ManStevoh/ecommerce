export { httpJson, type HttpClientOptions } from './http/http-client';
export {
  BillingClient,
  createBillingClient,
  type BillingChargeRequest,
} from './billing/billing.client';
export {
  AiTicketClassifierClient,
  createAiTicketClassifierClient,
  type TicketClassification,
} from './ai/ticket-classifier.client';
export {
  ProductServiceClient,
  createProductServiceClient,
  type ProductRecord,
  type CreateProductInput,
} from './catalog/product-service.client';
export {
  OrderServiceClient,
  createOrderServiceClient,
  type OrderRecord,
  type OrderItemRecord,
} from './orders/order-service.client';
export {
  TenantServiceClient,
  createTenantServiceClient,
  type TenantRecord,
} from './tenants/tenant-service.client';
export {
  SubscriptionServiceClient,
  createSubscriptionServiceClient,
  type PlatformSubscriptionStats,
} from './subscriptions/subscription-service.client';
export {
  NotificationServiceClient,
  createNotificationServiceClient,
  type SendNotificationInput,
  type SendNotificationResult,
} from './notifications/notification-service.client';
