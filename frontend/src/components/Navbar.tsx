"use client";

import React from "react";
import { Users, Plus } from "lucide-react";
import { ApiHealth } from "@/types";

interface NavbarProps {
  health: ApiHealth | null;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  onOpenAddModal,
}) => {
  const isHealthy = health?.status === "healthy";

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
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isHealthy
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
              title={
                isHealthy
                  ? `Backend connected (DB: ${health?.database || "active"})`
                  : "Connecting to backend service..."
              }
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
              <span>
                {isHealthy ? "Backend Connected" : "Connecting..."}
              </span>
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
    </header>
  );
};
