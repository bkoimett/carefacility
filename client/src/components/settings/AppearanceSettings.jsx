import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function AppearanceSettings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Load saved preferences from localStorage or use defaults
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('carefacility-fontSize');
    return saved || 'medium';
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('carefacility-notificationsEnabled');
    return saved === null ? true : saved === 'true';
  });
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('carefacility-fontSize', fontSize);
    localStorage.setItem('carefacility-notificationsEnabled', notificationsEnabled);
    
    // Apply font size to document root
    document.documentElement.style.setProperty('--font-size', fontSize);
  }, [fontSize, notificationsEnabled]);
  
  // Apply theme when it changes
  useEffect(() => {
    // The ThemeContext already handles applying the theme
    // This effect is just for consistency
  }, [theme]);
  
  const handleSavePreferences = async () => {
    try {
      // Save preferences to backend
      await fetch('/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            theme,
            fontSize,
            notificationsEnabled
          }
        })
      });
      
      // Apply font size immediately
      document.documentElement.style.setProperty('--font-size', fontSize);
      
      alert('Appearance settings saved successfully!');
    } catch (error) {
      console.error('Failed to save appearance settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Appearance Settings</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-4">Theme Selection</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="careclinic"
              checked={theme === 'careclinic'}
              onChange={(e) => toggleTheme()}
              className="radio radio-primary"
            />
            <div>
              <div className="font-medium">Light Theme (Care Clinic)</div>
              <div className="text-sm text-gray-500">
                Clean light theme with blue accents
              </div>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="carenight"
              checked={theme === 'carenight'}
              onChange={(e) => toggleTheme()}
              className="radio radio-primary"
            />
            <div>
              <div className="font-medium">Dark Theme (Care Night)</div>
              <div className="text-sm text-gray-500">
                Dark theme for reduced eye strain
              </div>
            </div>
          </label>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="label">
              <span className="label-text">Font Size</span>
            </label>
            <div className="flex space-x-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="fontSize"
                  value="small"
                  checked={fontSize === 'small'}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="radio"
                />
                <span>Small</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="fontSize"
                  value="medium"
                  checked={fontSize === 'medium'}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="radio"
                />
                <span>Medium</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="fontSize"
                  value="large"
                  checked={fontSize === 'large'}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="radio"
                />
                <span>Large</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Changes apply immediately to all text in the application
            </p>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="checkbox checkbox-primary"
              />
              <span className="font-medium">Enable Notifications</span>
            </label>
            <p className="text-xs text-gray-500">
              Toggle system notifications for alerts and updates
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-4">Preview</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Sample Heading</h4>
            <p className="mb-2">
              This is a sample paragraph to preview your font size selection.
              The text will adjust based on the font size setting above.
            </p>
            <button className="btn btn-outline btn-primary">
              Sample Button
            </button>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSavePreferences}
              className="btn btn-primary"
            >
              Save Appearance Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}