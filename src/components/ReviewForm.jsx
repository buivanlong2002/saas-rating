import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RatingWidget from '../RatingWidget';
import './ReviewForm.css';

const ReviewForm = () => {
  const { token } = useParams();
  
  // Lưu token vào localStorage ngay lập tức
  useEffect(() => {
    if (token) {
      localStorage.setItem('reviewToken', token);
    }
  }, [token]);

  // Hiển thị RatingWidget trực tiếp
  return <RatingWidget />;
};

export default ReviewForm;
