"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  ClipboardList,
  Trash2,
  Clock,
  Phone,
  Building,
  Calendar,
} from "lucide-react";
import { UnifiedEmployee, EmploymentType } from "@/types";

interface EmployeeTableProps {
  employees: UnifiedEmployee[];
  loading: boolean;
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  onViewEmployee: (employee: UnifiedEmployee) => void;
  onEditEmployee: (employee: UnifiedEmployee) => void;
  onToggleTerminate: (employee: UnifiedEmployee) => void;
  onOpenLogs: (employee: UnifiedEmployee) => void;
  onDeleteEmployee: (employee: UnifiedEmployee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  selectedTab,
  onSelectTab,
  onViewEmployee,
  onEditEmployee,
  onToggleTerminate,
  onOpenLogs,
  onDeleteEmployee,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Tab filter
      if (selectedTab !== "ALL" && emp.employment_type !== selectedTab) {
        return false;
      }

      // Department filter
      if (selectedDept !== "ALL" && emp.department !== selectedDept) {
        return false;
      }

      // Status filter
      if (selectedStatus === "ACTIVE" && emp.status !== "Active") {
        return false;
      }
      if (selectedStatus === "TERMINATED" && emp.status !== "Terminated") {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          emp.name.toLowerCase().includes(q) ||
          emp.employee_code.toLowerCase().includes(q) ||
          (emp.department && emp.department.toLowerCase().includes(q)) ||
          (emp.job_position && emp.job_position.toLowerCase().includes(q)) ||
          (emp.telephone && emp.telephone.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [employees, selectedTab, selectedDept, selectedStatus, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) return;
    const headers = [
      "Employee Code",
      "Name",
      "Employment Type",
      "Department",
      "Job Position",
      "Salary (Birr)",
      "Status",
      "Telephone",
      "Hire Date",
    ];
    const rows = filteredEmployees.map((e) => [
      `"${e.employee_code}"`,
      `"${e.name}"`,
      `"${e.employment_type}"`,
      `"${e.department || ""}"`,
      `"${e.job_position || ""}"`,
      `"${e.salary_birr || ""}"`,
      `"${e.status}"`,
      `"${e.telephone || ""}"`,
      `"${e.hire_date || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smarthcm_employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatBirr = (amount?: number | string | null) => {
    if (!amount) return "—";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `Br ${num.toLocaleString()}`;
  };

  const getTypeBadge = (type: EmploymentType) => {
    switch (type) {
      case "PERMANENT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Permanent
          </span>
        );
      case "CONTRACT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Contract
          </span>
        );
      case "TEMPORARY":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Temporary
          </span>
        );
    }
  };

  const getStatusBadge = (emp: UnifiedEmployee) => {
    if (emp.employment_type === "PERMANENT" && emp.extra_info?.terminated) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
          Terminated
        </span>
      );
    }
    if (emp.employment_type === "CONTRACT" && emp.extra_info?.is_active === false) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Active
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 px-4 sm:px-6 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "ALL", label: "All Workforce" },
              { id: "PERMANENT", label: "Permanent" },
              { id: "CONTRACT", label: "Contract" },
              { id: "TEMPORARY", label: "Temporary" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  selectedTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${
                  viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:px-6 bg-slate-50/60 border-b border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code, dept, role..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="TERMINATED">Terminated / Inactive</option>
          </select>

          <span className="text-xs text-slate-500 ml-1">
            Showing <strong className="text-slate-800">{filteredEmployees.length}</strong> staff
          </span>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Loading workforce records...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-800">No employees found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No employees match "${searchQuery}". Try clearing search or filters.`
              : "No employee records exist for this filter. Click 'New Employee' to add one."}
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 sm:px-6">Employee</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Department & Position</th>
                <th className="py-3 px-4">Compensation</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredEmployees.map((emp) => (
                <tr
                  key={`${emp.employment_type}-${emp.id}`}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Name & Code */}
                  <td className="py-3 px-4 sm:px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                        {emp.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <div
                          onClick={() => onViewEmployee(emp)}
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {emp.name}
                        </div>
                        <div className="text-xs font-mono text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span className="font-semibold text-slate-700">{emp.employee_code}</span>
                          {emp.telephone && (
                            <span className="text-[11px] text-slate-400">
                              • {emp.telephone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4">{getTypeBadge(emp.employment_type)}</td>

                  {/* Department & Position */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{emp.job_position || "—"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{emp.department || "General"}</div>
                  </td>

                  {/* Compensation */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{formatBirr(emp.salary_birr)}</div>
                    <div className="text-[11px] text-slate-400">
                      {emp.working_hour || "Normal Hour"}
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="py-3 px-4 text-xs text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hired: {emp.hire_date || "—"}</span>
                    </div>
                    {emp.employment_type === "PERMANENT" && emp.extra_info?.fired_date && (
                      <div className="text-[11px] text-rose-600 mt-0.5">
                        Terminated: {emp.extra_info.fired_date}
                      </div>
                    )}
                    {emp.employment_type === "CONTRACT" && emp.extra_info?.end_date && (
                      <div className="text-[11px] text-amber-600 mt-0.5">
                        End: {emp.extra_info.end_date}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">{getStatusBadge(emp)}</td>

                  {/* Actions */}
                  <td className="py-3 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {/* View Profile */}
                      <button
                        onClick={() => onViewEmployee(emp)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditEmployee(emp)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* If Permanent: Terminate/Reactivate */}
                      {emp.employment_type === "PERMANENT" && (
                        <button
                          onClick={() => onToggleTerminate(emp)}
                          className={`p-1.5 rounded-lg transition ${
                            emp.extra_info?.terminated
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-rose-500 hover:bg-rose-50"
                          }`}
                          title={emp.extra_info?.terminated ? "Reactivate Employee" : "Terminate Employee"}
                        >
                          {emp.extra_info?.terminated ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {/* If Temporary: Logs */}
                      {emp.employment_type === "TEMPORARY" && (
                        <button
                          onClick={() => onOpenLogs(emp)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Manage Work Logs"
                        >
                          <ClipboardList className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteEmployee(emp)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={`${emp.employment_type}-${emp.id}`}
              className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                      {emp.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <h4
                        onClick={() => onViewEmployee(emp)}
                        className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {emp.name}
                      </h4>
                      <p className="text-xs font-mono text-slate-500">{emp.employee_code}</p>
                    </div>
                  </div>
                  {getTypeBadge(emp.employment_type)}
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1" /> Position
                    </span>
                    <span className="font-medium text-slate-800">
                      {emp.job_position || "—"} ({emp.department || "General"})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Salary (Birr)</span>
                    <span className="font-bold text-slate-900">{formatBirr(emp.salary_birr)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1" /> Phone
                    </span>
                    <span>{emp.telephone || "—"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status</span>
                    {getStatusBadge(emp)}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onViewEmployee(emp)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View Details →
                </button>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEditEmployee(emp)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {emp.employment_type === "TEMPORARY" && (
                    <button
                      onClick={() => onOpenLogs(emp)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                      title="Logs"
                    >
                      <ClipboardList className="w-4 h-4" />
                    </button>
                  )}
                  {emp.employment_type === "PERMANENT" && (
                    <button
                      onClick={() => onToggleTerminate(emp)}
                      className={`p-1 rounded ${
                        emp.extra_info?.terminated
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-rose-500 hover:bg-rose-50"
                      }`}
                      title={emp.extra_info?.terminated ? "Reactivate" : "Terminate"}
                    >
                      {emp.extra_info?.terminated ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteEmployee(emp)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
