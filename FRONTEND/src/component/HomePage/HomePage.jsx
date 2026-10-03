import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.scss';
import { UserContext } from '../../context/UserContext';

const featureCards = [
  {
    accent: 'primary',
    icon: '◎',
    title: 'Hồ sơ nhân sự 360°',
    text: 'Quản lý tập trung toàn bộ lý lịch nhân viên, quá trình thăng tiến, phụ cấp, hợp đồng lao động và chứng chỉ chuyên môn trên một không gian bảo mật.',
    meta: 'Tra cứu tức thì',
  },
  {
    accent: 'secondary',
    icon: '▣',
    title: 'Kiểm soát truy cập (RBAC)',
    text: 'Bảo mật tuyệt đối thông qua hệ thống phân quyền ma trận linh hoạt theo phòng ban, chi nhánh, chức vụ quản lý và mức độ nhạy cảm dữ liệu.',
    meta: 'Tiêu chuẩn bảo mật ISO',
  },
  {
    accent: 'tertiary',
    icon: '◈',
    title: 'Dự án & Phân bổ Nguồn lực',
    text: 'Giám sát sát sao tiến độ bàn giao, phân công nhiệm vụ chi tiết cho từng thành viên, cảnh báo quá tải công việc và tối ưu hóa năng suất nhóm.',
    meta: 'Tối ưu năng suất',
  },
  {
    accent: 'primary-soft',
    icon: '◍',
    title: 'Đánh giá Hiệu suất & KPI',
    text: 'Hệ thống đánh giá định kỳ 360 độ, theo dõi mục tiêu OKRs minh bạch, cung cấp biểu đồ so sánh chu kỳ hỗ trợ ban giám đốc ra quyết định khen thưởng.',
    meta: 'Mục tiêu OKRs rõ ràng',
  },
  {
    accent: 'tertiary-soft',
    icon: '◐',
    title: 'Chấm công & Nghỉ phép Tự động',
    text: 'Tích hợp điểm danh GPS, QR Code và máy chấm công sinh trắc học. Phê duyệt đơn xin nghỉ phép, làm việc từ xa (WFH) chỉ với 1 chạm qua app di động.',
    meta: 'Tự động tính công',
  },
  {
    accent: 'secondary-soft',
    icon: '◔',
    title: 'Báo cáo & Phân tích Đa chiều',
    text: 'Trực quan hóa chi phí quỹ lương, biến động nhân sự (turnover rate), tỷ lệ gắn kết và dự báo nhu cầu tuyển dụng qua dashboard thông minh tự xuất bản.',
    meta: 'Dữ liệu dự báo AI',
  },
];

const partnerItems = ['React.js', 'Node.js', 'MySQL', 'Sequelize', 'Docker', 'AWS Cloud'];

const techPillars = [
  {
    title: 'React.js Single-Page',
    text: 'Giao diện phản hồi siêu tốc, trải nghiệm mượt mà không độ trễ, tối ưu hóa quản lý trạng thái phức tạp và thao tác dữ liệu bảng biểu lớn.',
    tone: 'primary',
  },
  {
    title: 'Node.js & Express',
    text: 'Xử lý backend bất đồng bộ chịu tải cao, hệ thống RESTful & GraphQL APIs được mã hóa bảo mật toàn diện cho doanh nghiệp.',
    tone: 'tertiary',
  },
  {
    title: 'Sequelize ORM & MySQL',
    text: 'Cơ sở dữ liệu quan hệ mạnh mẽ, lập chỉ mục tự động, tối ưu hóa tốc độ truy vấn báo cáo tổng hợp nhân sự quy mô lớn.',
    tone: 'secondary',
  },
  {
    title: 'Responsive & Cross-Platform',
    text: 'Tương thích hoàn hảo 100% trên PC, Tablet và Mobile. Nhân viên và ban quản lý có thể truy cập vận hành từ bất kỳ đâu.',
    tone: 'neutral',
  },
];

