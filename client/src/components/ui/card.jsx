import React from 'react';

export function Card({ className = '', children }) {
  return (
    <div className={`bg-white rounded-xl shadow border ${className}`}>
      {children}
    </div>
  );
}
