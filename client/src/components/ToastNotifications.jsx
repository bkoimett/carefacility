import { Toaster, toast } from 'react-hot-toast';

/**
 * Toast notifications utility component
 * Wraps the app with Toaster and provides helper functions
 */

// Create the Toaster component
export const ToastNotifications = () => {
  return (
    <Toaster 
      position="bottom-right" 
      theme="dark"
      reverseOrder={true}
      duration={3000}
      swallowErrors
    />
  );
};

/**
 * Show success toast
 * @param {string} message - Success message to display
 */
export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'bottom-right',
    style: {
      background: '#10b981', // DaisyUI success color
      color: 'white',
      border: 'none',
    }
  });
};

/**
 * Show error toast
 * @param {string} message - Error message to display
 */
export const showError = (message) => {
  toast.error(message, {
    duration: 5000,
    position: 'bottom-right',
    style: {
      background: '#ef4444', // DaisyUI error color
      color: 'white',
      border: 'none',
    }
  });
};

/**
 * Show validation errors toast
 * @param {Object} errors - Validation errors object
 */
export const showValidationErrors = (errors) => {
  const errorMessages = Object.values(errors).join('\n');
  showError(`Validation failed:\n${errorMessages}`);
};

export default ToastNotifications;