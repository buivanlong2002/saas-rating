import React, { useState, useEffect, useRef } from 'react';
import apiService from './services/api';
import './RatingWidget.css';

const LANGUAGES = {
  en: '/lang/lang-en.json',
  vi: '/lang/lang-vi.json',
  es: '/lang/lang-es.json'
};

const RATING_EMOJIS = [
  { value: 1, src: '/images/terrible.png', alt: 'Terrible' },
  { value: 2, src: '/images/bad.png', alt: 'Bad' },
  { value: 3, src: '/images/okay.png', alt: 'Okay' },
  { value: 4, src: '/images/good.png', alt: 'Good' },
  { value: 5, src: '/images/great.png', alt: 'Great' }
];

const TESTIMONIALS = [
    { name: 'Nora S.', initial: 'N', text: "I have never been taught coding this way. The way you guys break it down is so easy, I actually understand this." },
    { name: 'Ralph E.', initial: 'R', text: "The interactive support provided by the AI Buddy is ingenious." },
    { name: 'Velislav B.', initial: 'V', text: "Kodree its great academy. The tasks its good and you make real project while u learning." },
    { name: 'Natalie N.', initial: 'N', text: "Clear course, no adds, no 'water', no hidden payments or some 'must buy to pass to next level'. Interesting course, a lot of practice, theory and links to more materials. Very helpful AI assistant built-in." },
    { name: 'Jane S.', initial: 'J', text: "I love my experience in kodree really helped me out in my journey in being a front end developer and its easy to read and understand concepts...and have a nice community of students in which we help each other out." },
    { name: 'Ayodeji A.', initial: 'A', text: "Well structured, robust and affordable courses. Learn at your own pace and take responsibility for research and digging deeper into topics through additional resources and loads of practice tasks." },
];

const GOOGLE_PLACE_ID = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/your-page';
const YELP_PAGE_URL = 'https://www.yelp.com/biz/your-business';

