# Review Token System - Frontend Implementation

## 🎯 Overview

Hệ thống Review Token cho phép khách hàng đánh giá dịch vụ thông qua link token duy nhất. Mỗi token có thể được sử dụng một lần và có thời hạn sử dụng.

## 🚀 Features

### ✅ Đã implement:
- **Review Form Page** (`/review/{token}`) với validation đầy đủ
- **Token Validation** - Kiểm tra format và trạng thái token (32 ký tự hex)
- **Responsive Design** - Mobile-first approach
- **Loading States** - UX tốt với loading spinner
- **Error Handling** - Xử lý lỗi chi tiết và network errors
- **Success Messages** - Thông báo thành công
- **Spring Boot Integration** - Tích hợp hoàn chỉnh với Spring Boot backend
- **Auto-validation** - Tự động xác thực token khi truy cập URL
- **Environment Configuration** - Cấu hình API endpoint linh hoạt
- **Response Transformation** - Chuyển đổi response format từ backend

### 🎨 UI/UX Features:
- Modern gradient design
- Interactive star rating system
- Touch-friendly cho mobile
- Accessibility support
- Smooth animations và transitions

## 📁 Project Structure

```
src/
├── components/
│   ├── ReviewForm.jsx          # Main review form component
│   └── ReviewForm.css          # Styles for review form
├── services/
│   └── api.js                  # API service (mock + real)
├── App.jsx                     # Main app with routing
├── RatingWidget.jsx            # Original rating widget
└── main.jsx                    # App entry point
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm hoặc yarn

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 🧪 Testing the System

### 1. Test Review Form
Truy cập: `http://localhost:5173/review/9022A40B8FED43DCB3643AAE73A93F5D`

### 2. Test Tokens Available:
- **Valid Token 1**: `9022A40B8FED43DCB3643AAE73A93F5D`
- **Valid Token 2**: `A1B2C3D4E5F678901234567890123456`
- **Expired Token**: `B2C3D4E5F67890123456789012345678`
- **Used Token**: `C3D4E5F6789012345678901234567890`

### 3. Test Scenarios:
- ✅ Token hợp lệ → Hiển thị form đánh giá
- ❌ Token không hợp lệ → Hiển thị thông báo lỗi
- ❌ Token đã hết hạn → Hiển thị thông báo lỗi
- ❌ Token sai format → Hiển thị thông báo lỗi
- ❌ Network error → Hiển thị thông báo lỗi kết nối

## 🔧 API Integration

### Spring Boot Backend Integration
Hệ thống đã được tích hợp với Spring Boot backend API. Để cấu hình API endpoint:

1. Tạo file `.env` trong thư mục root
2. Thêm cấu hình: `VITE_API_BASE=https://yourdomain.com/api`
3. Restart development server

### API Configuration Examples:
```bash
# Development (Spring Boot on localhost:8080)
VITE_API_BASE=http://localhost:8080/api

# Production  
VITE_API_BASE=https://api.yourdomain.com

# Staging
VITE_API_BASE=https://staging-api.yourdomain.com
```

### Quick Setup for Development:
1. Đảm bảo Spring Boot backend đang chạy trên `http://localhost:8080`
2. Tạo file `.env.local` trong thư mục root với nội dung:
   ```
   VITE_API_BASE=http://localhost:8080/api
   ```
3. Chạy `npm run dev` để start frontend
4. Truy cập `http://localhost:5173/review/YOUR_TOKEN` để test

### Backend API Endpoints:
- `GET /api/review-tokens/review-info/{token}` - Lấy thông tin form đánh giá
- `POST /api/review-tokens/submit-review` - Gửi đánh giá
- `GET /api/review-tokens/validate/{token}` - Xác thực token
- `POST /api/review-tokens/{token}/use` - Đánh dấu token đã sử dụng

### API Endpoints Required:

#### 1. Get Review Info
```
GET /api/review-tokens/review-info/{token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerName": "Nguyễn Văn A",
    "salonName": "Salon Beauty Pro",
    "visitDate": "2024-01-15",
    "tokenValid": true,
    "tokenStatus": "PENDING"
  }
}
```

#### 2. Submit Review
```
POST /api/review-tokens/submit-review
```

**Request Body:**
```
token=A1B2C3D4E5F67890123456789012345678901234567890&rating=5&feedback=Great service!&reviewType=GENERAL
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "reviewId": "REV_1234567890",
    "submittedAt": "2024-01-15T10:30:00Z"
  }
}
```

## 🎨 Customization

### Colors & Styling
Các màu chính có thể được customize trong CSS files:
- Primary gradient: `#667eea` to `#764ba2`
- Star rating color: `#ffd700`
- Success color: `#28a745`
- Error color: `#dc3545`

### Language Support
Hệ thống hỗ trợ đa ngôn ngữ thông qua file JSON trong thư mục `public/lang/`.

## 📱 Mobile Optimization

- Touch-friendly star rating
- Responsive form layout
- Optimized for mobile screens
- Fast loading times

## 🔒 Security Features

- Token format validation (40 ký tự, chữ hoa + số)
- Token status checking
- Input sanitization
- Rate limiting ready

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📋 TODO List

- [ ] Add real API integration
- [ ] Implement rate limiting
- [ ] Add analytics tracking
- [ ] Create admin dashboard
- [ ] Add email notifications
- [ ] Implement token generation system

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub hoặc liên hệ team development.
