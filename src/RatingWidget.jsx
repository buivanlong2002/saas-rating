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
  en: 'US',
  vi: 'VN',
  es: 'ES'
};

const RATING_EMOJIS = [
  { value: 1, src: '/images/terrible.png', alt: 'Terrible' },
  { value: 2, src: '/images/bad.png', alt: 'Bad' },
  { value: 3, src: '/images/okay.png', alt: 'Okay' },
  { value: 4, src: '/images/good.png', alt: 'Good' },
  { value: 5, src: '/images/great.png', alt: 'Great' }
];

const GOOGLE_PLACE_ID = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/your-page';
const YELP_PAGE_URL = 'https://www.yelp.com/biz/your-business';

const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    initial: 'S',
    text: 'Amazing service! The staff was very professional and friendly. I love how they took care of every detail.'
  },
  {
    name: 'Mike Chen',
    initial: 'M',
    text: 'Great experience overall. The quality of service exceeded my expectations. Highly recommend!'
  }
];

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

    if (selectedRating >= 4) {
      setShowFeedbackForm(false);
      submitRatingData(selectedRating, '', true);
      const timer = setTimeout(() => {
          setShowReviewOptions(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowFeedbackForm(true);
      setShowReviewOptions(false);
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
    const reviewToken = localStorage.getItem('reviewToken');
    
    if (!reviewToken) {
      console.error('No review token found');
      showNotification(langData.notifications?.tokenNotFound || 'Review token not found. Please try again.', 'error');
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

  if (submissionStatus === 'submitted') {
    return (
      <div className="rating-widget">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="content" style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#2E7D32', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {langData.thankYou?.title || 'Thank you! 🙏'}
            </h1>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ 
                fontSize: '18px', 
                color: '#424242', 
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                {langData.thankYou?.message?.replace('{salonName}', salonName) || `We really appreciate your feedback about the service at ${salonName}.`}
              </p>
              
              <p style={{ 
                fontSize: '16px', 
                color: '#666', 
                lineHeight: '1.5'
              }}>
                {langData.thankYou?.subtitle || 'Your feedback will help us improve our service quality and provide a better experience for all customers.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-widget">
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

      <div className="container">
        <div className="content">
          
          {/* Language Selector */}
          <div ref={languageDropdownRef} className="language-dropdown">
                         <button onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}>
               <span>{LANGUAGE_NAMES[currentLang]}</span>
               <span style={{ 
                 transform: showLanguageDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                 transition: 'transform 0.2s ease'
               }}>
                 ▼
               </span>
             </button>
            
            {showLanguageDropdown && (
              <div className="dropdown-menu">
                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={currentLang === code ? 'active' : ''}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="header">
            <h1 className="greeting">
              {langData.greeting.replace('{customerName}', customerName)}
            </h1>
            <p className="question">{langData.question}</p>
          </div>

          <div className="rating-section">
            <div className="stars-container">
             {RATING_EMOJIS.map((rating) => (
                <label key={rating.value} className="star-button">
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
                      width: '36px',
                      height: '36px',
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
          
          {selectedRating > 0 && selectedRating < 4 && (
            <div className="feedback-form">
              <form onSubmit={handleSubmitFeedback}>
                <h3 className="feedback-title">{langData.feedbackTitle}</h3>
                <textarea
                  className="feedback-input"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={langData.feedbackPlaceholder}
                  maxLength="500"
                />
                <button
                  type="submit"
                  className="submit-button"
                  disabled={submissionStatus !== 'idle'}
                >
                  {getSubmitButtonText()}
                </button>
              </form>
            </div>
          )}

                     {showReviewOptions && (
             <div ref={reviewOptionsRef} id="reviewOptions" className="review-options">
               <h2>{langData.reviewOptionsTitle}</h2>
               <div className="review-buttons">
                 <a href={`https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`} id="reviewGoogle" target="_blank" rel="noopener noreferrer" className="google">
                   <span>G</span>
                   {langData.reviewGoogle}
                 </a>
                 <a href={FACEBOOK_PAGE_URL} id="reviewFacebook" target="_blank" rel="noopener noreferrer" className="facebook">
                   <span>f</span>
                   {langData.reviewFacebook}
                 </a>
                 <a href={YELP_PAGE_URL} id="reviewYelp" target="_blank" rel="noopener noreferrer" className="yelp">
                   <span>Y</span>
                   {langData.reviewYelp}
                 </a>
               </div>
             </div>
           )}

                       <div className="testimonials-section">
              <div className="testimonials-grid">
               {TESTIMONIALS.map((testimonial, index) => (
                 <div key={index} className="testimonial-card">
                   <div className="testimonial-header">
                     <div className="testimonial-avatar">{testimonial.initial}</div>
                     <div className="testimonial-info">
                       <div className="testimonial-name">{testimonial.name}</div>
                       <div className="testimonial-stars">★★★★★</div>
                     </div>
                   </div>
                   <div className="testimonial-text">{testimonial.text}</div>
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