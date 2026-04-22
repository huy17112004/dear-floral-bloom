import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddressCard } from '@/components/shared/AddressCard';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { meApi } from '@/api';
import { mapAddress } from '@/api/mappers';
import type { CustomerAddress } from '@/types';
import { toast } from 'sonner';

export default function AddressManagementPage() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [open, setOpen] = useState(false);

  const loadAddresses = async () => {
    try {
      const response = await meApi.getMyAddresses();
      setAddresses(response.data.map(mapAddress));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải địa chỉ';
      toast.error(message);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const onCreateAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await meApi.createAddress({
        receiverName,
        receiverPhone,
        addressLine,
        ward,
        district,
        province,
        isDefault: addresses.length === 0,
      });
      toast.success('Thêm địa chỉ thành công');
      setOpen(false);
      setReceiverName('');
      setReceiverPhone('');
      setAddressLine('');
      setWard('');
      setDistrict('');
      setProvince('');
      await loadAddresses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể thêm địa chỉ';
      toast.error(message);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await meApi.deleteAddress(Number(id));
      toast.success('Đã xóa địa chỉ');
      await loadAddresses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa địa chỉ';
      toast.error(message);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Địa chỉ giao hàng</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 rounded-full">
              <Plus className="h-4 w-4" /> Thêm địa chỉ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Thêm địa chỉ mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={onCreateAddress} className="space-y-4">
              <div><Label>Tên người nhận</Label><Input className="mt-1" value={receiverName} onChange={e => setReceiverName(e.target.value)} required /></div>
              <div><Label>Số điện thoại</Label><Input className="mt-1" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} required /></div>
              <div><Label>Địa chỉ</Label><Input className="mt-1" value={addressLine} onChange={e => setAddressLine(e.target.value)} required /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Phường/Xã</Label><Input className="mt-1" value={ward} onChange={e => setWard(e.target.value)} required /></div>
                <div><Label>Quận/Huyện</Label><Input className="mt-1" value={district} onChange={e => setDistrict(e.target.value)} required /></div>
                <div><Label>Tỉnh/TP</Label><Input className="mt-1" value={province} onChange={e => setProvince(e.target.value)} required /></div>
              </div>
              <Button type="submit" className="w-full rounded-full">Lưu địa chỉ</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {addresses.map(addr => (
          <AddressCard
            key={addr.id}
            address={addr}
            onEdit={() => {}}
            onDelete={() => void onDelete(addr.id)}
            onSetDefault={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
