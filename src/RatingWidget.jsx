import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from './services/api';
import './RatingWidget.css';

const LANGUAGES = {
  en: '/lang/lang-en.json',
  vi: '/lang/lang-vi.json',
  es: '/lang/lang-es.json'
};

const LANGUAGE_NAMES = {
  en: 'English',
  vi: 'Tiếng Việt',
  es: 'Español'
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
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/your-page'; // Thay thế bằng URL Facebook page thực tế
const YELP_PAGE_URL = 'https://www.yelp.com/biz/your-business'; // Thay thế bằng URL Yelp page thực tế

function RatingWidget() {
  const [langData, setLangData] = useState(null);
  const [currentLang, setCurrentLang] = useState('en');
  const [customerName, setCustomerName] = useState('Customer');
  const [salonName, setSalonName] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showReviewOptions, setShowReviewOptions] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('idle');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const reviewOptionsRef = useRef(null);
  const languageDropdownRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const lang = urlParams.get('lang') || 'en';
      
      // Sử dụng thông tin từ URL parameters hoặc mặc định
      setCustomerName(urlParams.get('customerName') || 'Customer');
      setSalonName(urlParams.get('salonName') || '');
      setCurrentLang(lang);

      await loadLanguageData(lang);
    };

    fetchInitialData();
  }, []);

  const loadLanguageData = async (lang) => {
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

  const handleLanguageChange = async (newLang) => {
    setCurrentLang(newLang);
    setShowLanguageDropdown(false);
    await loadLanguageData(newLang);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedRating === 0) return;

    if (selectedRating <= 3) {
      setShowFeedbackForm(true);
      setShowReviewOptions(false);
    } else if (selectedRating >= 4) {
      // For "Good" (4) and "Great" (5) ratings, show only review options
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

  const showNotification = (message, type = 'error') => {
    const toastOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
      default:
        toast.error(message, toastOptions);
        break;
    }
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
  };

  const submitRatingData = async (rating, feedbackText, redirected) => {
    // Lấy token từ localStorage
    const reviewToken = localStorage.getItem('reviewToken');
    
    if (!reviewToken) {
      console.error('No review token found');
      showNotification(langData.notifications?.tokenNotFound || 'Review token not found. Please try again.', 'error');
      return { success: false, message: 'No review token found' };
    }

    try {
      console.log('Submitting review with token:', reviewToken, 'rating:', rating, 'feedback:', feedbackText);
      
      // Gọi API submit review thực tế
      const result = await apiService.submitReview(
        reviewToken,
        rating,
        feedbackText,
        null // Để backend sử dụng mặc định
      );

      console.log('API result:', result);

      if (result.success) {
        console.log('Review submitted successfully:', result);
        // Clear localStorage sau khi submit thành công
        localStorage.removeItem('reviewToken');
        return { success: true, message: result.message };
      } else {
        console.error('API submission failed:', result.message);
        showNotification(`Lỗi: ${result.message}`, 'error');
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('API Error:', error);
      showNotification(langData.notifications?.apiError || 'An error occurred while connecting to the server. Please try again.', 'error');
      return { success: false, message: error.message };
    }
  };
  
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      showNotification(langData.notifications?.validationError || langData.pleaseImprove || 'Please tell us how we can improve.', 'warning');
      return;
    }
    setSubmissionStatus('submitting');
    
    try {
      const result = await submitRatingData(selectedRating, feedback, false);
      
      if (result.success) {
        setSubmissionStatus('submitted');
        // Không cần alert nữa, sẽ hiển thị UI cảm ơn
      } else {
        setSubmissionStatus('idle');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showNotification(langData.notifications?.submitError || 'An error occurred while submitting your review. Please try again.', 'error');
      setSubmissionStatus('idle');
    }
  };

  if (!langData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const getSubmitButtonText = () => {
    if (submissionStatus === 'submitting') return langData.submitting || 'Submitting...';
    if (submissionStatus === 'submitted') return langData.submitted || 'Submitted ✓';
    return langData.submitFeedback || 'Submit Feedback';
  };

  // Hiển thị màn hình cảm ơn khi đã submit thành công
  if (submissionStatus === 'submitted') {
    return (
      <div className="rating-widget" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafbfd', padding: '1rem' }}>
        <div className="container" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '16px', background: '#ebeef5', padding: '4px' }}>
          <div className="content" style={{ padding: '3rem', borderRadius: '16px', background: 'white', border: '2px solid #d9dfed', textAlign: 'center' }}>
            
            {/* Icon cảm ơn */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #4CAF50, #45a049)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}>
                <span style={{ fontSize: '40px', color: 'white' }}>✓</span>
              </div>
            </div>

            {/* Tiêu đề cảm ơn */}
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#2E7D32', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Cảm ơn bạn! 🙏
            </h1>

            {/* Nội dung cảm ơn */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ 
                fontSize: '18px', 
                color: '#424242', 
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                Chúng tôi rất trân trọng đánh giá của bạn về dịch vụ tại <strong>{salonName}</strong>.
              </p>
              
              <p style={{ 
                fontSize: '16px', 
                color: '#666', 
                lineHeight: '1.5'
              }}>
                Phản hồi của bạn sẽ giúp chúng tôi cải thiện chất lượng dịch vụ và mang đến trải nghiệm tốt hơn cho tất cả khách hàng.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-widget" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafbfd', padding: '1rem' }}>
      {/* React Toastify Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />

      <div className="container" style={{ maxWidth: '1024px', width: '100%', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '16px', background: '#ebeef5', padding: '4px' }}>
        <div className="content" style={{ padding: '3rem', borderRadius: '16px', background: 'white', border: '2px solid #d9dfed', position: 'relative' }}>
          
          {/* Language Selector */}
          <div ref={languageDropdownRef} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #d9dfed',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: '#131316',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <span>🌐</span>
              <span>{LANGUAGE_NAMES[currentLang]}</span>
              <span style={{ 
                transform: showLanguageDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▼
              </span>
            </button>
            
            {showLanguageDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'white',
                border: '1px solid #d9dfed',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                minWidth: '120px',
                marginTop: '4px',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      background: currentLang === code ? '#f3f4f6' : 'transparent',
                      color: currentLang === code ? '#7852f4' : '#131316',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      borderBottom: code !== Object.keys(LANGUAGE_NAMES).slice(-1)[0] ? '1px solid #f3f4f6' : 'none'
                    }}
                    onMouseOver={(e) => {
                      if (currentLang !== code) {
                        e.target.style.background = '#f9fafb';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentLang !== code) {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="header" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <h1 className="greeting" style={{ fontSize: '24px', fontWeight: '600', color: '#131316', marginBottom: '8px' }}>
              {langData.greeting.replace('{customerName}', customerName)}
            </h1>
            <p className="question" style={{ fontSize: '18px', color: '#131316', marginBottom: '4px' }}>{langData.question}</p>
          </div>

          <div className="rating-section" style={{ marginBottom: '0' }}>
            <div className="stars-container" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px', position: 'relative' }}>
              {RATING_EMOJIS.map((rating) => (
                <label key={rating.value} className="star-button" style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', minWidth: '80px', position: 'relative' }}>
                  <input
                    type="radio"
                    name="rating"
                    value={rating.value}
                    style={{ display: 'none' }}
                    onChange={() => handleRatingChange(rating.value)}
                    checked={selectedRating === rating.value}
                  />
                  <img
                    className="emoji"
                    src={rating.src}
                    alt={rating.alt}
                    style={{
                      width: '32px',
                      height: 'auto',
                      opacity: selectedRating === rating.value ? 1 : 0.4,
                      transform: selectedRating === rating.value ? 'scale(1.2)' : 'scale(1)',
                      transition: 'opacity 0.3s, transform 0.3s'
                    }}
                  />
                  {selectedRating === rating.value && (
                                         <div className="rating-tooltip" style={{ 
                       position: 'absolute', 
                       top: '-48px', 
                       left: '50%', 
                       transform: 'translateX(-50%)', 
                       padding: '8px 16px', 
                       fontSize: '16px', 
                       fontWeight: '600', 
                       color: 'white', 
                       borderRadius: '16px', 
                       border: '1px solid #a78bfa', 
                       zIndex: 30, 
                       whiteSpace: 'nowrap',
                       background: 'linear-gradient(90deg,#a78bfa 0%,#fbc2eb 100%)', 
                       boxShadow: '0 4px 16px 0 rgba(167,139,250,0.12)'
                     }}>
                      {langData.ratingLabels[selectedRating]}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
          
          {showFeedbackForm && (
            <div className="feedback-form" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', marginTop: '32px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.5s ease-in-out' }}>
              <form onSubmit={handleSubmitFeedback}>
                <h3 className="feedback-title" style={{ fontSize: '18px', fontWeight: '500', color: '#131316', marginBottom: '16px' }}>{langData.feedbackTitle}</h3>
                <textarea
                  className="feedback-input"
                  style={{ width: '100%', minHeight: '100px', background: 'white', border: '2px solid #d9dfed', borderRadius: '8px', padding: '16px', color: '#131316', fontSize: '16px', resize: 'vertical', marginBottom: '16px' }}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={langData.feedbackPlaceholder}
                  maxLength="500"
                />
                <button
                  type="submit"
                  className="submit-button"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', fontWeight: '600', color: 'white', background: '#7852f4', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                  disabled={submissionStatus !== 'idle'}
                >
                  {getSubmitButtonText()}
                </button>
              </form>
            </div>
          )}

                     {showReviewOptions && (
             <div ref={reviewOptionsRef} id="reviewOptions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
               <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>{langData.reviewOptionsTitle}</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '320px' }}>
                 <a href={`https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`} id="reviewGoogle" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', borderRadius: '8px', fontWeight: '600', color: 'white', background: '#FFC107', textDecoration: 'none', transition: 'background 0.3s' }}>
                   <span style={{ fontSize: '18px' }}>G</span>
                   {langData.reviewGoogle}
                 </a>
                 <a href={FACEBOOK_PAGE_URL} id="reviewFacebook" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', borderRadius: '8px', fontWeight: '600', color: 'white', background: '#1877F2', textDecoration: 'none', transition: 'background 0.3s' }}>
                   <span style={{ fontSize: '18px' }}>f</span>
                   {langData.reviewFacebook}
                 </a>
                 <a href={YELP_PAGE_URL} id="reviewYelp" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', borderRadius: '8px', fontWeight: '600', color: 'white', background: '#FF1A1A', textDecoration: 'none', transition: 'background 0.3s' }}>
                   <span style={{ fontSize: '18px' }}>Y</span>
                   {langData.reviewYelp}
                 </a>
               </div>
             </div>
           )}

                     <div style={{ marginTop: '48px' }}>
             <h2 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px', color: '#131316' }}>{langData.testimonialsTitle}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', width: '100%', maxWidth: '1024px', margin: '0 auto' }}>
              {TESTIMONIALS.map((testimonial, index) => (
                <div key={index} style={{ borderRadius: '12px', border: '1px solid #d9dfed', background: '#f8f9fb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '4px' }}>
                    <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#6b7280' }}>{testimonial.initial}</span>
                    <span style={{ fontWeight: '600', color: '#131316' }}>{testimonial.name}</span>
                    <span style={{ display: 'flex', color: '#fbbf24', fontSize: '18px' }}>★★★★★</span>
                  </div>
                  <div style={{ color: '#131316', fontSize: '16px' }}>{testimonial.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RatingWidget;