function HomePage() {
  const { user } = useContext(UserContext);
  const primaryAction = user && user.isAuthenticated ? '/users' : '/register';
  const secondaryAction = user && user.isAuthenticated ? '/roles' : '/login';

  return (
    <div className="home-page">
      <div className="home-page__glow home-page__glow--one" />
      <div className="home-page__glow home-page__glow--two" />
      <div className="home-page__glow home-page__glow--three" />

      <section className="home-page__hero">
        <div className="home-page__hero-content">
          <div className="home-page__badge">
            <span className="home-page__badge-dot" />
            <span>Giải pháp Quản trị nhân sự thế hệ mới</span>
          </div>

          <h1>Hệ thống Quản lý Nhân sự cho Doanh nghiệp</h1>

          <p className="home-page__lead">
            Đơn giản hóa quản lý hồ sơ nhân viên, phân quyền bảo mật nhiều lớp, tự động hóa chấm công và điều phối dự án
            chuẩn xác chỉ trên một nền tảng duy nhất.
          </p>

          <div className="home-page__cta-group">
            <Link className="home-page__button home-page__button--primary" to={primaryAction}>
              <span>{user && user.isAuthenticated ? 'Vào hệ thống' : 'Khám phá ngay / Đăng ký'}</span>
              <span className="home-page__button-arrow">→</span>
            </Link>
            <Link className="home-page__button home-page__button--secondary" to={secondaryAction}>
              {user && user.isAuthenticated ? 'Quản lý' : 'Đăng nhập'}
            </Link>
          </div>

          <div className="home-page__social-proof">
            <div className="home-page__avatar-stack" aria-label="Nhân sự tin dùng hệ thống">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80"
                alt="Avatar 1"
              />
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80"
                alt="Avatar 2"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
                alt="Avatar 3"
              />
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80"
                alt="Avatar 4"
              />
              <span className="home-page__avatar-more">+1.2k</span>
            </div>

            <div className="home-page__rating-block">
              <div className="home-page__stars" aria-label="Xếp hạng 4.9/5">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <div className="home-page__rating-text">
                <strong>4.9/5</strong>
                <span>Được tin dùng bởi hơn 1,200+ doanh nghiệp tại Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        <div className="home-page__hero-visual" aria-label="Bảng điều khiển HR dashboard preview">
          <div className="home-page__dashboard-shell">
            <div className="home-page__dashboard-bar">
              <span className="home-page__window-dot home-page__window-dot--red" />
              <span className="home-page__window-dot home-page__window-dot--yellow" />
              <span className="home-page__window-dot home-page__window-dot--green" />
            </div>

            <div className="home-page__dashboard-body">
              <div className="home-page__dashboard-panel home-page__dashboard-panel--wide">
                <div className="home-page__mini-stat">
                  <span className="home-page__mini-label">Doanh nghiệp</span>
                  <strong>1,284</strong>
                </div>
                <div className="home-page__mini-stat">
                  <span className="home-page__mini-label">Nhân sự</span>
                  <strong>24.7K</strong>
                </div>
                <div className="home-page__mini-stat">
                  <span className="home-page__mini-label">Tăng trưởng</span>
                  <strong>+18.4%</strong>
                </div>
              </div>

              <div className="home-page__dashboard-grid">
                <div className="home-page__metric-box home-page__metric-box--primary">
                  <span>Đánh giá KPI</span>
                  <strong>92.8%</strong>
                </div>
                <div className="home-page__metric-box home-page__metric-box--cyan">
                  <span>Chấm công</span>
                  <strong>98.6%</strong>
                </div>
                <div className="home-page__metric-box home-page__metric-box--purple">
                  <span>Team hoạt động</span>
                  <strong>47 nhóm</strong>
                </div>
                <div className="home-page__metric-box home-page__metric-box--dark">
                  <span>Phê duyệt</span>
                  <strong>1,209</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-page__partners">
        <p>Được thiết kế dựa trên tiêu chuẩn kiến trúc hiện đại và tin cậy</p>
        <div className="home-page__partners-list" aria-label="Công nghệ sử dụng">
          {partnerItems.map((item) => (
            <div key={item} className="home-page__partner-item">
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-page__features">
        <div className="home-page__section-header">
          <span className="home-page__section-tag">Tính năng cốt lõi vượt trội</span>
          <h2>Giải quyết mọi bài toán quản trị nhân sự từ đơn giản đến chuyên sâu</h2>
          <p>
            Kiến trúc hướng Module giúp doanh nghiệp tùy biến linh hoạt, số hóa 100% tài liệu và vận hành nhân sự tinh gọn.
          </p>
        </div>

        <div className="home-page__feature-grid">
          {featureCards.map((card) => (
            <article key={card.title} className={`home-page__feature-card home-page__feature-card--${card.accent}`}>
              <div className="home-page__feature-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <div className="home-page__feature-link">
                <span>{card.meta}</span>
                <span className="home-page__feature-arrow">→</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-page__architecture">
        <div className="home-page__architecture-copy">
          <span className="home-page__section-kicker">Kiến trúc Công nghệ Bền vững</span>
          <h2>Nền tảng vận hành chuẩn Enterprise, mở rộng không giới hạn</h2>
          <p>
            HRMaster được thiết kế theo mô hình Microservices hiện đại, tối ưu hóa tốc độ phản hồi dưới 100ms và chịu tải
            đồng thời hàng trăm nghìn truy vấn nhân sự phức tạp.
          </p>

          <div className="home-page__stat-row">
            <div>
              <strong>99.95%</strong>
              <span>Cam kết Uptime SLA</span>
            </div>
            <div className="home-page__stat-divider" />
            <div>
              <strong>&lt; 85ms</strong>
              <span>Thời gian phản hồi API</span>
            </div>
          </div>
        </div>

        <div className="home-page__architecture-cards">
          {techPillars.map((pillar) => (
            <div key={pillar.title} className={`home-page__pillar-card home-page__pillar-card--${pillar.tone}`}>
              <div className="home-page__pillar-icon">{pillar.title.slice(0, 1)}</div>
              <h4>{pillar.title}</h4>
              <p>{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-page__cta-banner">
        <div className="home-page__cta-content">
          <span className="home-page__cta-badge">Sẵn sàng tăng tốc chuyển đổi số</span>
          <h2>Sẵn sàng nâng tầm chuyển đổi số quản trị nhân sự cho doanh nghiệp?</h2>
          <p>
            Gia nhập cộng đồng hơn 1,200+ doanh nghiệp hàng đầu đang tăng tốc vận hành và cắt giảm 60% thời gian xử lý thủ
            tục giấy tờ cùng HRMaster.
          </p>
          <div className="home-page__cta-actions">
            <Link className="home-page__button home-page__button--primary home-page__button--light" to={primaryAction}>
              <span>{user && user.isAuthenticated ? 'Vào hệ thống' : 'Bắt đầu dùng thử miễn phí 14 ngày'}</span>
              <span className="home-page__button-arrow">→</span>
            </Link>
            <Link className="home-page__button home-page__button--secondary home-page__button--ghost" to={secondaryAction}>
              Liên hệ tư vấn giải pháp
            </Link>
          </div>
          <div className="home-page__trust-list">
            <span>✓ Không cần thẻ tín dụng</span>
            <span>✓ Hỗ trợ di chuyển dữ liệu 1:1</span>
          </div>
        </div>
      </section>

      <footer className="home-page__footer">
        <div className="home-page__footer-grid">
          <div className="home-page__footer-brand">
            <div className="home-page__brand-mark">HR</div>
            <p>Nền tảng vận hành và quản trị nhân sự thế hệ mới. Đơn giản hóa quy trình, tối đa hóa năng suất tổ chức.</p>
          </div>

          <div className="home-page__footer-column">
            <h4>Sản phẩm</h4>
            <ul>
              <li>Tính năng</li>
              <li>Báo cáo nhân sự</li>
              <li>Chấm công &amp; Nghỉ phép</li>
              <li>Phân quyền đa tầng</li>
            </ul>
          </div>

          <div className="home-page__footer-column">
            <h4>Giải pháp</h4>
            <ul>
              <li>Doanh nghiệp vừa và nhỏ</li>
              <li>Nhà máy / Dịch vụ</li>
              <li>Thương mại điện tử</li>
              <li>Khởi nghiệp </li>
            </ul>
          </div>

          <div className="home-page__footer-column">
            <h4>Tài nguyên</h4>
            <ul>
              <li>Blog</li>
              <li>Hướng dẫn</li>
              <li>Case study</li>
              <li>Liên hệ</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
