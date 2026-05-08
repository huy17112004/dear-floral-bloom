import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flower2 } from 'lucide-react';
import { authApi } from '@/api';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await authApi.login({ email, password });
      const normalizedRole = response.data?.role?.toLowerCase();

      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      if (normalizedRole) {
        localStorage.setItem('role', normalizedRole);
      }

      toast.success('Đăng nhập thành công');
      if (normalizedRole === 'staff') {
        navigate('/staff/dashboard');
        return;
      }
      if (normalizedRole === 'admin') {
        navigate('/admin/dashboard');
        return;
      }
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center mb-8">
          <Flower2 className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="font-heading text-2xl font-bold text-heading">Đăng nhập</h1>
          <p className="mt-1 text-sm text-body">Chào mừng bạn quay lại Dear Floral</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-8">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              className="mt-1"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Mật khẩu</Label>
            <Input
              type="password"
              placeholder="••••••••"
              className="mt-1"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full rounded-full">
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
          <p className="text-center text-sm text-body">
            Chưa có tài khoản?{' '}
            <Link to="/auth/register" className="text-primary hover:underline font-medium">Đăng ký</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