function RatingWidget() {
  const [langData, setLangData] = useState(null);
  const [customerName, setCustomerName] = useState('Customer');
  const [salonName, setSalonName] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showReviewOptions, setShowReviewOptions] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('idle');
  const reviewOptionsRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const lang = urlParams.get('lang') || 'en';
      
      setCustomerName(urlParams.get('customerName') || 'Customer');
      setSalonName(urlParams.get('salonName') || '');

      try {
        const response = await fetch(LANGUAGES[lang] || LANGUAGES['en']);
        const data = await response.json();
        setLangData(data);
      } catch (error) {
        console.error("Failed to load language file:", error);
        const response = await fetch(LANGUAGES['en']);
        const data = await response.json();
        setLangData(data);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRating === 0) return;

    if (selectedRating <= 3) {
      setShowFeedbackForm(true);
      setShowReviewOptions(false);
    } else if (selectedRating >= 4) {
      setShowFeedbackForm(false);
      submitRatingData(selectedRating, '', true);
      const timer = setTimeout(() => {
          setShowReviewOptions(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedRating]);

  useEffect(() => {
    if (showReviewOptions && reviewOptionsRef.current) {
        reviewOptionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showReviewOptions]);

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
  };

  const submitRatingData = async (rating, feedbackText, redirected) => {
    const reviewToken = localStorage.getItem('reviewToken');
    
    if (!reviewToken) {
      console.error('No review token found');
      return { success: false, message: 'No review token found' };
    }

    try {
      console.log('Submitting review with token:', reviewToken, 'rating:', rating, 'feedback:', feedbackText);
      
      const result = await apiService.submitReview(
        reviewToken,
        rating,
        feedbackText,
        null
      );

      console.log('API result:', result);

      if (result.success) {
        console.log('Review submitted successfully:', result);
        localStorage.removeItem('reviewToken');
        return { success: true, message: result.message };
      } else {
        console.error('API submission failed:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  };
  
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert(langData.pleaseImprove || 'Please tell us how we can improve.');
      return;
    }
    setSubmissionStatus('submitting');
    
    try {
      const result = await submitRatingData(selectedRating, feedback, false);
      
      if (result.success) {
        setSubmissionStatus('submitted');
      } else {
        alert(`Lỗi: ${result.message}`);
        setSubmissionStatus('idle');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
      setSubmissionStatus('idle');
    }
  };

  if (!langData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '16px'
      }}>
        Đang tải...
      </div>
    );
  }

  const getSubmitButtonText = () => {
    if (submissionStatus === 'submitting') return 'Đang gửi...';
    if (submissionStatus === 'submitted') return 'Đã gửi ✓';
    return 'Gửi phản hồi';
  };

  // Success Screen - Mobile Design
  if (submissionStatus === 'submitted') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px 20px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          {/* Success Icon */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
          }}>
            <span style={{ fontSize: '30px', color: 'white' }}>✓</span>
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#2E7D32',
            marginBottom: '15px'
          }}>
            Cảm ơn bạn! 🙏
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#424242',
            lineHeight: '1.5',
            marginBottom: '15px'
          }}>
            Chúng tôi rất trân trọng đánh giá của bạn về dịch vụ tại <strong>{salonName}</strong>.
          </p>

          <div style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              margin: '0',
              fontStyle: 'italic'
            }}>
              💡 <strong>Mẹo:</strong> Hãy chia sẻ trải nghiệm tuyệt vời này với bạn bè và gia đình!
            </p>
          </div>

          <button 
            onClick={() => window.close()} 
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              width: '100%'
            }}
          >
            Đóng trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '25px 20px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '8px',
            lineHeight: '1.3'
          }}>
            {langData.greeting.replace('{customerName}', customerName)}
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#4a5568',
            marginBottom: '5px'
          }}>
            {langData.question}
          </p>
          {salonName && (
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              {salonName}
            </p>
          )}
        </div>

        {/* Rating Section */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '0 10px'
          }}>
            {RATING_EMOJIS.map((rating) => (
              <label key={rating.value} style={{
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '12px',
                minWidth: '60px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="radio"
                  name="rating"
                  value={rating.value}
                  style={{ display: 'none' }}
                  onChange={() => handleRatingChange(rating.value)}
                  checked={selectedRating === rating.value}
                />
                <img
                  src={rating.src}
                  alt={rating.alt}
                  style={{
                    width: '40px',
                    height: '40px',
                    opacity: selectedRating === rating.value ? 1 : 0.4,
                    transform: selectedRating === rating.value ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                />
                {selectedRating === rating.value && (
                  <div style={{
                    position: 'absolute',
                    top: '-35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white',
                    borderRadius: '12px',
                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    whiteSpace: 'nowrap',
                    zIndex: 10
                  }}>
                    {langData.ratingLabels[selectedRating]}
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
        
        {/* Feedback Form */}
        {showFeedbackForm && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <form onSubmit={handleSubmitFeedback}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a202c',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                {langData.feedbackTitle}
              </h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={langData.feedbackPlaceholder}
                maxLength="500"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  background: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#1a202c',
                  fontSize: '14px',
                  resize: 'vertical',
                  marginBottom: '15px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                disabled={submissionStatus !== 'idle'}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '25px',
                  fontWeight: '600',
                  color: 'white',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
              >
                {getSubmitButtonText()}
              </button>
            </form>
          </div>
        )}

        {/* Review Options */}
        {showReviewOptions && (
          <div ref={reviewOptionsRef} style={{
            textAlign: 'center',
            padding: '20px 0'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '20px'
            }}>
              {langData.reviewOptionsTitle}
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <a href={`https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '10px',
                   padding: '12px',
                   borderRadius: '25px',
                   fontWeight: '600',
                   color: 'white',
                   background: '#FFC107',
                   textDecoration: 'none',
                   fontSize: '14px',
                   transition: 'all 0.3s ease'
                 }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>G</span>
                {langData.reviewGoogle}
              </a>
              <a href={FACEBOOK_PAGE_URL}
                 target="_blank"
                 rel="noopener noreferrer"
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '10px',
                   padding: '12px',
                   borderRadius: '25px',
                   fontWeight: '600',
                   color: 'white',
                   background: '#1877F2',
                   textDecoration: 'none',
                   fontSize: '14px',
                   transition: 'all 0.3s ease'
                 }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>f</span>
                {langData.reviewFacebook}
              </a>
              <a href={YELP_PAGE_URL}
                 target="_blank"
                 rel="noopener noreferrer"
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '10px',
                   padding: '12px',
                   borderRadius: '25px',
                   fontWeight: '600',
                   color: 'white',
                   background: '#FF1A1A',
                   textDecoration: 'none',
                   fontSize: '14px',
                   transition: 'all 0.3s ease'
                 }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Y</span>
                {langData.reviewYelp}
              </a>
            </div>
          </div>
        )}

        {/* Testimonials Section */}
        <div style={{ marginTop: '30px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '20px',
            color: '#1a202c'
          }}>
            {langData.testimonialsTitle}
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            {TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
              <div key={index} style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#f8f9fa',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '5px'
                }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#64748b'
                  }}>
                    {testimonial.initial}
                  </span>
                  <span style={{
                    fontWeight: '600',
                    color: '#1a202c',
                    fontSize: '14px'
                  }}>
                    {testimonial.name}
                  </span>
                  <span style={{
                    color: '#fbbf24',
                    fontSize: '14px'
                  }}>
                    ★★★★★
                  </span>
                </div>
                <div style={{
                  color: '#4a5568',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  {testimonial.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RatingWidget;