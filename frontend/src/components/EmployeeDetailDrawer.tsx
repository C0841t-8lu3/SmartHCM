"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Banknote,
  Clock,
  ShieldCheck,
  UserX,
  UserCheck,
  Edit2,
  ClipboardList,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { UnifiedEmployee, TemporaryWorkLog } from "@/types";
import { api } from "@/lib/api";

interface EmployeeDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: UnifiedEmployee | null;
  onEdit: (employee: UnifiedEmployee) => void;
  onToggleTerminate: (employee: UnifiedEmployee) => void;
  onOpenLogs: (employee: UnifiedEmployee) => void;
}

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({
  isOpen,
  onClose,
  employee,
  onEdit,
  onToggleTerminate,
  onOpenLogs,
}) => {
  const [logs, setLogs] = useState<TemporaryWorkLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (isOpen && employee && employee.employment_type === "TEMPORARY") {
      setLoadingLogs(true);
      api
        .getTemporaryLogs(employee.id)
        .then((res) => setLogs(res))
        .catch(() => setLogs([]))
        .finally(() => setLoadingLogs(false));
    } else {
      setLogs([]);
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const formatBirr = (amount?: number | string | null) => {
    if (!amount) return "—";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `Br ${num.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-100">
              {employee.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {employee.name}
              </h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                  {employee.employee_code}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {employee.employment_type}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Alert Banner */}
          {employee.employment_type === "PERMANENT" && employee.extra_info?.terminated ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="flex items-center text-rose-800 font-bold text-xs uppercase tracking-wider mb-1">
                <UserX className="w-4 h-4 mr-1.5" /> Terminated Permanent Record
              </div>
              <p className="text-xs text-rose-700">
                Fired on <strong>{employee.extra_info.fired_date || "N/A"}</strong>.
                {employee.extra_info.termination_reason && (
                  <span> Reason: &quot;{employee.extra_info.termination_reason}&quot;</span>
                )}
              </p>
            </div>
          ) : employee.employment_type === "CONTRACT" && employee.extra_info?.is_active === false ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 mr-1.5" /> Contract Expired
              </div>
              <p className="text-xs text-amber-700">
                Contract reached end date on <strong>{employee.extra_info.end_date}</strong>.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Active Workforce Member</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                In Good Standing
              </span>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Monthly Salary
              </span>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {formatBirr(employee.salary_birr)}
              </div>
              <span className="text-[10px] text-slate-500">Ethiopian Birr (ETB)</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Working Shift
              </span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {employee.working_hour || "Normal Hour"}
              </div>
              <span className="text-[10px] text-slate-500">Standard Assignment</span>
            </div>
          </div>

          {/* Job Details Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
              <Briefcase className="w-4 h-4 mr-1.5 text-indigo-500" />
              Role & Department
            </h4>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-800">{employee.department || "—"}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Job Position</span>
                <span className="font-semibold text-slate-800">{employee.job_position || "—"}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Branch Office</span>
                <span className="font-semibold text-slate-800">{employee.branch || "Headquarters"}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Hire Date</span>
                <span className="font-semibold text-slate-800">{employee.hire_date || "—"}</span>
              </div>
              {employee.employment_type === "CONTRACT" && (
                <>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-500">Contract Start</span>
                    <span className="font-semibold text-slate-800">
                      {employee.extra_info?.contract_date || "—"}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-500">Contract End</span>
                    <span className="font-semibold text-slate-800">
                      {employee.extra_info?.end_date || "No expiry specified"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Personal & Contact Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
              <User className="w-4 h-4 mr-1.5 text-indigo-500" />
              Identity & Demographics
            </h4>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Telephone</span>
                <span className="font-semibold text-slate-800">{employee.telephone || "—"}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Age</span>
                <span className="font-semibold text-slate-800">
                  {employee.age ? `${employee.age} yrs` : "—"}
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Marital Status</span>
                <span className="font-semibold text-slate-800">{employee.marital_status || "—"}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Nationality</span>
                <span className="font-semibold text-slate-800">{employee.nationality || "Ethiopian"}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">TIN Number</span>
                <span className="font-mono font-semibold text-slate-800">
                  {employee.tin_no || "—"}
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500">Address (Sub-city / Wereda)</span>
                <span className="font-semibold text-slate-800">
                  {[employee.sub_city, employee.wereda, employee.address]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Temporary Work Logs (if Temporary employee) */}
          {employee.employment_type === "TEMPORARY" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                  <ClipboardList className="w-4 h-4 mr-1.5 text-purple-600" />
                  Work Logs Activity
                </h4>
                <button
                  onClick={() => onOpenLogs(employee)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                >
                  + Add Log Entry
                </button>
              </div>

              {loadingLogs ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No work logs recorded yet for this worker.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            {log.log_type}
                          </span>
                          <span className="text-slate-600 font-medium">{log.date}</span>
                        </div>
                        {log.notes && <p className="text-slate-500 mt-1">{log.notes}</p>}
                      </div>
                      <div className="font-bold text-slate-800 text-right">
                        {log.recorded_value ? `${log.recorded_value} units/ETB` : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={() => onEdit(employee)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Edit Profile
          </button>

          {employee.employment_type === "PERMANENT" && (
            <button
              onClick={() => onToggleTerminate(employee)}
              className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-white transition shadow-xs ${
                employee.extra_info?.terminated
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {employee.extra_info?.terminated ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Reactivate
                </>
              ) : (
                <>
                  <UserX className="w-3.5 h-3.5 mr-1.5" /> Terminate
                </>
              )}
            </button>
          )}

          {employee.employment_type === "TEMPORARY" && (
            <button
              onClick={() => onOpenLogs(employee)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-xs"
            >
              <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
              Log Activity
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
