"use client";

import React, { useState, useEffect } from "react";
import { X, UserX, UserCheck, ShieldAlert } from "lucide-react";
import { UnifiedEmployee } from "@/types";

interface TerminateModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: UnifiedEmployee | null;
  onConfirm: (data: { fired_date?: string; termination_reason?: string }) => Promise<void>;
}

export const TerminateModal: React.FC<TerminateModalProps> = ({
  isOpen,
  onClose,
  employee,
  onConfirm,
}) => {
  const isCurrentlyTerminated = employee?.extra_info?.terminated;

  const [firedDate, setFiredDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFiredDate(new Date().toISOString().slice(0, 10));
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirm({
        fired_date: isCurrentlyTerminated ? undefined : firedDate || new Date().toISOString().slice(0, 10),
        termination_reason: isCurrentlyTerminated ? undefined : reason.trim() || "Terminated via system",
      });
      onClose();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isCurrentlyTerminated
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {isCurrentlyTerminated ? (
                <UserCheck className="w-6 h-6" />
              ) : (
                <UserX className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isCurrentlyTerminated ? "Reactivate Employee" : "Terminate Employee"}
              </h3>
              <p className="text-xs text-slate-500">
                {employee.name} ({employee.employee_code})
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isCurrentlyTerminated ? (
              <p className="text-xs text-slate-600 leading-relaxed">
                This will restore <strong>{employee.name}</strong> to Active permanent status and clear their termination record.
              </p>
            ) : (
              <>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Marking this permanent employee as terminated will remove them from active payroll calculations while preserving their historical records.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Effective Termination Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={firedDate}
                    onChange={(e) => setFiredDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Termination
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Contract completed, Voluntary resignation"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition ${
                  isCurrentlyTerminated
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {submitting
                  ? "Processing..."
                  : isCurrentlyTerminated
                  ? "Confirm Reactivation"
                  : "Confirm Termination"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
