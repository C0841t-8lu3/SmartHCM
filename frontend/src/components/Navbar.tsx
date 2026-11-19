"use client";

import React, { useState } from "react";
import { Users, Server, CheckCircle2, AlertCircle, Plus, Settings } from "lucide-react";
import { ApiHealth } from "@/types";

interface NavbarProps {
  health: ApiHealth | null;
  apiUrl: string;
  onUpdateApiUrl: (url: string) => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  apiUrl,
  onUpdateApiUrl,
  onOpenAddModal,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  const isHealthy = health?.status === "healthy";

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateApiUrl(tempUrl.trim());
    setShowConfig(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Smart<span className="text-indigo-600">HCM</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Human Capital & Labor Management System
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Backend Health Badge */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                isHealthy
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
              onClick={() => setShowConfig(!showConfig)}
              title="Click to configure backend API URL"
            >
              <div className="relative flex h-2 w-2">
                {isHealthy && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isHealthy ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                ></span>
              </div>
              <span className="hidden md:inline">
                {isHealthy ? "Backend Connected" : "Connecting..."}
              </span>
              <Settings className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </div>

            {/* Quick Add Employee CTA */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>New Employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backend API Configuration Dropdown / Modal */}
      {showConfig && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <Server className="w-4 h-4 text-indigo-500" />
              <span>Backend Endpoint:</span>
              <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-indigo-600">
                {apiUrl}
              </code>
              {health && (
                <span className="text-slate-500">
                  (DB: <strong className="text-emerald-600">{health.database}</strong>)
                </span>
              )}
            </div>
            <form onSubmit={handleSaveUrl} className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="e.g. https://your-backend.railway.app"
                className="px-2.5 py-1 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-2 py-1 text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
