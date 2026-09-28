import React from 'react';
import './HomePage.scss';
import { Container, Row, Col } from 'react-bootstrap';

function HomePage() {
  return (
    <Container className="home-page">
      <Row>
        <Col md={12} className="text-center my-5">
          <h1 className="display-4">Chào mừng đến với <strong>Ứng dụng Quản lý Nhân sự</strong></h1>
          <p className="lead">
            Ứng dụng Quản lý Nhân sự là một giải pháp toàn diện giúp doanh nghiệp dễ dàng quản lý và tổ chức 
            thông tin nhân sự một cách hiệu quả. Với giao diện thân thiện và dễ sử dụng, ứng dụng giúp nhà 
            quản lý có thể theo dõi và xử lý tất cả các thao tác liên quan đến quản lý nhân viên, vai trò 
            và dự án một cách nhanh chóng. Được xây dựng trên nền tảng công nghệ tiên tiến, ứng dụng không 
            chỉ hỗ trợ các thao tác cơ bản mà còn mang đến các chức năng mở rộng như quản lý vai trò, phân 
            quyền truy cập và theo dõi dự án một cách chi tiết. 
          </p>
          <p className="lead">
            Với sự kết hợp của <strong>React.js</strong> và <strong>Node.js</strong>, ứng dụng đảm bảo hiệu 
            suất cao và khả năng mở rộng linh hoạt cho các doanh nghiệp từ nhỏ đến lớn. <strong>Sequelize</strong> 
            ORM giúp đơn giản hóa quá trình tương tác với cơ sở dữ liệu <strong>MySQL</strong>, giúp việc quản 
            lý dữ liệu nhân sự trở nên dễ dàng hơn. Thiết kế giao diện sử dụng <strong>Bootstrap</strong> và 
            <strong>SCSS</strong> đảm bảo tính tương thích với mọi loại thiết bị, từ máy tính bàn đến điện 
            thoại di động.
          </p>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <h3>Lợi ích của ứng dụng</h3>
          <p>
            Ứng dụng mang lại nhiều lợi ích cho các nhà quản lý và bộ phận nhân sự. Người dùng có thể tạo 
            hồ sơ nhân viên chi tiết, theo dõi trạng thái công việc của từng nhân viên và quản lý các dự 
            án mà họ tham gia. Việc phân quyền truy cập dựa trên vai trò cũng giúp bảo mật thông tin quan 
            trọng, chỉ những người có thẩm quyền mới có thể truy cập vào các dữ liệu nhạy cảm.
          </p>
          <p>
            Ứng dụng này cũng giúp tăng cường sự minh bạch trong tổ chức, giúp nhà quản lý dễ dàng theo dõi 
            tiến độ công việc của các dự án, đánh giá hiệu suất làm việc của nhân viên, và từ đó đưa ra 
            các quyết định điều chỉnh chiến lược nhân sự phù hợp.
          </p>
        </Col>
        <Col md={6}>
          <h3>Công nghệ và Tính năng</h3>
          <ul>
            <li><strong>React.js</strong> - Công nghệ hiện đại cho việc xây dựng giao diện người dùng.</li>
            <li><strong>Node.js</strong> và <strong>Express</strong> - Xử lý nhanh chóng các yêu cầu từ phía backend.</li>
            <li><strong>Sequelize ORM</strong> - Giúp tương tác dễ dàng với cơ sở dữ liệu <strong>MySQL</strong>.</li>
            <li><strong>SCSS</strong> và <strong>Bootstrap</strong> - Đảm bảo giao diện đáp ứng và trải nghiệm người dùng mượt mà.</li>
            <li><strong>Kiểm soát truy cập theo vai trò</strong> - Phân quyền và quản lý truy cập theo từng vai trò của người dùng.</li>
            <li><strong>Quản lý dự án và nhân sự</strong> - Dễ dàng theo dõi sự tham gia của nhân viên trong từng dự án.</li>
          </ul>
        </Col>
      </Row>
      <Row>
        <Col md={12} className="text-center my-5">
          <p className="lead">
            Khám phá đầy đủ các tính năng và lợi ích của Ứng dụng Quản lý Nhân sự. Với một giao diện trực 
            quan, thân thiện cùng với khả năng mở rộng linh hoạt, ứng dụng này sẽ là công cụ đắc lực giúp 
            doanh nghiệp của bạn quản lý nhân sự một cách hiệu quả nhất.
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;
