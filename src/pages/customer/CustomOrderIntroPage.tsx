import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CreditCard, Eye, Frame, Leaf, MessageCircle, Ruler, Sparkles, Upload } from 'lucide-react';
import heroImage from '@/assets/custom-order/press-workshop.jpg';
import aboutFrameImage from '@/assets/custom-order/about-frame.jpg';
import layoutGardenImage from '@/assets/custom-order/layout-garden.jpg';
import layoutMoonImage from '@/assets/custom-order/layout-moon.jpg';
import layoutDetailImage from '@/assets/custom-order/layout-detail.jpg';

const craftNotes = [
  { icon: Clock, label: '25–30 ngày', title: 'Ép khô & hoàn thiện', desc: 'Từ xử lý hoa thật, dựng demo layout đến đóng khung sau khi khách hàng duyệt mẫu.' },
  { icon: Frame, label: 'Gỗ tần bì', title: 'Khung màu óc chó', desc: 'Chất liệu ấm, sang và có móc treo chắc chắn, phù hợp nhiều không gian sống.' },
  { icon: Ruler, label: 'A4 → A0', title: 'Kích thước linh hoạt', desc: 'Tư vấn theo dáng bó hoa, mật độ hoa và vị trí bạn muốn trưng bày tác phẩm.' },
];

const processSteps = [
  { icon: Frame, title: 'Chọn khung', desc: 'Chọn kích thước và chất liệu khung trong nhóm sản phẩm custom.' },
  { icon: Upload, title: 'Gửi hoa', desc: 'Tải ảnh bó hoa thật và mô tả cảm xúc, màu sắc, bố cục mong muốn.' },
  { icon: Eye, title: 'Duyệt demo', desc: 'Dear Floral gửi layout demo để bạn phản hồi trước khi hoàn thiện.' },
  { icon: CreditCard, title: 'Thanh toán', desc: 'Đặt cọc trước, thanh toán phần còn lại sau khi demo được duyệt.' },
];

const layouts = [
  { name: 'The Garden', image: layoutGardenImage, desc: 'Một bố cục có nhịp điệu tự nhiên, hợp với hoa dáng dài và cành lá mềm.' },
  { name: 'The Moon', image: layoutMoonImage, desc: 'Tập trung vào cụm hoa tròn, tạo cảm giác đầy đặn, dịu và trang trọng.' },
  { name: 'The Glow', image: layoutDetailImage, desc: 'Cân bằng giữa hoa chính nổi bật và khoảng thở nhẹ nhàng quanh khung.' },
];

