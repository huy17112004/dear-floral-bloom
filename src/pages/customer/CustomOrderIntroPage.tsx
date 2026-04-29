import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Frame, Leaf, Ruler, Sparkles } from 'lucide-react';
import heroImage from '@/assets/custom-order/press-workshop.jpg';
import aboutFrameImage from '@/assets/custom-order/about-frame.jpg';
import layoutGardenImage from '@/assets/custom-order/layout-garden.jpg';
import layoutMoonImage from '@/assets/custom-order/layout-moon.jpg';
import layoutDetailImage from '@/assets/custom-order/layout-detail.jpg';

const productNotes = [
  { icon: Clock, title: 'Thời gian hoàn thành', desc: 'Cần 25–30 ngày để ép khô hoa, dựng demo layout và hoàn thiện khung sau khi khách hàng chốt mẫu.' },
  { icon: Frame, title: 'Chất liệu khung', desc: 'Khung gỗ tần bì màu óc chó, phong cách Bắc Âu sang trọng, có móc treo chắc chắn và bền đẹp.' },
  { icon: Ruler, title: 'Kích thước khung', desc: 'Tùy chọn kích thước từ A4, A3, A2 đến A0 theo bó hoa, không gian treo và ngân sách mong muốn.' },
];

const layouts = [
  { name: 'The Garden', image: layoutGardenImage, desc: 'Phù hợp với bó hoa dáng dài hoặc mix hoa tròn với lá phụ có cành mềm.' },
  { name: 'The Moon', image: layoutMoonImage, desc: 'Dành cho bó hoa có nhiều hoa dáng tròn như hồng, tulip, mẫu đơn.' },
  { name: 'The Glow', image: layoutDetailImage, desc: 'Một bố cục cân bằng giữa hoa chính nổi bật và chuyển động tự nhiên của nhành lá.' },
];

export default function CustomOrderIntroPage() {
  return (
    <div className="bg-sage-light/70">
      <section className="relative mx-auto max-w-[1366px] overflow-hidden bg-sidebar text-sidebar-foreground">
        <div className="flex flex-wrap justify-center gap-4 px-6 py-5 text-xs font-semibold uppercase tracking-[0.18em] md:gap-12 md:text-sm">
          <a href="#layouts" className="border border-sidebar-foreground/40 px-5 py-3 transition hover:bg-sidebar-foreground/10">Sản phẩm & layout</a>
          <a href="#care" className="border border-sidebar-foreground/40 px-5 py-3 transition hover:bg-sidebar-foreground/10">Hướng dẫn bảo quản</a>
          <a href="#start" className="border border-sidebar-foreground/40 px-5 py-3 transition hover:bg-sidebar-foreground/10">Đặt hàng custom</a>
        </div>
        <div className="relative h-[430px] overflow-hidden md:h-[640px]">
          <img src={heroImage} alt="Nghệ nhân Dear Floral đang sắp đặt hoa cưới ép khô trong khung gỗ" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
            <h1 className="font-heading text-6xl font-bold uppercase tracking-[0.12em] text-secondary drop-shadow-lg md:text-8xl lg:text-9xl">Dear Floral</h1>
          </div>
        </div>
        <div className="absolute -bottom-px left-0 h-28 w-full bg-sage-light [clip-path:polygon(0_0,50%_100%,100%_0,100%_100%,0_100%)]" />
      </section>

      <section className="container grid gap-10 py-20 md:grid-cols-[0.95fr_1.05fr] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">Giới thiệu về</p>
          <h2 className="mt-3 font-heading text-4xl font-bold uppercase tracking-[0.08em] text-heading md:text-6xl">Dear Floral</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-body">
            Dear Floral ra đời với sứ mệnh biến bó hoa cưới của riêng bạn thành kỷ niệm vô giá và trường tồn theo thời gian.
          </p>
          <p className="mt-4 max-w-xl leading-relaxed text-body">
            Chúng tôi trân trọng từng bông hoa, từng câu chuyện và sắp đặt chúng thành những khung hoa ép khô thủ công đặc biệt nhất.
          </p>
        </div>
        <div className="grid grid-cols-[0.85fr_1fr] gap-4">
          <div className="mt-12 overflow-hidden rounded-md border border-border bg-card p-3">
            <img src={aboutFrameImage} alt="Khung hoa ép khô Dear Floral hoàn thiện" className="aspect-[4/5] w-full object-cover" loading="lazy" />
          </div>
          <div className="overflow-hidden rounded-md border border-border bg-card p-3">
            <img src={layoutDetailImage} alt="Chi tiết layout hoa ép khô trong khung tranh" className="aspect-[4/5] w-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      <section id="layouts" className="bg-background py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {productNotes.map((note) => (
              <article key={note.title} className="border-l border-primary/30 pl-6">
                <note.icon className="mb-5 h-7 w-7 text-primary" />
                <h3 className="font-heading text-2xl font-semibold text-heading">{note.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-body">{note.desc}</p>
              </article>
            ))}
          </div>

          <div className="mt-20 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">Layout</p>
            <h2 className="mt-3 font-heading text-4xl font-bold text-heading md:text-5xl">8 mẫu layout tham khảo</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-body">
              Các layout giúp cô dâu dễ hình dung bố cục, nhưng mỗi khung vẫn được tinh chỉnh theo dáng hoa thật và câu chuyện riêng.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {layouts.map((layout) => (
              <article key={layout.name} className="group overflow-hidden rounded-md bg-card shadow-sm">
                <div className="overflow-hidden">
                  <img src={layout.image} alt={`Mẫu layout hoa ép khô ${layout.name}`} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-2xl font-semibold uppercase tracking-[0.08em] text-heading">{layout.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-body">{layout.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="care" className="container grid gap-10 py-20 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="overflow-hidden rounded-md border border-border bg-card p-3">
          <img src={layoutGardenImage} alt="Mẫu khung hoa cưới ép khô phong cách tự nhiên" className="aspect-[5/4] w-full object-cover" loading="lazy" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            <Leaf className="h-4 w-4" />
            Hướng dẫn bảo quản
          </div>
          <h2 className="mt-5 font-heading text-4xl font-bold text-heading">Giữ kỷ niệm bền đẹp theo năm tháng</h2>
          <div className="mt-6 space-y-4 text-body">
            <p>Tránh đặt khung dưới ánh nắng trực tiếp hoặc nơi có độ ẩm cao để màu hoa được giữ lâu hơn.</p>
            <p>Lau nhẹ mặt kính bằng khăn mềm khô, không dùng hóa chất mạnh lên bề mặt khung gỗ.</p>
            <p>Mỗi tác phẩm là hoa thật đã qua xử lý thủ công, nên sắc độ tự nhiên có thể thay đổi nhẹ theo thời gian.</p>
          </div>
        </div>
      </section>

      <section id="start" className="bg-sidebar py-20 text-center text-sidebar-foreground">
        <div className="container">
          <Sparkles className="mx-auto mb-5 h-8 w-8 text-secondary" />
          <h2 className="mx-auto max-w-3xl font-heading text-4xl font-bold text-secondary md:text-5xl">Bắt đầu tạo khung hoa cưới của riêng bạn</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-sidebar-foreground/80">
            Chọn khung, gửi ảnh hoa và yêu cầu thiết kế để Dear Floral tư vấn layout phù hợp nhất.
          </p>
          <Link to="/account/custom-orders/create" className="mt-8 inline-block">
            <Button size="lg" className="gap-2 rounded-full px-10">
              Bắt đầu đặt hàng Custom <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}