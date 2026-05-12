import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { availableOrderApi } from '@/api';
import { mapAvailableOrder } from '@/api/mappers';
import type { AvailableOrder, AvailableOrderStatus } from '@/types';
import { toast } from 'sonner';

export default function AdminAvailableOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AvailableOrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [verifyNotes, setVerifyNotes] = useState<Record<string, string>>({});
  const [shippingCarrier, setShippingCarrier] = useState<Record<string, string>>({});
  const [shippingTrackingCode, setShippingTrackingCode] = useState<Record<string, string>>({});
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const loadOrders = async () => {
    try {
      const response = await availableOrderApi.getAdminAvailableOrders({
        page: 0,
        limit: 100,
        keyword: search || undefined,
        orderStatus: statusFilter === 'all' ? undefined : statusFilter,
      });
      setOrders(response.data.map(mapAvailableOrder));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải danh sách đơn thường';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = useMemo(
    () => orders.filter(o => !search || o.orderCode.toLowerCase().includes(search.toLowerCase())),
    [orders, search]
  );

  const runAction = async (orderId: string, handler: () => Promise<void>, successMessage: string) => {
    setLoadingActions(prev => ({ ...prev, [orderId]: true }));
    try {
      await handler();
      toast.success(successMessage);
      await loadOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cập nhật thất bại';
      toast.error(message);
    } finally {
      setLoadingActions(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    await runAction(
      orderId,
      () => availableOrderApi.updateAdminAvailableOrderStatus(Number(orderId), { status: 'processing' }).then(() => undefined),
      'Đã xác nhận đơn, chuyển sang đang chuẩn bị hàng'
    );
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = rejectionReasons[orderId];
    if (!reason || reason.trim() === '') {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    await runAction(
      orderId,
      () => availableOrderApi.updateAdminAvailableOrderStatus(Number(orderId), { status: 'canceled', reason }).then(() => undefined),
      'Đã xử lý từ chối đơn hàng'
    );
    setRejectionReasons(prev => ({ ...prev, [orderId]: '' }));
  };

  const handleVerifyPayment = async (orderId: string, received: boolean) => {
    await runAction(
      orderId,
      () => availableOrderApi.verifyAvailableOrderPayment(Number(orderId), { received, note: verifyNotes[orderId] }).then(() => undefined),
      received ? 'Đã xác nhận nhận được thanh toán' : 'Đã từ chối xác nhận thanh toán'
    );
  };

  const handleMoveToShipping = async (orderId: string) => {
    const carrier = (shippingCarrier[orderId] || '').trim();
    const trackingCode = (shippingTrackingCode[orderId] || '').trim();
    if (!carrier || !trackingCode) {
      toast.error('Vui lòng nhập đơn vị vận chuyển và mã vận đơn');
      return;
    }
    await runAction(
      orderId,
      () => availableOrderApi.submitAvailableOrderShippingInfo(Number(orderId), {
        shippingCarrier: carrier,
        shippingTrackingCode: trackingCode,
      }).then(() => undefined),
      'Đã chuyển sang đang vận chuyển'
    );
  };

  const handleConfirmRefund = async (orderId: string) => {
    await runAction(
      orderId,
      () => availableOrderApi.confirmAvailableOrderRefund(Number(orderId)).then(() => undefined),
      'Đã xác nhận hoàn tiền cho đơn hàng'
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-heading">Đơn hàng thường</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-caption" />
              <Input placeholder="Tìm mã đơn..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as AvailableOrderStatus | 'all')}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="received">Đã tiếp nhận</SelectItem>
                <SelectItem value="processing">Đang chuẩn bị</SelectItem>
                <SelectItem value="shipping">Đang giao</SelectItem>
                <SelectItem value="waiting_refund_info">Chờ thông tin hoàn tiền</SelectItem>
                <SelectItem value="waiting_refund">Chờ hoàn tiền</SelectItem>
                <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="canceled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="mb-4 text-sm text-caption">Đang tải dữ liệu...</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium text-heading">{o.orderCode}</TableCell>
                  <TableCell className="text-body">{new Date(o.orderedAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="font-medium">{o.totalAmount.toLocaleString('vi-VN')}₫</TableCell>
                  <TableCell><StatusBadge type="payment" status={o.paymentStatus} /></TableCell>
                  <TableCell><StatusBadge type="availableOrder" status={o.orderStatus} /></TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="font-heading">{o.orderCode}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <StatusBadge type="availableOrder" status={o.orderStatus} />
                            <StatusBadge type="payment" status={o.paymentStatus} />
                          </div>
                          <div className="rounded-lg border bg-surface-warm p-3 text-sm space-y-1.5">
                            <p className="font-medium text-heading">Thông tin đơn hàng</p>
                            <p><span className="text-caption">Mã đơn:</span> {o.orderCode}</p>
                            <p><span className="text-caption">Thời gian đặt:</span> {new Date(o.orderedAt).toLocaleString('vi-VN')}</p>
                            <p><span className="text-caption">Người nhận:</span> {o.shippingAddress?.receiverName || '—'}</p>
                            <p><span className="text-caption">Số điện thoại:</span> {o.shippingAddress?.receiverPhone || '—'}</p>
                            <p><span className="text-caption">Địa chỉ giao hàng:</span> {[o.shippingAddress?.addressLine, o.shippingAddress?.ward, o.shippingAddress?.district, o.shippingAddress?.province].filter(Boolean).join(', ') || '—'}</p>
                          </div>
                          <div className="space-y-2">
                            {o.items?.map(item => (
                              <div key={item.id} className="flex justify-between rounded-lg bg-surface-warm p-3 text-sm">
                                <span>
                                  {item.product?.name || item.productId} x{item.quantity}
                                  <span className="ml-2 text-xs text-caption">(Đơn giá: {item.unitPrice.toLocaleString('vi-VN')}₫)</span>
                                </span>
                                <span className="font-medium">{item.subtotal.toLocaleString('vi-VN')}₫</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between border-t pt-3 font-medium">
                            <span>Tổng</span>
                            <span>{o.totalAmount.toLocaleString('vi-VN')}₫</span>
                          </div>

                          {(o.refundBankName || o.refundAccountNumber || o.refundAccountName || o.orderStatus === 'waiting_refund' || o.orderStatus === 'refunded') && (
                            <div className="rounded-lg border bg-surface-warm p-3 text-sm space-y-1">
                              <p className="font-medium text-heading">Thông tin hoàn tiền</p>
                              <p><span className="text-caption">Ngân hàng:</span> {o.refundBankName || '—'}</p>
                              <p><span className="text-caption">Số tài khoản:</span> {o.refundAccountNumber || '—'}</p>
                              <p><span className="text-caption">Chủ tài khoản:</span> {o.refundAccountName || '—'}</p>
                            </div>
                          )}

                          {o.orderStatus === 'received' && o.paymentStatus === 'pending' && (
                            <div className="space-y-2 rounded-xl border border-sky-200 bg-sky-50 p-4">
                              <p className="text-sm font-medium text-heading">Xác nhận thanh toán</p>
                              <Textarea
                                placeholder="Ghi chú (không bắt buộc)"
                                value={verifyNotes[o.id] || ''}
                                onChange={e => setVerifyNotes(prev => ({ ...prev, [o.id]: e.target.value }))}
                              />
                              <div className="flex gap-2">
                                <Button className="flex-1" disabled={loadingActions[o.id]} onClick={() => void handleVerifyPayment(o.id, true)}>Đã nhận tiền</Button>
                                <Button variant="outline" className="flex-1" disabled={loadingActions[o.id]} onClick={() => void handleVerifyPayment(o.id, false)}>Chưa nhận được</Button>
                              </div>
                            </div>
                          )}

                          {o.orderStatus === 'received' && o.paymentStatus === 'paid' && (
                            <div className="space-y-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                              <p className="text-sm font-medium text-heading">Hành động yêu cầu</p>
                              {rejectionReasons[o.id] === undefined ? (
                                <div className="flex gap-2">
                                  <Button size="sm" className="flex-1 gap-1 rounded-full bg-green-600 hover:bg-green-700" disabled={loadingActions[o.id]} onClick={() => void handleApproveOrder(o.id)}>
                                    <CheckCircle className="h-3.5 w-3.5" /> Xác nhận đơn
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1 gap-1 rounded-full border-red-300 text-red-600 hover:bg-red-50" onClick={() => setRejectionReasons(prev => ({ ...prev, [o.id]: '' }))}>
                                    <XCircle className="h-3.5 w-3.5" /> Từ chối
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Textarea
                                    placeholder="Nhập lý do từ chối"
                                    value={rejectionReasons[o.id] || ''}
                                    onChange={e => setRejectionReasons(prev => ({ ...prev, [o.id]: e.target.value }))}
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="destructive" className="flex-1" disabled={loadingActions[o.id]} onClick={() => void handleRejectOrder(o.id)}>Xác nhận từ chối</Button>
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setRejectionReasons(prev => { const next = { ...prev }; delete next[o.id]; return next; })}>Huỷ</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {o.orderStatus === 'processing' && (
                            <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
                              <p className="text-sm font-medium text-heading">Hành động yêu cầu</p>
                              <div className="grid gap-2 sm:grid-cols-2">
                                <Input
                                  placeholder="Đơn vị vận chuyển"
                                  value={shippingCarrier[o.id] || ''}
                                  onChange={e => setShippingCarrier(prev => ({ ...prev, [o.id]: e.target.value }))}
                                />
                                <Input
                                  placeholder="Mã vận đơn"
                                  value={shippingTrackingCode[o.id] || ''}
                                  onChange={e => setShippingTrackingCode(prev => ({ ...prev, [o.id]: e.target.value }))}
                                />
                              </div>
                              <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700" disabled={loadingActions[o.id]} onClick={() => void handleMoveToShipping(o.id)}>
                                Gửi thông tin và chuyển vận chuyển
                              </Button>
                            </div>
                          )}

                          {o.orderStatus === 'shipping' && (
                            <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
                              <p className="text-sm font-medium text-heading">Thông tin giao hàng</p>
                              {o.shippingAddress ? (
                                <div className="text-sm text-body space-y-1">
                                  <p><span className="font-medium">Người nhận:</span> {o.shippingAddress.receiverName || '—'}</p>
                                  <p><span className="font-medium">Số điện thoại:</span> {o.shippingAddress.receiverPhone || '—'}</p>
                                  <p><span className="font-medium">Địa chỉ:</span> {[o.shippingAddress.addressLine, o.shippingAddress.ward, o.shippingAddress.district, o.shippingAddress.province].filter(Boolean).join(', ') || '—'}</p>
                                </div>
                              ) : (
                                <p className="text-sm text-caption">Không có thông tin địa chỉ</p>
                              )}
                              {(o.shippingCarrier || o.shippingTrackingCode) && (
                                <div className="rounded-lg border bg-surface-warm p-3 text-sm space-y-1">
                                  <p><span className="font-medium">Đơn vị vận chuyển:</span> {o.shippingCarrier || '—'}</p>
                                  <p><span className="font-medium">Mã vận đơn:</span> {o.shippingTrackingCode || '—'}</p>
                                </div>
                              )}
                              <p className="text-xs text-caption">
                                Đơn sẽ hoàn thành khi khách xác nhận đã nhận hàng hoặc hệ thống tự hoàn thành sau 5 phút.
                              </p>
                            </div>
                          )}

                          {o.orderStatus === 'waiting_refund' && (
                            <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4">
                              <p className="text-sm font-medium text-heading">Hoàn tiền</p>
                              <Button className="w-full rounded-full" variant="destructive" disabled={loadingActions[o.id]} onClick={() => void handleConfirmRefund(o.id)}>
                                Xác nhận đã hoàn tiền
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
