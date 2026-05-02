import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <span className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></span>
      {message && <p className="mt-2 text-sm text-[#F0F4FF]/70">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;