export default function CustomOrderIntroPage() {
  return (
    <div className="bg-background">
      <section className="relative isolate min-h-[calc(100vh-80px)] overflow-hidden bg-sidebar">
        <img
          src={heroImage}
          alt="Bàn làm việc thủ công với hoa cưới, máy ép hoa và khung tranh Dear Floral"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-sidebar/45" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-sidebar to-sidebar/0" />

        <div className="container relative z-10 flex min-h-[calc(100vh-80px)] items-end pb-16 pt-24 md:pb-20">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-secondary/50 bg-sidebar/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-secondary backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Hoa cưới ép khô thủ công
            </div>
            <h1 className="font-heading text-5xl font-bold uppercase leading-[0.95] text-secondary md:text-7xl lg:text-8xl">
              Dear Floral
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-secondary/90 md:text-xl">
              Biến bó hoa cưới của riêng bạn thành một khung ký ức có thể treo lên, nhìn ngắm và giữ lại qua năm tháng.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/account/custom-orders/create">
                <Button size="lg" className="w-full gap-2 rounded-full px-8 sm:w-auto">
                  Bắt đầu đặt hàng Custom <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#layouts">
                <Button size="lg" variant="outline" className="w-full rounded-full border-secondary/60 bg-sidebar/20 px-8 text-secondary hover:bg-secondary hover:text-secondary-foreground sm:w-auto">
                  Xem layout tham khảo
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-sage-light/70 py-20 md:py-28">
        <div className="container grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="relative order-2 md:order-1">
            <div className="absolute -left-6 top-10 hidden h-64 w-40 border border-primary/30 md:block" />
            <div className="relative grid grid-cols-[0.8fr_1fr] gap-4">
              <img src={aboutFrameImage} alt="Khung hoa cưới ép khô Dear Floral đã hoàn thiện" className="mt-14 aspect-[3/4] w-full rounded-md object-cover shadow-sm" loading="lazy" />
              <img src={layoutDetailImage} alt="Chi tiết hoa ép khô được sắp đặt trong khung gỗ" className="aspect-[4/5] w-full rounded-md object-cover shadow-sm" loading="lazy" />
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">Giới thiệu về Dear Floral</p>
            <h2 className="mt-4 max-w-xl font-heading text-4xl font-bold leading-tight text-heading md:text-6xl">
              Một bó hoa đi qua ngày cưới, rồi ở lại như một tác phẩm.
            </h2>
            <div className="mt-7 max-w-2xl space-y-4 text-base leading-relaxed text-body">
              <p>Dear Floral không chỉ ép khô hoa. Chúng tôi đọc dáng hoa, màu sắc và câu chuyện phía sau bó hoa để sắp đặt lại thành một bố cục mềm mại, có nhịp thở.</p>
              <p>Mỗi khung tranh được xử lý thủ công, đủ tinh tế để giữ cảm giác tự nhiên của hoa thật nhưng vẫn có sự chỉn chu của một món đồ lưu niệm premium.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {craftNotes.map((note) => {
              const Icon = note.icon;
              return (
                <article key={note.title} className="border-t border-border pt-6">
                  <div className="mb-7 flex items-center justify-between gap-4">
                    <Icon className="h-7 w-7 text-primary" />
                    <span className="font-heading text-2xl font-semibold text-accent">{note.label}</span>
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-heading">{note.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-body">{note.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="layouts" className="bg-surface-warm py-20 md:py-28">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">Layout tham khảo</p>
              <h2 className="mt-4 font-heading text-4xl font-bold text-heading md:text-5xl">Bố cục được chọn theo dáng hoa thật</h2>
            </div>
            <p className="max-w-2xl leading-relaxed text-body md:justify-self-end">
              Các mẫu layout là điểm bắt đầu để hình dung tinh thần tác phẩm. Khi vào đơn custom, Dear Floral vẫn tinh chỉnh theo từng bông hoa, độ cong cành lá và cảm xúc bạn muốn giữ lại.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {layouts.map((layout, index) => (
              <article key={layout.name} className={index === 1 ? 'md:mt-12' : ''}>
                <div className="overflow-hidden rounded-md bg-card shadow-sm">
                  <img src={layout.image} alt={`Layout hoa ép khô ${layout.name}`} className="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
                </div>
                <div className="mt-5 border-l border-primary/40 pl-5">
                  <h3 className="font-heading text-3xl font-semibold text-heading">{layout.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">{layout.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div className="md:sticky md:top-24">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">Quy trình đặt custom</p>
            <h2 className="mt-4 font-heading text-4xl font-bold text-heading md:text-5xl">Rõ ràng từng bước, vẫn đủ mềm mại cho sáng tạo.</h2>
            <Link to="/account/custom-orders/create" className="mt-8 inline-block">
              <Button size="lg" className="gap-2 rounded-full px-8">
                Vào trang đặt hàng <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-5">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="grid grid-cols-[3.5rem_1fr] gap-5 border-b border-border pb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-caption">Bước {index + 1}</p>
                    <h3 className="mt-1 font-heading text-2xl font-semibold text-heading">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-body">{step.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-sage-light/70 py-20 md:py-28">
        <div className="container grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <img src={layoutGardenImage} alt="Khung hoa cưới ép khô được bảo quản trong không gian sáng dịu" className="aspect-[5/4] w-full rounded-md object-cover shadow-sm" loading="lazy" />
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <Leaf className="h-4 w-4" />
              Bảo quản tác phẩm
            </div>
            <h2 className="mt-5 font-heading text-4xl font-bold text-heading">Để hoa khô giữ được vẻ đẹp tự nhiên lâu hơn</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-body">
              <p>Đặt khung ở nơi khô thoáng, tránh nắng trực tiếp và tránh khu vực có độ ẩm cao.</p>
              <p>Lau mặt kính bằng khăn mềm khô. Không dùng hóa chất mạnh trên bề mặt khung gỗ.</p>
              <p>Vì là hoa thật, sắc độ có thể chuyển nhẹ theo thời gian — đó cũng là một phần vẻ đẹp của ký ức tự nhiên.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="start" className="relative overflow-hidden bg-sidebar py-20 text-sidebar-foreground md:py-28">
        <div className="container relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
              <MessageCircle className="h-4 w-4" />
              Bắt đầu tư vấn
            </div>
            <h2 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-secondary md:text-6xl">Sẵn sàng giữ lại bó hoa của bạn?</h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-sidebar-foreground/80">Tạo đơn custom để chọn khung, gửi ảnh hoa và mô tả mong muốn. Dear Floral sẽ tiếp nhận và tư vấn bước tiếp theo.</p>
          </div>
          <Link to="/account/custom-orders/create">
            <Button size="lg" className="w-full gap-2 rounded-full px-10 md:w-auto">
              Đặt hàng Custom <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}