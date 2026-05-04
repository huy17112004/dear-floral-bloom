import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { adminCustomOrderApi, customOrderApi } from '@/api';
import { mapCustomOrder } from '@/api/mappers';
import type { CustomDemo, CustomOrder } from '@/types';
import { toast } from 'sonner';
import { resolveImageUrl } from '@/lib/image';

export default function AdminCustomOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loadingVerify, setLoadingVerify] = useState<Record<string, boolean>>({});
  const [evalNote, setEvalNote] = useState<Record<string, string>>({});
  const [demoFiles, setDemoFiles] = useState<Record<string, File[]>>({});
  const [demoDesc, setDemoDesc] = useState<Record<string, string>>({});
  const [verifyNote, setVerifyNote] = useState<Record<string, string>>({});
  const [demosByOrder, setDemosByOrder] = useState<Record<string, CustomDemo[]>>({});

  const loadOrders = async () => {
    const response = await adminCustomOrderApi.getAdminCustomOrders({ page: 0, limit: 100 });
    setOrders(response.data.map(mapCustomOrder));
  };

  useEffect(() => {
    loadOrders().catch(() => toast.error('Không thể tải danh sách đơn custom'));
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.orderCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleVerifyDeposit = async (orderId: string, accepted: boolean) => {
    setLoadingVerify(prev => ({ ...prev, [orderId]: true }));
    try {
      await adminCustomOrderApi.verifyCustomOrderDeposit(Number(orderId), accepted);
      toast.success(accepted ? 'Đã xác nhận nhận cọc' : 'Đã từ chối - đơn quay về chờ cọc');
      await loadOrders();
    } finally {
      setLoadingVerify(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleEvaluateFlower = async (orderId: string, pass: boolean) => {
    await adminCustomOrderApi.evaluateCustomOrderFlowerInput(Number(orderId), {
      evaluationStatus: pass ? 'pass' : 'fail',
      evaluationNote: evalNote[orderId],
    });
    toast.success('Đã cập nhật đánh giá hoa');
    await loadOrders();
  };

  const mapDemo = (demo: Awaited<ReturnType<typeof customOrderApi.getCustomOrderDemos>>['data'][number]): CustomDemo => ({
    id: String(demo.demoId),
    customOrderId: String(demo.orderId),
    versionNo: demo.versionNo,
    demoImageUrl: resolveImageUrl(demo.demoImageUrl || '/placeholder.svg'),
    demoImages: (demo.demoImages && demo.demoImages.length > 0 ? demo.demoImages : [demo.demoImageUrl || '/placeholder.svg']).map(resolveImageUrl),
    demoDescription: demo.demoDescription,
    customerResponseStatus: (demo.customerResponseStatus || 'pending').toLowerCase() as CustomDemo['customerResponseStatus'],
    customerFeedback: demo.customerFeedback,
    uploadedBy: '',
    uploadedAt: demo.uploadedAt || '',
    respondedAt: demo.respondedAt || undefined,
  });

  const loadOrderDemos = async (orderId: string) => {
    if (demosByOrder[orderId]) return;
    const demosResponse = await customOrderApi.getCustomOrderDemos(Number(orderId));
    setDemosByOrder(prev => ({ ...prev, [orderId]: demosResponse.data.map(mapDemo) }));
  };

  const handleUploadDemo = async (orderId: string) => {
    const files = demoFiles[orderId] ?? [];
    if (files.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh demo');
      return;
    }
    await adminCustomOrderApi.uploadAdminCustomOrderDemo(Number(orderId), {
      demoImageFiles: files,
      demoDescription: demoDesc[orderId],
    });
    const demosResponse = await customOrderApi.getCustomOrderDemos(Number(orderId));
    setDemosByOrder(prev => ({ ...prev, [orderId]: demosResponse.data.map(mapDemo) }));
    toast.success('Đã gửi demo');
    await loadOrders();
  };

  const handleConfirmRefund = async (orderId: string) => {
    await adminCustomOrderApi.confirmCustomOrderRefund(Number(orderId));
    toast.success('Đã xác nhận hoàn tiền');
    await loadOrders();
  };

  const handleVerifyRemaining = async (orderId: string, received: boolean) => {
    await adminCustomOrderApi.verifyCustomOrderRemainingPayment(Number(orderId), { received, note: verifyNote[orderId] });
    toast.success('Đã xử lý xác nhận thanh toán');
    await loadOrders();
  };

  const handleConfirmDelivered = async (orderId: string) => {
    await adminCustomOrderApi.updateAdminCustomOrderDelivery(Number(orderId), {
      deliveryType: 'SHIP_OUTPUT',
      deliveryStatus: 'DELIVERED',
    });
    toast.success('Đã xác nhận giao hàng thành công');
    await loadOrders();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-heading">Đơn hàng Custom</h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-caption" />
              <Input placeholder="Tìm mã đơn..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending_deposit">Chờ đặt cọc</SelectItem>
                <SelectItem value="pending_deposit_verification">Đang xác nhận cọc</SelectItem>
                <SelectItem value="waiting_flower_review">Chờ đánh giá hoa</SelectItem>
                <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                <SelectItem value="waiting_demo_feedback">Chờ duyệt demo</SelectItem>
                <SelectItem value="waiting_remaining_payment">Chờ thanh toán</SelectItem>
                <SelectItem value="waiting_remaining_payment_verification">Chờ xác nhận tiền</SelectItem>
                <SelectItem value="delivering">Đang giao hàng</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead><TableHead>Loại hoa</TableHead><TableHead>Khung tranh</TableHead><TableHead>Tổng tiền</TableHead><TableHead>Thanh toán</TableHead><TableHead>Trạng thái</TableHead><TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium text-heading">{o.orderCode}</TableCell>
                  <TableCell>{o.flowerType}</TableCell>
                  <TableCell>{o.selectedFrame?.name || '—'}</TableCell>
                  <TableCell>{o.totalAmount.toLocaleString('vi-VN')}₫</TableCell>
                  <TableCell><StatusBadge type="payment" status={o.paymentStatus} /></TableCell>
                  <TableCell><StatusBadge type="customOrder" status={o.orderStatus} /></TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild><Button variant="ghost" size="icon" onClick={() => void loadOrderDemos(o.id)}><Eye className="h-4 w-4" /></Button></DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                        <DialogHeader><DialogTitle className="font-heading">{o.orderCode}</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div className="rounded-lg border bg-surface-warm p-4 space-y-2 text-sm">
                            <p className="font-medium text-heading mb-3">Thông tin đơn hàng</p>
                            <div className="flex justify-between"><span className="text-caption">Loại hoa</span><span className="font-medium">{o.flowerType}</span></div>
                            <div className="flex justify-between"><span className="text-caption">Khung tranh</span><span className="font-medium">{o.selectedFrame?.name || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-caption">Yêu cầu</span><span className="font-medium text-right max-w-[50%]">{o.personalizationContent || '—'}</span></div>
                            {o.requestedDeliveryDate && <div className="flex justify-between"><span className="text-caption">Ngày mong muốn</span><span className="font-medium">{new Date(o.requestedDeliveryDate).toLocaleDateString('vi-VN')}</span></div>}
                            {o.flowerInputImageUrl && (
                              <div className="pt-1">
                                <p className="text-caption mb-1">Ảnh hoa khách gửi</p>
                                <img
                                  src={resolveImageUrl(o.flowerInputImageUrl)}
                                  alt="Ảnh hoa khách gửi"
                                  className="max-h-56 w-full rounded-lg border object-cover"
                                />
                              </div>
                            )}
                            <div className="pt-2 border-t space-y-2">
                              <div className="flex justify-between"><span className="text-caption">Đặt cọc</span><span className="font-medium">{o.depositAmount.toLocaleString('vi-VN')}₫</span></div>
                              <div className="flex justify-between"><span className="text-caption">Còn lại</span><span className="font-medium">{o.remainingAmount.toLocaleString('vi-VN')}₫</span></div>
                              {Math.max(0, o.totalAmount - o.depositAmount * 2) > 0 && (
                                <div className="flex justify-between"><span className="text-caption">Phí chỉnh sửa demo vượt mức</span><span className="font-medium">+{Math.max(0, o.totalAmount - o.depositAmount * 2).toLocaleString('vi-VN')}₫</span></div>
                              )}
                              <div className="flex justify-between font-semibold"><span>Tổng cộng</span><span>{o.totalAmount.toLocaleString('vi-VN')}₫</span></div>
                            </div>
                            <div className="pt-2 border-t space-y-2">
                              <div className="flex justify-between"><span className="text-caption">Trạng thái thanh toán</span><StatusBadge type="payment" status={o.paymentStatus} /></div>
                              <div className="flex justify-between"><span className="text-caption">Trạng thái đơn</span><StatusBadge type="customOrder" status={o.orderStatus} /></div>
                            </div>
                            {(o.refundBankName || o.refundAccountNumber || o.refundAccountName || o.orderStatus === 'waiting_refund' || o.orderStatus === 'refunded') && (
                              <div className="pt-2 border-t space-y-1">
                                <p className="text-caption font-medium">Thông tin hoàn tiền</p>
                                <p className="text-xs text-body"><span className="font-medium">Ngân hàng:</span> {o.refundBankName || '—'}</p>
                                <p className="text-xs text-body"><span className="font-medium">Số tài khoản:</span> {o.refundAccountNumber || '—'}</p>
                                <p className="text-xs text-body"><span className="font-medium">Chủ tài khoản:</span> {o.refundAccountName || '—'}</p>
                              </div>
                            )}
                            {o.shippingAddress && (
                              <div className="pt-2 border-t">
                                <p className="text-caption font-medium mb-1">Địa chỉ giao hàng</p>
                                <p className="text-xs text-body">{o.shippingAddress.receiverName} - {o.shippingAddress.receiverPhone}</p>
                                <p className="text-xs text-body">{[o.shippingAddress.addressLine, o.shippingAddress.ward, o.shippingAddress.district, o.shippingAddress.province].filter(Boolean).join(', ')}</p>
                              </div>
                            )}
                          </div>
                          {(demosByOrder[o.id]?.length ?? 0) > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Demo ({demosByOrder[o.id].length})</p>
                              <div className="space-y-2">
                                {demosByOrder[o.id].map(d => (
                                  <div key={d.id} className="rounded-lg bg-surface-warm p-3 text-sm">
                                    <div className="flex justify-between"><span>V{d.versionNo}</span><StatusBadge type="demoResponse" status={d.customerResponseStatus} /></div>
                                    {d.customerFeedback && <p className="mt-1 text-xs text-caption">Lý do khách phản hồi: {d.customerFeedback}</p>}
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      {(d.demoImages && d.demoImages.length > 0 ? d.demoImages : [d.demoImageUrl]).map((img, idx) => (
                                        <img key={`${d.id}-${idx}`} src={img} alt={`Demo ${d.versionNo}-${idx + 1}`} className="h-20 w-full rounded object-cover" />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {o.orderStatus === 'pending_deposit_verification' && (
                            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 space-y-2">
                              <div className="flex gap-2">
                                <Button size="sm" className="flex-1 gap-1 rounded-full bg-green-600 hover:bg-green-700" disabled={loadingVerify[o.id]} onClick={() => void handleVerifyDeposit(o.id, true)}><CheckCircle className="h-3.5 w-3.5" /> Đã nhận cọc</Button>
                                <Button size="sm" variant="outline" className="flex-1 gap-1 rounded-full border-red-300 text-red-600 hover:bg-red-50" disabled={loadingVerify[o.id]} onClick={() => void handleVerifyDeposit(o.id, false)}><XCircle className="h-3.5 w-3.5" /> Chưa nhận được</Button>
                              </div>
                            </div>
                          )}
                          {o.orderStatus === 'waiting_flower_review' && (
                            <div className="space-y-2 rounded-xl border p-3">
                              <Textarea placeholder="Lý do (bắt buộc nếu fail)" value={evalNote[o.id] || ''} onChange={e => setEvalNote(prev => ({ ...prev, [o.id]: e.target.value }))} />
                              <div className="flex gap-2">
                                <Button className="flex-1" onClick={() => void handleEvaluateFlower(o.id, true)}>Chuyển sang thực hiện</Button>
                                <Button variant="destructive" className="flex-1" onClick={() => void handleEvaluateFlower(o.id, false)}>Từ chối</Button>
                              </div>
                            </div>
                          )}
                          {o.orderStatus === 'in_progress' && (
                            <div className="space-y-2 rounded-xl border p-3">
                              <Input type="file" accept="image/*" multiple onChange={e => setDemoFiles(prev => ({ ...prev, [o.id]: Array.from(e.target.files ?? []) }))} />
                              {(demoFiles[o.id]?.length ?? 0) > 0 && <p className="text-xs text-caption">Đã chọn {demoFiles[o.id].length} ảnh</p>}
                              <Textarea placeholder="Mô tả demo" value={demoDesc[o.id] || ''} onChange={e => setDemoDesc(prev => ({ ...prev, [o.id]: e.target.value }))} />
                              <Button className="w-full rounded-full" onClick={() => void handleUploadDemo(o.id)}>Gửi demo</Button>
                            </div>
                          )}
                          {o.orderStatus === 'waiting_refund' && <Button className="w-full rounded-full" variant="destructive" onClick={() => void handleConfirmRefund(o.id)}>Confirm đã hoàn tiền</Button>}
                          {o.orderStatus === 'waiting_remaining_payment_verification' && (
                            <div className="space-y-2 rounded-xl border p-3">
                              <Textarea placeholder="Ghi chú (không bắt buộc)" value={verifyNote[o.id] || ''} onChange={e => setVerifyNote(prev => ({ ...prev, [o.id]: e.target.value }))} />
                              <div className="flex gap-2">
                                <Button className="flex-1" onClick={() => void handleVerifyRemaining(o.id, true)}>Đã nhận được</Button>
                                <Button variant="outline" className="flex-1" onClick={() => void handleVerifyRemaining(o.id, false)}>Chưa nhận được</Button>
                              </div>
                            </div>
                          )}
                          {o.orderStatus === 'delivering' && (
                            <div className="space-y-2 rounded-xl border p-3">
                              <p className="text-sm font-medium">Thông tin giao hàng</p>
                              <p className="text-xs text-caption">
                                {o.shippingAddress?.receiverName} - {o.shippingAddress?.receiverPhone}
                                <br />
                                {[o.shippingAddress?.addressLine, o.shippingAddress?.ward, o.shippingAddress?.district, o.shippingAddress?.province].filter(Boolean).join(', ')}
                              </p>
                              <Button className="w-full" onClick={() => void handleConfirmDelivered(o.id)}>Xác nhận đã giao hàng</Button>
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
