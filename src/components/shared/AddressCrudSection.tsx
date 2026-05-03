import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressCard } from '@/components/shared/AddressCard';
import { meApi } from '@/api';
import { mapAddress } from '@/api/mappers';
import type { CustomerAddress } from '@/types';
import { toast } from 'sonner';

interface AddressCrudSectionProps {
  title?: string;
  selectable?: boolean;
  selectedAddressId?: string;
  onSelectAddress?: (addressId: string) => void;
}

type AddressFormState = {
  receiverName: string;
  receiverPhone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  note: string;
};

const EMPTY_FORM: AddressFormState = {
  receiverName: '',
  receiverPhone: '',
  addressLine: '',
  ward: '',
  district: '',
  province: '',
  note: '',
};

function toPayload(form: AddressFormState, isDefault: boolean) {
  return {
    receiverName: form.receiverName,
    receiverPhone: form.receiverPhone,
    addressLine: form.addressLine,
    ward: form.ward,
    district: form.district,
    province: form.province,
    isDefault,
    note: form.note || undefined,
  };
}

export function AddressCrudSection({
  title = 'Địa chỉ giao hàng',
  selectable = false,
  selectedAddressId,
  onSelectAddress,
}: AddressCrudSectionProps) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  const loadAddresses = async () => {
    try {
      const response = await meApi.getMyAddresses();
      const mapped = response.data.map(mapAddress);
      setAddresses(mapped);
      if (mapped.length > 0 && onSelectAddress && !selectedAddressId) {
        onSelectAddress(mapped.find(a => a.isDefault)?.id ?? mapped[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải địa chỉ';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const resetDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    resetDialog();
    setOpen(true);
  };

  const openEdit = (address: CustomerAddress) => {
    setEditingId(address.id);
    setForm({
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      addressLine: address.addressLine,
      ward: address.ward,
      district: address.district,
      province: address.province,
      note: address.note ?? '',
    });
    setOpen(true);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const current = addresses.find(item => item.id === editingId);
        await meApi.updateAddress(Number(editingId), toPayload(form, !!current?.isDefault));
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await meApi.createAddress(toPayload(form, addresses.length === 0));
        toast.success('Thêm địa chỉ thành công');
      }
      setOpen(false);
      resetDialog();
      await loadAddresses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể lưu địa chỉ';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (addressId: string) => {
    try {
      await meApi.deleteAddress(Number(addressId));
      toast.success('Đã xóa địa chỉ');
      await loadAddresses();
      if (selectedAddressId === addressId && onSelectAddress) {
        const remaining = addresses.filter(addr => addr.id !== addressId);
        onSelectAddress(remaining.find(a => a.isDefault)?.id ?? remaining[0]?.id ?? '');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa địa chỉ';
      toast.error(message);
    }
  };

  const onSetDefault = async (address: CustomerAddress) => {
    try {
      await meApi.updateAddress(Number(address.id), {
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        addressLine: address.addressLine,
        ward: address.ward,
        district: address.district,
        province: address.province,
        isDefault: true,
        note: address.note,
      });
      toast.success('Đã đặt mặc định');
      await loadAddresses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đặt mặc định';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-heading">{title}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 rounded-full" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Thêm địa chỉ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">
                {isEditing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div><Label>Tên người nhận</Label><Input className="mt-1" value={form.receiverName} onChange={e => setForm(prev => ({ ...prev, receiverName: e.target.value }))} required /></div>
              <div><Label>Số điện thoại</Label><Input className="mt-1" value={form.receiverPhone} onChange={e => setForm(prev => ({ ...prev, receiverPhone: e.target.value }))} required /></div>
              <div><Label>Địa chỉ</Label><Input className="mt-1" value={form.addressLine} onChange={e => setForm(prev => ({ ...prev, addressLine: e.target.value }))} required /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Phường/Xã</Label><Input className="mt-1" value={form.ward} onChange={e => setForm(prev => ({ ...prev, ward: e.target.value }))} required /></div>
                <div><Label>Quận/Huyện</Label><Input className="mt-1" value={form.district} onChange={e => setForm(prev => ({ ...prev, district: e.target.value }))} required /></div>
                <div><Label>Tỉnh/TP</Label><Input className="mt-1" value={form.province} onChange={e => setForm(prev => ({ ...prev, province: e.target.value }))} required /></div>
              </div>
              <div><Label>Ghi chú</Label><Input className="mt-1" value={form.note} onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))} /></div>
              <Button type="submit" disabled={submitting} className="w-full rounded-full">
                {submitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-caption">Đang tải địa chỉ...</p>
      ) : (
        <div className="space-y-3">
          {addresses.map(address => (
            <AddressCard
              key={address.id}
              address={address}
              selectable={selectable}
              selected={selectedAddressId === address.id}
              onSelect={selectable ? () => onSelectAddress?.(address.id) : undefined}
              onEdit={() => openEdit(address)}
              onDelete={() => void onDelete(address.id)}
              onSetDefault={() => void onSetDefault(address)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
