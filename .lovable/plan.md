

# Plan: Thêm khu vực Nhân viên (Staff)

## Tổng quan

Tạo một khu vực Staff riêng biệt với layout và sidebar riêng, tách biệt với Admin. Staff có quyền hạn giới hạn hơn Admin — tập trung vào vận hành hàng ngày (xử lý đơn, quản lý sản phẩm, nhập hàng, tồn kho, giao nhận) mà không có quản lý user hay báo cáo tổng hợp.

## Các trang cần tạo

| Route | Trang | Mô tả |
|---|---|---|
| `/staff/dashboard` | StaffDashboard | Tổng quan: đơn mới, tồn kho thấp, đơn custom chờ đánh giá hoa |
| `/staff/orders/available` | StaffAvailableOrders | Danh sách + chi tiết đơn thường, cập nhật trạng thái, theo dõi giao nhận |
| `/staff/orders/custom` | StaffCustomOrders | Danh sách + chi tiết đơn custom, đánh giá hoa đầu vào, upload/quản lý demo |
| `/staff/products` | StaffProductList | Thêm/sửa/xóa sản phẩm và khung tranh |
| `/staff/purchase-receipts` | StaffPurchaseReceipts | Tạo phiếu nhập, xem danh sách phiếu nhập |
| `/staff/inventory` | StaffInventory | Theo dõi tồn kho từng mặt hàng |
| `/staff/delivery` | StaffDeliveryTracking | Theo dõi giao nhận đơn hàng (cả thường & custom) |

## Chi tiết từng trang

### 1. StaffDashboard
- Card thống kê: đơn hàng mới hôm nay, đơn đang xử lý, tồn kho thấp (≤5), đơn custom chờ đánh giá hoa
- Danh sách nhanh: 5 đơn hàng mới nhất, 5 đơn custom cần đánh giá hoa
- Alert/cảnh báo tồn kho thấp

### 2. StaffAvailableOrders
- Giống AdminAvailableOrders nhưng thêm phần **theo dõi giao nhận** (delivery status) trong dialog chi tiết
- Có thể cập nhật delivery status: pending → shipped → delivered / failed
- Hiển thị địa chỉ giao hàng trong chi tiết đơn

### 3. StaffCustomOrders
- Giống AdminCustomOrders nhưng mở rộng:
  - Section **đánh giá hoa đầu vào**: xem ảnh hoa, approve/reject + ghi chú
  - Section **quản lý demo**: upload ảnh demo mới, xem lịch sử demo, xem feedback khách
  - Hiển thị thông tin khung tranh, đặt cọc, thanh toán còn lại

### 4. StaffProductList
- Tương tự AdminProductList với đầy đủ CRUD (dialog tạo/sửa sản phẩm)
- Filter theo product_kind, is_sellable_directly, is_custom_selectable, status

### 5. StaffPurchaseReceipts
- Tương tự AdminPurchaseReceipts + dialog tạo phiếu nhập mới (chọn sản phẩm, số lượng, giá nhập)

### 6. StaffInventory
- Tương tự AdminInventory

### 7. StaffDeliveryTracking (trang mới)
- Danh sách tất cả đơn hàng (thường + custom) với delivery status
- Filter theo delivery status: pending / shipped / delivered / failed
- Cập nhật delivery status trực tiếp từ bảng

## Component mới

- **StaffLayout** — Layout riêng với sidebar staff (logo, menu items, nút về trang chủ), giống cấu trúc AdminLayout nhưng menu khác
- **DeliveryStatusBadge** — Tái dùng StatusBadge có sẵn với type `delivery`

## Thay đổi file hiện có

- **`src/App.tsx`**: Thêm routes `/staff/*` với StaffLayout
- **`src/components/shared/StatusBadge.tsx`**: Thêm support `delivery` type nếu chưa có
- **`src/data/mockData.ts`**: Thêm mock delivery data (delivery status cho các đơn hàng hiện có)

## Cấu trúc file mới

```text
src/
  components/
    staff/
      StaffLayout.tsx
  pages/
    staff/
      StaffDashboard.tsx
      StaffAvailableOrders.tsx
      StaffCustomOrders.tsx
      StaffProductList.tsx
      StaffPurchaseReceipts.tsx
      StaffInventory.tsx
      StaffDeliveryTracking.tsx
```

## Phong cách UI
- Giữ nguyên design system Dear Floral (cream/sage/clay)
- StaffLayout sidebar dùng icon khác biệt nhẹ so với Admin (ví dụ dùng `ClipboardList` cho dashboard)
- Staff sidebar có label "Dear Floral — Staff" để phân biệt

