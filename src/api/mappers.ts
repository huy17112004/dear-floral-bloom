import type { AvailableOrder, CustomerAddress, CustomOrder, Product, ProductCategory } from '@/types';
import type { AvailableOrderResponse } from '@/api/availableOrderApi';
import type { AddressResponse } from '@/api/meApi';
import type { CategoryResponse } from '@/api/categoryApi';
import type { CustomOrderResponse } from '@/api/customOrderApi';
import type { ProductResponse } from '@/api/productApi';
import { resolveImageUrl } from '@/lib/image';

function toLowerSnake(value?: string): string {
  return (value ?? '').toLowerCase();
}

export function mapCategory(response: CategoryResponse): ProductCategory {
  return {
    id: String(response.categoryId),
    name: response.name,
    description: response.description,
    status: response.status?.toLowerCase() === 'active' ? 'active' : 'inactive',
  };
}

export function mapProduct(response: ProductResponse): Product {
  const productKind = toLowerSnake(response.productKind) as Product['productKind'];
  const status = response.status?.toLowerCase() === 'active' ? 'active' : 'inactive';

  return {
    id: String(response.productId),
    categoryId: String(response.categoryId),
    category: response.categoryName
      ? {
          id: String(response.categoryId),
          name: response.categoryName,
          status: 'active',
        }
      : undefined,
    name: response.name,
    slug: response.slug ?? '',
    description: response.description ?? '',
    price: Number(response.price ?? 0),
    productKind,
    isSellableDirectly: !!response.isSellableDirectly,
    isCustomSelectable: !!response.isCustomSelectable,
    imageUrl: resolveImageUrl(response.imageUrl),
    size: response.size ?? undefined,
    material: response.material ?? undefined,
    flowerType: response.flowerType ?? undefined,
    status,
    createdAt: '',
    updatedAt: '',
  };
}

export function mapAddress(response: AddressResponse): CustomerAddress {
  return {
    id: String(response.addressId),
    customerUserId: '',
    receiverName: response.receiverName,
    receiverPhone: response.receiverPhone,
    addressLine: response.addressLine,
    ward: response.ward,
    district: response.district,
    province: response.province,
    isDefault: !!response.isDefault,
    note: response.note,
    createdAt: '',
    updatedAt: '',
  };
}

export function mapCustomOrder(response: CustomOrderResponse): CustomOrder {
  return {
    id: String(response.id),
    orderCode: response.orderCode,
    customerUserId: '',
    shippingAddressId: '',
    selectedFrameProductId: String(response.selectedFrameProductId),
    selectedFrame: response.selectedFrameName
      ? {
          id: String(response.selectedFrameProductId),
          categoryId: '',
          name: response.selectedFrameName,
          slug: '',
          description: '',
          price: 0,
          productKind: 'frame_option',
          isSellableDirectly: false,
          isCustomSelectable: true,
          imageUrl: '/placeholder.svg',
          status: 'active',
          createdAt: '',
          updatedAt: '',
        }
      : undefined,
    orderStatus: toLowerSnake(response.orderStatus) as CustomOrder['orderStatus'],
    paymentStatus: toLowerSnake(response.paymentStatus) as CustomOrder['paymentStatus'],
    depositAmount: Number(response.depositAmount ?? 0),
    remainingAmount: Number(response.remainingAmount ?? 0),
    totalAmount: Number(response.totalAmount ?? 0),
    flowerType: response.flowerType,
    personalizationContent: response.personalizationContent ?? '',
    requestedDeliveryDate: response.requestedDeliveryDate,
    flowerInputImageUrl: response.flowerInputImageUrl,
    flowerEvaluationStatus: toLowerSnake(response.flowerEvaluationStatus) as CustomOrder['flowerEvaluationStatus'],
    flowerEvaluationNote: response.flowerEvaluationNote ?? undefined,
    demoRevisionCount: response.demoRevisionCount ?? 0,
    extraRevisionFeeRate: response.extraRevisionFeeRate ?? undefined,
    orderedAt: response.orderedAt ?? '',
  };
}

export function mapAvailableOrder(response: AvailableOrderResponse): AvailableOrder {
  const paymentStatusRaw = toLowerSnake(response.paymentStatus);
  const paymentStatus: AvailableOrder['paymentStatus'] = paymentStatusRaw === 'paid'
    ? 'paid'
    : paymentStatusRaw === 'partially_paid'
      ? 'partial'
      : paymentStatusRaw === 'refunded'
        ? 'refunded'
        : 'unpaid';

  return {
    id: String(response.orderId),
    orderCode: response.orderCode,
    customerUserId: '',
    shippingAddressId: '',
    orderStatus: toLowerSnake(response.orderStatus) as AvailableOrder['orderStatus'],
    paymentStatus,
    totalAmount: Number(response.totalAmount ?? 0),
    items: (response.items ?? []).map((item, index) => ({
      id: `${response.orderId}-${index}`,
      availableOrderId: String(response.orderId),
      productId: String(item.productId),
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice ?? 0),
      subtotal: Number(item.subtotal ?? 0),
      product: {
        id: String(item.productId),
        categoryId: '',
        name: item.productName,
        slug: '',
        description: '',
        price: Number(item.unitPrice ?? 0),
        productKind: 'standard_product',
        isSellableDirectly: true,
        isCustomSelectable: false,
        imageUrl: '/placeholder.svg',
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
    })),
    orderedAt: response.orderedAt ?? '',
  };
}
