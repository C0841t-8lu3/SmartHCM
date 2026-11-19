"use client";

import React, { useState, useEffect } from "react";
import { X, ClipboardList, Plus, Trash2, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { UnifiedEmployee, TemporaryWorkLog, LogType } from "@/types";
import { api } from "@/lib/api";

interface TemporaryLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: UnifiedEmployee | null;
  onLogsUpdated: () => void;
}

export const TemporaryLogsModal: React.FC<TemporaryLogsModalProps> = ({
  isOpen,
  onClose,
  employee,
  onLogsUpdated,
}) => {
  const [logs, setLogs] = useState<TemporaryWorkLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New log form state
  const [logType, setLogType] = useState<LogType>("DAILY");
  const [date, setDate] = useState("");
  const [recordedValue, setRecordedValue] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const data = await api.getTemporaryLogs(employee.id);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && employee) {
      setDate(new Date().toISOString().slice(0, 10));
      fetchLogs();
      setShowAddForm(false);
      setError(null);
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.addTemporaryLog(employee.id, {
        log_type: logType,
        date: date || new Date().toISOString().slice(0, 10),
        recorded_value: recordedValue ? parseFloat(recordedValue) : undefined,
        notes: notes.trim() || undefined,
      });
      // reset form
      setRecordedValue("");
      setNotes("");
      setShowAddForm(false);
      await fetchLogs();
      onLogsUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to add work log.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId: number) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return;
    try {
      await api.deleteWorkLog(logId);
      await fetchLogs();
      onLogsUpdated();
    } catch (err: any) {
      alert("Failed to delete log: " + err.message);
    }
  };

  const totalValue = logs.reduce((acc, curr) => acc + (Number(curr.recorded_value) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Work Logs: {employee.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {employee.employee_code} • {employee.department || "Temporary"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Summary Strip */}
        <div className="px-6 py-3 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between text-xs">
          <span className="text-purple-900 font-medium">
            Total Logged Entries: <strong>{logs.length}</strong>
          </span>
          <span className="text-purple-900 font-bold bg-white px-3 py-1 rounded-full border border-purple-200 shadow-2xs">
            Cumulative Value: {totalValue.toLocaleString()} units / ETB
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Toggle Add Form Button */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50/30 hover:bg-purple-50 transition flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Work Log Entry</span>
            </button>
          ) : (
            /* New Log Form */
            <form
              onSubmit={handleAddLog}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-100"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  New Activity Log
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>

              {error && <div className="text-xs text-rose-600">{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Frequency
                  </label>
                  <select
                    value={logType}
                    onChange={(e) => setLogType(e.target.value as LogType)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-slate-700"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Value (Hrs / Birr)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={recordedValue}
                    onChange={(e) => setRecordedValue(e.target.value)}
                    placeholder="e.g. 8.5"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Task Description / Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Loading cargo batch A-12, site inspection"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Log Entry"}
                </button>
              </div>
            </form>
          )}

          {/* Logs List */}
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading work logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No work logs found for this temporary worker.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="py-3 flex items-start justify-between group hover:bg-slate-50 px-2 rounded-lg transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800">
                        {log.log_type}
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        {log.date}
                      </span>
                      {log.recorded_value && (
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {log.recorded_value} units
                        </span>
                      )}
                    </div>
                    {log.notes && (
                      <p className="text-xs text-slate-600 pl-1">{log.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition"
                    title="Delete log entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
