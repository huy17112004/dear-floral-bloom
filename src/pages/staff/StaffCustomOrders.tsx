import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockCustomOrders, mockProducts, mockAddresses } from '@/data/mockData';
import type { CustomOrder, CustomOrderStatus } from '@/types';
import { Eye, Flower, Image, Upload, CheckCircle2, XCircle } from 'lucide-react';

export default function StaffCustomOrders() {
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [evalNote, setEvalNote] = useState('');

  const filtered = statusFilter === 'all'
    ? mockCustomOrders
    : mockCustomOrders.filter(o => o.orderStatus === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Quản lý đơn hàng custom</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="deposited">Đã đặt cọc</SelectItem>
            <SelectItem value="waiting_flower_review">Chờ đánh giá hoa</SelectItem>
            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
            <SelectItem value="waiting_demo_feedback">Chờ duyệt demo</SelectItem>
            <SelectItem value="waiting_remaining_payment">Chờ thanh toán</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="canceled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Loại hoa</TableHead>
                <TableHead>Khung tranh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đánh giá hoa</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(order => {
                const frame = mockProducts.find(p => p.id === order.selectedFrameProductId);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderCode}</TableCell>
                    <TableCell>{order.flowerType}</TableCell>
                    <TableCell>{frame?.name || '—'}</TableCell>
                    <TableCell><StatusBadge type="customOrder" status={order.orderStatus} /></TableCell>
                    <TableCell><StatusBadge type="flowerEval" status={order.flowerEvaluationStatus} /></TableCell>
                    <TableCell>{order.totalAmount.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(order); setEvalNote(''); }}>
                        <Eye className="mr-1 h-4 w-4" /> Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn custom {selectedOrder?.orderCode}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-5">
              {/* Order info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Trạng thái:</span> <StatusBadge type="customOrder" status={selectedOrder.orderStatus} /></div>
                <div><span className="text-muted-foreground">Thanh toán:</span> <StatusBadge type="payment" status={selectedOrder.paymentStatus} /></div>
                <div><span className="text-muted-foreground">Loại hoa:</span> {selectedOrder.flowerType}</div>
                <div><span className="text-muted-foreground">Ngày giao mong muốn:</span> {selectedOrder.requestedDeliveryDate || '—'}</div>
              </div>

              {/* Frame info */}
              {(() => {
                const frame = mockProducts.find(p => p.id === selectedOrder.selectedFrameProductId);
                return frame ? (
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-semibold mb-1">Khung tranh đã chọn</p>
                    <p className="text-sm">{frame.name} — {frame.size} — {frame.material}</p>
                    <p className="text-sm text-muted-foreground">{frame.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                ) : null;
              })()}

              {/* Payment info */}
              <div className="rounded-lg border p-3">
                <p className="text-sm font-semibold mb-2">Thông tin thanh toán</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Đặt cọc:</span> <span className="font-medium">{selectedOrder.depositAmount.toLocaleString('vi-VN')}đ</span></div>
                  <div><span className="text-muted-foreground">Còn lại:</span> <span className="font-medium">{selectedOrder.remainingAmount.toLocaleString('vi-VN')}đ</span></div>
                  <div><span className="text-muted-foreground">Tổng:</span> <span className="font-semibold">{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span></div>
                </div>
              </div>

              {/* Personalization */}
              <div className="rounded-lg border p-3">
                <p className="text-sm font-semibold mb-1">Yêu cầu cá nhân hóa</p>
                <p className="text-sm">{selectedOrder.personalizationContent}</p>
              </div>

              {/* Flower evaluation section */}
              <Card className="border-sage/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Flower className="h-5 w-5 text-sage" />
                    Đánh giá hoa đầu vào
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedOrder.flowerInputImageUrl && (
                    <div className="rounded-lg border bg-muted/30 p-4 text-center">
                      <Image className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p className="text-xs text-muted-foreground">Ảnh hoa đầu vào của khách</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Trạng thái:</span>
                    <StatusBadge type="flowerEval" status={selectedOrder.flowerEvaluationStatus} />
                  </div>
                  {selectedOrder.flowerEvaluationNote && (
                    <p className="text-sm italic text-muted-foreground">"{selectedOrder.flowerEvaluationNote}"</p>
                  )}
                  <Textarea
                    placeholder="Ghi chú đánh giá hoa..."
                    value={evalNote}
                    onChange={e => setEvalNote(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Đạt yêu cầu
                    </Button>
                    <Button size="sm" variant="destructive">
                      <XCircle className="mr-1 h-4 w-4" /> Không đạt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Demo management */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Image className="h-5 w-5" />
                    Quản lý demo ({selectedOrder.demos?.length || 0} phiên bản)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedOrder.demos?.map(demo => (
                    <div key={demo.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Demo v{demo.versionNo}</span>
                        <StatusBadge type="demoResponse" status={demo.customerResponseStatus} />
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-3 text-center mb-2">
                        <Image className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="text-xs text-muted-foreground mt-1">{demo.demoDescription}</p>
                      </div>
                      {demo.customerFeedback && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Phản hồi khách:</span> {demo.customerFeedback}
                        </p>
                      )}
                    </div>
                  ))}

                  <Button variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload demo mới
                  </Button>
                </CardContent>
              </Card>

              {/* Status update */}
              <div className="rounded-lg border p-3">
                <p className="text-sm font-semibold mb-2">Cập nhật trạng thái đơn</p>
                <div className="flex flex-wrap gap-2">
                  {(['deposited', 'waiting_flower_review', 'in_progress', 'waiting_demo_feedback', 'waiting_remaining_payment', 'completed', 'canceled'] as CustomOrderStatus[]).map(s => (
                    <Button key={s} variant={selectedOrder.orderStatus === s ? 'default' : 'outline'} size="sm">
                      <StatusBadge type="customOrder" status={s} />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
