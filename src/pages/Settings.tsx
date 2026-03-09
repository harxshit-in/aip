import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Save, Key, Building2 } from 'lucide-react';

export default function Settings() {
  const { geminiKey, setGeminiKey, coachingMode, setCoachingMode, brandName, setBrandName } = useStore();
  const [keyInput, setKeyInput] = useState(geminiKey || '');
  const [brandInput, setBrandInput] = useState(brandName);
  const [modeInput, setModeInput] = useState(coachingMode);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiKey(keyInput);
    setBrandName(brandInput);
    setCoachingMode(modeInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* API Key Section */}
          <div>
            <h2 className="text-lg font-semibold flex items-center mb-4">
              <Key className="w-5 h-5 mr-2 text-indigo-600" />
              Gemini API Key
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Your API key is stored locally in your browser and used directly for AI analysis. We do not store it on our servers.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="AIzaSy..."
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Coaching Mode Section */}
          <div>
            <h2 className="text-lg font-semibold flex items-center mb-4">
              <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
              Coaching Mode (White-label)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Enable coaching mode to replace ParikshAI branding with your institute's name on the dashboard and generated reports.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="coaching-mode"
                  type="checkbox"
                  checked={modeInput}
                  onChange={(e) => setModeInput(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="coaching-mode" className="ml-2 block text-sm text-gray-900">
                  Enable Coaching Mode
                </label>
              </div>

              {modeInput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institute Brand Name</label>
                  <input
                    type="text"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Allen Career Institute"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Custom Domain Section */}
          <div>
            <h2 className="text-lg font-semibold flex items-center mb-4">
              <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
              Custom Domain
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Connect your own domain (e.g., trend.mycoaching.com).
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="trend.mycoaching.com"
              />
              <p className="mt-2 text-xs text-gray-500">
                Point your domain's CNAME record to <code>parikshai.app</code>. SSL will be enabled automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4">
            {saved && <span className="text-green-600 text-sm mr-4">Settings saved successfully!</span>}
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
