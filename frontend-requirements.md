# Frontend Requirements - Review Token System

## 🎯 **1. Review Form Page** (`/review/{token}`)

### **URL Pattern:**
```
https://yourdomain.com/review/A1B2C3D4E5F67890123456789012345678901234567890
```

### **Features cần implement:**

#### **A. Auto-load Review Info**
```javascript
// Khi page load, tự động lấy thông tin từ token
const token = window.location.pathname.split('/').pop(); // Lấy token từ URL

// API call để lấy thông tin form
const response = await fetch(`/api/review-tokens/review-info/${token}`);
const data = await response.json();

if (data.success) {
    // Populate form với thông tin từ API
    document.getElementById('customerName').textContent = data.data.customerName;
    document.getElementById('salonName').textContent = data.data.salonName;
    document.getElementById('visitDate').textContent = formatDate(data.data.visitDate);
    // ... populate các field khác
}
```

#### **B. Form Fields**
```html
<form id="reviewForm">
    <!-- Thông tin hiển thị (read-only) -->
    <div class="info-section">
        <h3>Thông tin chuyến thăm</h3>
        <p><strong>Khách hàng:</strong> <span id="customerName"></span></p>
        <p><strong>Salon:</strong> <span id="salonName"></span></p>
        <p><strong>Ngày thăm:</strong> <span id="visitDate"></span></p>
    </div>

    <!-- Form đánh giá -->
    <div class="rating-section">
        <h3>Đánh giá của bạn</h3>
        
        <!-- Rating stars -->
        <div class="rating-stars">
            <input type="radio" name="rating" value="5" id="star5">
            <label for="star5">★</label>
            <input type="radio" name="rating" value="4" id="star4">
            <label for="star4">★</label>
            <input type="radio" name="rating" value="3" id="star3">
            <label for="star3">★</label>
            <input type="radio" name="rating" value="2" id="star2">
            <label for="star2">★</label>
            <input type="radio" name="rating" value="1" id="star1">
            <label for="star1">★</label>
        </div>

        <!-- Feedback text -->
        <textarea 
            name="feedback" 
            placeholder="Chia sẻ trải nghiệm của bạn..."
            rows="4"
            required
        ></textarea>

        <!-- Review type -->
        <select name="reviewType" required>
            <option value="">Chọn loại đánh giá</option>
            <option value="GENERAL">Đánh giá chung</option>
            <option value="SERVICE">Dịch vụ</option>
            <option value="STAFF">Nhân viên</option>
            <option value="FACILITY">Cơ sở vật chất</option>
        </select>

        <!-- Hidden token field -->
        <input type="hidden" name="token" id="tokenInput">
    </div>

    <button type="submit" class="submit-btn">Gửi đánh giá</button>
</form>
```

#### **C. Submit Logic**
```javascript
document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const token = document.getElementById('tokenInput').value;
    
    try {
        const response = await fetch('/api/review-tokens/submit-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                token: token,
                rating: formData.get('rating'),
                feedback: formData.get('feedback'),
                reviewType: formData.get('reviewType')
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Hiển thị success message
            showSuccessMessage('Cảm ơn bạn đã đánh giá!');
            // Disable form
            disableForm();
        } else {
            showErrorMessage(result.message);
        }
    } catch (error) {
        showErrorMessage('Có lỗi xảy ra, vui lòng thử lại');
    }
});
```

#### **D. Error Handling**
```javascript
// Kiểm tra token validity
if (!data.data.tokenValid) {
    showErrorMessage('Link đánh giá không hợp lệ hoặc đã hết hạn');
    disableForm();
    return;
}

// Kiểm tra token status
if (data.data.tokenStatus !== 'PENDING') {
    showErrorMessage('Link đánh giá đã được sử dụng hoặc đã hết hạn');
    disableForm();
    return;
}
```

---

## 🎨 **2. UI/UX Requirements**

### **A. Responsive Design**
- Mobile-first approach
- Tablet và desktop friendly
- Touch-friendly cho mobile

