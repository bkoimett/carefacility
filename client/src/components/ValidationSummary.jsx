import React from 'react';

/**
 * Validation summary component to display form validation errors
 * @param {Object} errors - Object containing field names and error messages
 * @param {string} title - Optional title for the validation summary
 */
const ValidationSummary = ({ errors, title = 'Please fix the following errors:' }) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="alert alert-error mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold">{title}</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field} className="flex items-start space-x-2">
                <span className="flex-shrink-0">•</span>
                <span className="flex-grow">
                  <span className="font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}:</span> {message}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={(e) => {
              e.currentTarget.closest('.alert').remove();
            }}
            className="btn btn-sm btn-ghost mt-2"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationSummary;