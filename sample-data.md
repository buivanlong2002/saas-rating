# Sample Data for Rating Widget Testing

## Sample 1: Basic Customer Review
```
URL: http://localhost:3000/?lang=en&customerName=John&salonName=Beauty%20Salon%20Pro
```

**Parameters:**
- Language: English (en)
- Customer Name: John
- Salon Name: Beauty Salon Pro

**Expected Behavior:**
- Shows "Hello John, 💬 We'd Love Your Feedback?"
- Language dropdown shows "US"
- All emojis visible and clickable
- Feedback form appears for ratings 1-3
- Review options appear for ratings 4-5

---

## Sample 2: Vietnamese Customer Review
```
URL: http://localhost:3000/?lang=vi&customerName=Mai&salonName=Salon%20Đẹp%20Xinh
```

**Parameters:**
- Language: Vietnamese (vi)
- Customer Name: Mai
- Salon Name: Salon Đẹp Xinh

**Expected Behavior:**
- Shows Vietnamese greeting
- Language dropdown shows "VN"
- All text in Vietnamese
- Same functionality as English version

---

## Sample 3: Spanish Customer Review
```
URL: http://localhost:3000/?lang=es&customerName=Maria&salonName=Salon%20Hermoso
```

**Parameters:**
- Language: Spanish (es)
- Customer Name: Maria
- Salon Name: Salon Hermoso

**Expected Behavior:**
- Shows Spanish greeting
- Language dropdown shows "ES"
- All text in Spanish
- Same functionality as other languages

---

## Testing Scenarios

### 1. Low Rating Test (1-3 stars)
1. Click on emoji 1, 2, or 3
2. Feedback form should appear
3. Enter feedback text
4. Submit feedback
5. Should show thank you message

### 2. High Rating Test (4-5 stars)
1. Click on emoji 4 or 5
2. Review options should appear (Google, Facebook, Yelp)
3. Click on any review platform
4. Should open external review page

### 3. Language Switching Test
1. Click language dropdown
2. Select different language
3. All text should change to selected language
4. Functionality should remain the same

### 4. Responsive Test
1. Test on different screen sizes
2. Mobile: 320px - 480px
3. Tablet: 768px - 1024px
4. Desktop: 1200px+

### 5. Tooltip Test
1. Click on any emoji
2. Tooltip should appear above emoji
3. Tooltip should show rating label in current language
4. Tooltip should be fully visible and readable