### **B. Loading States**
```javascript
// Show loading khi đang fetch data
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('reviewForm').style.display = 'none';
}

// Hide loading khi có data
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('reviewForm').style.display = 'block';
}
```

### **C. Success/Error Messages**
```javascript
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-icon">✅</div>
        <h3>Cảm ơn bạn!</h3>
        <p>${message}</p>
    `;
    document.body.appendChild(successDiv);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-icon">❌</div>
        <h3>Lỗi</h3>
        <p>${message}</p>
    `;
    document.body.appendChild(errorDiv);
}
```

---

## 🔧 **3. Technical Requirements**

### **A. API Integration**
```javascript
// Base API URL
const API_BASE = 'https://yourdomain.com/api';

// API endpoints
const ENDPOINTS = {
    REVIEW_INFO: '/review-tokens/review-info',
    SUBMIT_REVIEW: '/review-tokens/submit-review'
};
```

### **B. Token Validation**
```javascript
// Validate token format (32 ký tự hex)
function isValidTokenFormat(token) {
    return token && token.length === 32 && /^[A-F0-9]+$/i.test(token);
}

// Extract token from URL
function getTokenFromURL() {
    const pathSegments = window.location.pathname.split('/');
    const token = pathSegments[pathSegments.length - 1];
    return isValidTokenFormat(token) ? token : null;
}
```

### **C. Form Validation**
```javascript
function validateForm() {
    const rating = document.querySelector('input[name="rating"]:checked');
    const feedback = document.querySelector('textarea[name="feedback"]').value.trim();
    const reviewType = document.querySelector('select[name="reviewType"]').value;

    if (!rating) {
        showErrorMessage('Vui lòng chọn số sao đánh giá');
        return false;
    }

    if (!feedback) {
        showErrorMessage('Vui lòng nhập nội dung đánh giá');
        return false;
    }

    if (!reviewType) {
        showErrorMessage('Vui lòng chọn loại đánh giá');
        return false;
    }

    return true;
}
```

---

## 📱 **4. Mobile Optimization**

### **A. Touch-friendly Rating**
```css
.rating-stars label {
    font-size: 2rem;
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.2s;
}

.rating-stars label:hover,
.rating-stars input:checked ~ label {
    color: #ffd700;
}
```

### **B. Mobile Form Layout**
```css
@media (max-width: 768px) {
    .review-form {
        padding: 1rem;
        margin: 0;
    }
    
    .rating-stars label {
        font-size: 2.5rem;
        padding: 0.75rem;
    }
    
    textarea {
        min-height: 120px;
    }
}
```

---

## 🚀 **5. Implementation Steps**

### **Step 1: Create Review Page**
1. Tạo route `/review/:token`
2. Implement token extraction từ URL
3. Add loading state

### **Step 2: API Integration**
1. Implement `getReviewFormInfo` API call
2. Handle success/error responses
3. Populate form data

### **Step 3: Form Implementation**
1. Create rating stars component
2. Add form validation
3. Implement submit logic

### **Step 4: Error Handling**
1. Token validation
2. Network error handling
3. User-friendly error messages

### **Step 5: UI Polish**
1. Responsive design
2. Loading states
3. Success/error animations

---

## 📋 **6. Testing Checklist**

- [ ] Token extraction từ URL path
- [ ] API call để lấy review info
- [ ] Form validation
- [ ] Submit review functionality
- [ ] Error handling (invalid token, expired token, network errors)
- [ ] Success message display
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Form disable sau khi submit thành công

---

## 🔗 **7. Example Implementation**

Xem file `example-review-page.html` để có implementation mẫu hoàn chỉnh.

## 📝 **8. Additional Notes**

### **Security Considerations:**
- Validate token format (32 ký tự hex) trước khi gọi API
- Implement rate limiting cho form submission
- Sanitize user input trước khi gửi lên server

### **Performance Optimization:**
- Lazy load components khi cần thiết
- Optimize images và assets
- Implement caching cho static resources

### **Accessibility:**
- Add proper ARIA labels
- Ensure keyboard navigation
- Provide alt text cho images
- Maintain proper color contrast ratios
