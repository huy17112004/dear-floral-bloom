import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressCrudSection } from '@/components/shared/AddressCrudSection';
import { meApi } from '@/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await meApi.getMyProfile();
        setFullName(response.data.fullName);
        setEmail(response.data.email);
        setPhone(response.data.phone);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải hồ sơ';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await meApi.updateMyProfile({ fullName, email, phone });
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cập nhật hồ sơ thất bại';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      <h1 className="font-heading text-2xl font-bold text-heading">Hồ sơ cá nhân</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-caption">Đang tải hồ sơ...</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label>Họ tên</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
              </div>
              <Button type="submit" disabled={submitting} className="rounded-full">
                {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Địa chỉ giao hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressCrudSection title="Quản lý địa chỉ" />
        </CardContent>
      </Card>
    </div>
  );
}


