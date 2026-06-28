# Dự Án Demo: Dự Toán Chủ Động (Active Estimating) trên Mô hình BIM 5D

Tài liệu hướng dẫn và mã nguồn phục vụ buổi trình diễn/hội thảo về **Khung lý luận và Kịch bản minh hoạ** cho xu hướng Dự toán chủ động trong quản lý chi phí đầu tư xây dựng.

## 🌟 Tính Năng Nổi Bật

1. **Khung lý luận trực quan**: 
   - Mô hình hoá chuỗi giá trị BIM 5D thành sơ đồ tương tác bấm chọn.
   - Trình duyệt thư viện phân loại **MasterFormat** (Div 03, 05, 08, 09, 31, 32, 34) đồng bộ trực tiếp Đặc tả kỹ thuật & Đơn giá trên cùng một trục định danh.
2. **Kịch bản Demo Dân dụng (NOXH Taseco)**:
   - Mô phỏng nới rộng chiều sâu phòng khách căn hộ điển hình, tự động nhân hệ số lặp lại 50 căn hộ trên toàn dự án.
   - Thay đổi chủng loại vật liệu (cửa Xingfa kính hộp Low-E vs kính thường, đá Granite vs gạch Ceramic) áp lại đơn giá tức thời.
   - So sánh phương án tường gạch vs tấm bê tông nhẹ (giảm vữa trát, tăng diện tích thông thuỷ NSA, tính toán hiệu quả doanh thu gia tăng).
3. **Kịch bản Demo Giao thông (Cao tốc Sài Gòn - Mộc Bài)**:
   - Kéo trắc dọc nâng/hạ cao độ đường đỏ thiết kế, tính toán khối lượng đào đắp phi tuyến.
   - Thay đổi kết cấu mặt đường (Bê tông nhựa vs BTXM) và loại dầm cầu cạn (Dầm Super-T DƯL vs dầm BTCT thường).
   - So sánh phương án đắp nền đất yếu + xử lý bấc thấm PVD vs làm cầu cạn viaduct (phân tích chi phí vòng đời 30 năm gồm xây dựng, đền bù GPMB và bảo trì lún).

## 🛠️ Công Nghệ Sử Dụng

Dự án được xây dựng dưới dạng **Single Page Application (SPA)** thuần chất lượng cao nhằm đảm bảo tính gọn nhẹ, tốc độ và tương thích tối đa:
- **HTML5**: Cấu trúc ngữ nghĩa (Semantic HTML), tối ưu SEO.
- **CSS3**: Thiết kế giao diện tối (Premium Dark Mode), hiệu ứng kính mờ (Glassmorphism), chuyển động mượt mà (Transitions/Animations).
- **Vanilla JS**: Động cơ tính toán toán học dự toán và điều khiển hiển thị.
- **Dynamic SVG**: Vẽ đồ hoạ kỹ thuật 2D động (mặt bằng căn hộ nới rộng, mặt cắt ngang đào đắp nền đường) cập nhật thời gian thực theo thanh trượt.

## 🚀 Hướng Dẫn Sử Dụng

### Cách 1: Mở trực tiếp bằng Trình duyệt (Đơn giản nhất)
Bạn chỉ cần click đúp vào tệp tin [index.html](index.html) hoặc kéo tệp vào trình duyệt (Chrome, Edge, Firefox, Safari) để trải nghiệm toàn bộ tính năng.

### Cách 2: Khởi chạy Máy chủ cục bộ (Local Server)
Nếu bạn có cài đặt Python trên máy, hãy mở Terminal trong thư mục dự án và chạy lệnh sau:
```bash
python -m http.server 8000
```
Sau đó truy cập địa chỉ: `http://localhost:8000` trên trình duyệt.
