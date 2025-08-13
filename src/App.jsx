// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RatingWidget from './RatingWidget';
import ReviewForm from './components/ReviewForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<RatingWidget />} />
        <Route path="/review/:token" element={<ReviewForm />} />
      </Routes>
    </div>
  );
}

export default App;