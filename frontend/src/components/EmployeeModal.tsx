"use client";

import React, { useState, useEffect } from "react";
import { X, User, Briefcase, MapPin, Calendar, Banknote, ShieldAlert } from "lucide-react";
import {
  EmploymentType,
  WorkingHourType,
  MaritalStatusType,
  UnifiedEmployee,
} from "@/types";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, type: EmploymentType, isEdit: boolean, id?: number) => Promise<void>;
  editEmployee?: UnifiedEmployee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editEmployee,
}) => {
  const isEdit = Boolean(editEmployee);

  const [employmentType, setEmploymentType] = useState<EmploymentType>("PERMANENT");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    telephone: "",
    department: "",
    job_position: "",
    salary_birr: "",
    nationality: "Ethiopian",
    marital_status: "SINGLE" as MaritalStatusType,
    address: "",
    sub_city: "",
    wereda: "",
    tin_no: "",
    working_hour: "NORMAL" as WorkingHourType,
    branch: "",
    hire_date: "",
    // Permanent specific
    fired_date: "",
    terminated: false,
    termination_reason: "",
    // Contract specific
    contract_date: "",
    end_date: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (editEmployee) {
      setEmploymentType(editEmployee.employment_type);
      setFormData({
        name: editEmployee.name || "",
        age: editEmployee.age ? String(editEmployee.age) : "",
        telephone: editEmployee.telephone || "",
        department: editEmployee.department || "",
        job_position: editEmployee.job_position || "",
        salary_birr: editEmployee.salary_birr ? String(editEmployee.salary_birr) : "",
        nationality: editEmployee.nationality || "Ethiopian",
        marital_status: (editEmployee.marital_status as MaritalStatusType) || "SINGLE",
        address: editEmployee.address || "",
        sub_city: editEmployee.sub_city || "",
        wereda: editEmployee.wereda || "",
        tin_no: editEmployee.tin_no || "",
        working_hour: (editEmployee.working_hour as WorkingHourType) || "NORMAL",
        branch: editEmployee.branch || "",
        hire_date: editEmployee.hire_date || todayStr,
        fired_date: editEmployee.extra_info?.fired_date || "",
        terminated: editEmployee.extra_info?.terminated || false,
        termination_reason: editEmployee.extra_info?.termination_reason || "",
        contract_date: editEmployee.extra_info?.contract_date || todayStr,
        end_date: editEmployee.extra_info?.end_date || "",
      });
    } else {
      setFormData({
        name: "",
        age: "",
        telephone: "",
        department: "",
        job_position: "",
        salary_birr: "",
        nationality: "Ethiopian",
        marital_status: "SINGLE",
        address: "",
        sub_city: "",
        wereda: "",
        tin_no: "",
        working_hour: "NORMAL",
        branch: "",
        hire_date: todayStr,
        fired_date: "",
        terminated: false,
        termination_reason: "",
        contract_date: todayStr,
        end_date: "",
      });
    }
    setError(null);
  }, [editEmployee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please provide employee full name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age, 10) : null,
        telephone: formData.telephone.trim() || null,
        department: formData.department.trim() || null,
        job_position: formData.job_position.trim() || null,
        salary_birr: formData.salary_birr ? parseFloat(formData.salary_birr) : null,
        nationality: formData.nationality.trim() || "Ethiopian",
        marital_status: formData.marital_status || null,
        address: formData.address.trim() || null,
        sub_city: formData.sub_city.trim() || null,
        wereda: formData.wereda.trim() || null,
        tin_no: formData.tin_no.trim() || null,
        working_hour: formData.working_hour || "NORMAL",
        branch: formData.branch.trim() || null,
        hire_date: formData.hire_date || null,
      };

      if (employmentType === "PERMANENT") {
        payload.terminated = formData.terminated;
        payload.fired_date = formData.terminated ? formData.fired_date || null : null;
        payload.termination_reason = formData.terminated ? formData.termination_reason || null : null;
      } else if (employmentType === "CONTRACT") {
        payload.contract_date = formData.contract_date;
        payload.end_date = formData.end_date || null;
      }

      await onSave(payload, employmentType, isEdit, editEmployee?.id);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save employee.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEdit ? `Edit Employee (${editEmployee?.employee_code})` : "Register New Employee"}
            </h3>
            <p className="text-xs text-slate-500">
              {isEdit
                ? "Update identity, assignment, and compensation records"
                : "Enter worker details and assign employment classification"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center text-xs text-rose-700">
            <ShieldAlert className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Classification Selection */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Employment Classification *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "PERMANENT",
                    title: "Permanent",
                    desc: "Full benefits & salaried",
                    color: "border-blue-500 bg-blue-50/50 text-blue-900",
                  },
                  {
                    id: "CONTRACT",
                    title: "Contract",
                    desc: "Fixed tenure / term",
                    color: "border-amber-500 bg-amber-50/50 text-amber-900",
                  },
                  {
                    id: "TEMPORARY",
                    title: "Temporary",
                    desc: "Daily/weekly logged",
                    color: "border-purple-500 bg-purple-50/50 text-purple-900",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setEmploymentType(item.id as EmploymentType)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition text-center ${
                      employmentType === item.id
                        ? item.color
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="text-sm font-bold">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Personal & Contact */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-1">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Personal & Contact Info</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Abebe Bikila Kebede"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telephone
                </label>
                <input
                  type="text"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="e.g. +251 911 234567"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="16"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g. 29"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marital Status
                </label>
                <select
                  value={formData.marital_status}
                  onChange={(e) =>
                    setFormData({ ...formData, marital_status: e.target.value as MaritalStatusType })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-700"
                >
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Job & Compensation */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-1">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              <span>Job Assignment & Compensation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Engineering, HR, Finance"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Position / Title
                </label>
                <input
                  type="text"
                  value={formData.job_position}
                  onChange={(e) => setFormData({ ...formData, job_position: e.target.value })}
                  placeholder="e.g. Senior Specialist"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Salary (Ethiopian Birr)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    Br
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salary_birr}
                    onChange={(e) => setFormData({ ...formData, salary_birr: e.target.value })}
                    placeholder="35000"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Working Hours Shift
                </label>
                <select
                  value={formData.working_hour}
                  onChange={(e) =>
                    setFormData({ ...formData, working_hour: e.target.value as WorkingHourType })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-700"
                >
                  <option value="NORMAL">Normal Hour (8h)</option>
                  <option value="PART">Part Time</option>
                  <option value="MORNING">Morning Shift</option>
                  <option value="AFTERNOON">Afternoon Shift</option>
                  <option value="NIGHT">Night Shift</option>
                  <option value="SHIFTING">Shifting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch / Location
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g. Bole HQ, Kirkos Branch"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hire Date
                </label>
                <input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Type-Specific Details */}
          {employmentType === "CONTRACT" && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Contract Tenure Dates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    Contract Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.contract_date}
                    onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    Contract End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {employmentType === "PERMANENT" && isEdit && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Termination Status</span>
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.terminated}
                    onChange={(e) => setFormData({ ...formData, terminated: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Mark as Terminated
                  </span>
                </label>

                {formData.terminated && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Termination Date
                      </label>
                      <input
                        type="date"
                        value={formData.fired_date}
                        onChange={(e) => setFormData({ ...formData, fired_date: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Reason for Termination
                      </label>
                      <input
                        type="text"
                        value={formData.termination_reason}
                        onChange={(e) => setFormData({ ...formData, termination_reason: e.target.value })}
                        placeholder="e.g. Contract concluded, Resignation"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Address & Legal */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-1">
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span>Address & Tax Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  TIN Number
                </label>
                <input
                  type="text"
                  value={formData.tin_no}
                  onChange={(e) => setFormData({ ...formData, tin_no: e.target.value })}
                  placeholder="e.g. 0012345678"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub-City
                </label>
                <input
                  type="text"
                  value={formData.sub_city}
                  onChange={(e) => setFormData({ ...formData, sub_city: e.target.value })}
                  placeholder="e.g. Bole, Kirkos, Yeka"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wereda
                </label>
                <input
                  type="text"
                  value={formData.wereda}
                  onChange={(e) => setFormData({ ...formData, wereda: e.target.value })}
                  placeholder="e.g. Wereda 03"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. House No. 452, St. George area"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
            >
              {submitting ? "Saving..." : isEdit ? "Update Employee" : "Register Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
