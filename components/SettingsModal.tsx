import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Settings {
  aiModel: 'gpt-4o-mini' | 'gpt-4o';
}

const MODEL_OPTIONS = [
  {
    value: 'gpt-4o-mini' as const,
    label: 'GPT-4o Mini (Recommended)',
    description: 'Faster and more cost-effective, good quality analysis',
    cost: 'Lower cost per report',
  },
  {
    value: 'gpt-4o' as const,
    label: 'GPT-4o (Premium)',
    description: 'Highest quality analysis with more detailed insights',
    cost: 'Higher cost per report',
  },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({
    aiModel: 'gpt-4o-mini',
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('roomgpt-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleModelChange = (model: 'gpt-4o-mini' | 'gpt-4o') => {
    setSettings(prev => ({ ...prev, aiModel: model }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('roomgpt-settings', JSON.stringify(settings));
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setSettings({ aiModel: 'gpt-4o-mini' });
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
              <p className="text-gray-600 mt-1">Customize your AI analysis experience</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close settings"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* AI Model Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Analysis Model</h3>
              <div className="space-y-3">
                {MODEL_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="block cursor-pointer"
                  >
                    <div
                      className={`border rounded-lg p-4 transition-all ${
                        settings.aiModel === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="aiModel"
                          value={option.value}
                          checked={settings.aiModel === option.value}
                          onChange={() => handleModelChange(option.value)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {option.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {option.cost}
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Information Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">About AI Models</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>GPT-4o Mini:</strong> Recommended for most users. Provides high-quality analysis
                  at a lower cost with faster response times.
                </p>
                <p>
                  <strong>GPT-4o:</strong> Best for detailed professional analysis. Offers more comprehensive
                  insights but takes longer and costs more.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 transition-colors"
              >
                Reset to Default
              </button>
              <div className="space-x-3">
                <button
                  onClick={handleClose}
                  className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`font-medium px-4 py-2 rounded-lg transition-colors ${
                    hasChanges
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}