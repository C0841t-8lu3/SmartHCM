"use client";

import React from "react";
import { Users, UserCheck, Briefcase, Clock, Banknote, AlertTriangle } from "lucide-react";
import { DashboardStats as StatsType, EmploymentType } from "@/types";

interface DashboardStatsProps {
  stats: StatsType | null;
  selectedTab: string;
  onSelectTab: (tab: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  selectedTab,
  onSelectTab,
}) => {
  const headcount = stats?.headcount || {
    total_staff: 0,
    permanent_total: 0,
    permanent_active: 0,
    permanent_terminated: 0,
    contract_total: 0,
    contract_active: 0,
    contract_expiring_soon: 0,
    temporary_total: 0,
    total_work_logs: 0,
  };

  const financials = stats?.financials || {
    currency: "ETB",
    total_monthly_payroll: 0,
    permanent_payroll: 0,
    contract_payroll: 0,
  };

  const formatBirr = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(amount).replace("ETB", "Br");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Staff Card */}
      <div
        onClick={() => onSelectTab("ALL")}
        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
          selectedTab === "ALL"
            ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm"
            : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Workforce
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {headcount.total_staff}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-100/80 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs text-slate-600 font-medium">
          <span className="text-indigo-600 font-semibold mr-1.5">
            {headcount.permanent_total} Permanent
          </span>
          • <span className="mx-1.5">{headcount.contract_total} Contract</span>
          • <span className="ml-1.5">{headcount.temporary_total} Temp</span>
        </div>
      </div>

      {/* Permanent Employees Card */}
      <div
        onClick={() => onSelectTab("PERMANENT")}
        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
          selectedTab === "PERMANENT"
            ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-sm"
            : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Permanent Staff
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {headcount.permanent_total}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs">
          <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
            {headcount.permanent_active} Active
          </span>
          {headcount.permanent_terminated > 0 && (
            <span className="ml-2 inline-flex items-center text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-medium border border-rose-200">
              {headcount.permanent_terminated} Terminated
            </span>
          )}
        </div>
      </div>

      {/* Contract Employees Card */}
      <div
        onClick={() => onSelectTab("CONTRACT")}
        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
          selectedTab === "CONTRACT"
            ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20 shadow-sm"
            : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contract Staff
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {headcount.contract_total}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs">
          <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
            {headcount.contract_active} Active
          </span>
          {headcount.contract_expiring_soon > 0 && (
            <span className="ml-2 inline-flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {headcount.contract_expiring_soon} Expiring soon
            </span>
          )}
        </div>
      </div>

      {/* Temporary Staff & Total Payroll Card */}
      <div
        onClick={() => onSelectTab("TEMPORARY")}
        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
          selectedTab === "TEMPORARY"
            ? "bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20 shadow-sm"
            : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Temporary & Payroll
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatBirr(financials.total_monthly_payroll)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600">
            <Banknote className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{headcount.temporary_total} temp workers</span>
          <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            {headcount.total_work_logs} Logs
          </span>
        </div>
      </div>
    </div>
  );
};
