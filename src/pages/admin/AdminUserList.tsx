import { useEffect, useMemo, useState } from 'react';
import { adminUserApi } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AdminUserRow = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  status: string;
};

const roleLabels: Record<AdminUserRow['role'], string> = {
  ADMIN: 'Admin',
  STAFF: 'Nhân viên',
  CUSTOMER: 'Khách hàng',
};

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  role: 'STAFF' as AdminUserRow['role'],
  status: 'ACTIVE',
  password: '',
};

export default function AdminUserList() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    try {
      const response = await adminUserApi.getAdminUsers({ page: 0, limit: 200 });
      setUsers(response.data.map(item => ({
        id: item.userId,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        role: item.role as AdminUserRow['role'],
        status: item.status,
      })));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải danh sách người dùng';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(
    () => users.filter(u => !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search)),
    [users, search]
  );

  const resetForm = () => setForm(initialForm);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await adminUserApi.createAdminUser({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        status: form.status,
        password: form.password,
      });
      toast.success('Tạo người dùng thành công');
      setOpenCreate(false);
      resetForm();
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tạo người dùng thất bại';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (user: AdminUserRow) => {
    setEditingUser(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      password: '',
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) {
      return;
    }
    setSubmitting(true);
    try {
      await adminUserApi.updateAdminUser(editingUser.id, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        status: form.status,
        password: form.password || undefined,
      });
      toast.success('Cập nhật người dùng thành công');
      setEditingUser(null);
      resetForm();
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cập nhật người dùng thất bại';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await adminUserApi.deleteAdminUser(userId);
      toast.success('Đã xử lý xóa/khóa người dùng');
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa người dùng';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-heading">Quản lý người dùng</h1>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full"><Plus className="h-4 w-4" /> Thêm người dùng</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tạo người dùng</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Họ tên</Label><Input value={form.fullName} onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} /></div>
              <div><Label>SĐT</Label><Input value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} /></div>
              <div><Label>Mật khẩu</Label><Input type="password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} /></div>
              <div>
                <Label>Vai trò</Label>
                <Select value={form.role} onValueChange={v => setForm(prev => ({ ...prev, role: v as AdminUserRow['role'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="STAFF">Nhân viên</SelectItem>
                    <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={submitting} className="w-full" onClick={() => void handleCreate()}>Lưu</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-caption" />
            <Input placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="mb-4 text-sm text-caption">Đang tải dữ liệu...</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-heading">{u.fullName}</TableCell>
                  <TableCell className="text-body">{u.email}</TableCell>
                  <TableCell className="text-body">{u.phone}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{roleLabels[u.role]}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={u.status.toUpperCase() === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                      {u.status.toUpperCase() === 'ACTIVE' ? 'Hoạt động' : 'Khóa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(u)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => void handleDelete(u.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cập nhật người dùng</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Họ tên</Label><Input value={form.fullName} onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} /></div>
            <div><Label>SĐT</Label><Input value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} /></div>
            <div><Label>Mật khẩu mới (tùy chọn)</Label><Input type="password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} /></div>
            <div>
              <Label>Vai trò</Label>
              <Select value={form.role} onValueChange={v => setForm(prev => ({ ...prev, role: v as AdminUserRow['role'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STAFF">Nhân viên</SelectItem>
                  <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={form.status.toUpperCase()} onValueChange={v => setForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="LOCKED">Khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button disabled={submitting} className="w-full" onClick={() => void handleUpdate()}>Cập nhật</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
