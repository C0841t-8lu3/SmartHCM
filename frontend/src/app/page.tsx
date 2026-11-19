"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardStats } from "@/components/DashboardStats";
import { EmployeeTable } from "@/components/EmployeeTable";
import { EmployeeModal } from "@/components/EmployeeModal";
import { EmployeeDetailDrawer } from "@/components/EmployeeDetailDrawer";
import { TemporaryLogsModal } from "@/components/TemporaryLogsModal";
import { TerminateModal } from "@/components/TerminateModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ToastContainer, ToastMessage } from "@/components/Toast";
import { api } from "@/lib/api";
import {
  UnifiedEmployee,
  DashboardStats as StatsType,
  ApiHealth,
  EmploymentType,
} from "@/types";

export default function SmartHCMDashboard() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [employees, setEmployees] = useState<UnifiedEmployee[]>([]);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [apiUrl, setApiUrl] = useState<string>("");

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<UnifiedEmployee | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<UnifiedEmployee | null>(null);

  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [terminateEmployee, setTerminateEmployee] = useState<UnifiedEmployee | null>(null);

  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [logsEmployee, setLogsEmployee] = useState<UnifiedEmployee | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteEmployee, setDeleteEmployee] = useState<UnifiedEmployee | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Data loading
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, employeesRes, healthRes] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getUnifiedEmployees(),
        api.checkHealth(),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (employeesRes.status === "fulfilled") setEmployees(employeesRes.value.results);
      if (healthRes.status === "fulfilled") setHealth(healthRes.value);
      else setHealth(null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setApiUrl(api.getBaseUrl());
    loadData();

    // Check health periodically
    const interval = setInterval(() => {
      api.checkHealth().then(setHealth).catch(() => setHealth(null));
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleUpdateApiUrl = (newUrl: string) => {
    api.setBaseUrl(newUrl);
    setApiUrl(newUrl);
    addToast(`API endpoint updated to ${newUrl}`, "info");
    loadData();
  };

  // Create / Update Employee
  const handleSaveEmployee = async (
    data: any,
    type: EmploymentType,
    isEdit: boolean,
    id?: number
  ) => {
    try {
      if (type === "PERMANENT") {
        if (isEdit && id) {
          await api.updatePermanentEmployee(id, data);
          addToast("Permanent employee record updated successfully");
        } else {
          await api.createPermanentEmployee(data);
          addToast("New permanent employee added successfully");
        }
      } else if (type === "CONTRACT") {
        if (isEdit && id) {
          await api.updateContractEmployee(id, data);
          addToast("Contract employee record updated successfully");
        } else {
          await api.createContractEmployee(data);
          addToast("New contract employee added successfully");
        }
      } else if (type === "TEMPORARY") {
        if (isEdit && id) {
          await api.updateTemporaryEmployee(id, data);
          addToast("Temporary worker record updated successfully");
        } else {
          await api.createTemporaryEmployee(data);
          addToast("New temporary worker added successfully");
        }
      }

      await loadData();
    } catch (err: any) {
      addToast(err.message || "Failed to save employee", "error");
      throw err;
    }
  };

  // Toggle Terminate
  const handleConfirmTerminate = async (data: {
    fired_date?: string;
    termination_reason?: string;
  }) => {
    if (!terminateEmployee) return;
    try {
      await api.toggleTerminatePermanent(terminateEmployee.id, data);
      const isTerminated = !terminateEmployee.extra_info?.terminated;
      addToast(
        isTerminated
          ? `Employee ${terminateEmployee.name} has been marked as Terminated`
          : `Employee ${terminateEmployee.name} reactivated to Active standing`
      );
      await loadData();
    } catch (err: any) {
      addToast(err.message || "Failed to update termination status", "error");
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deleteEmployee) return;
    try {
      if (deleteEmployee.employment_type === "PERMANENT") {
        await api.deletePermanentEmployee(deleteEmployee.id);
      } else if (deleteEmployee.employment_type === "CONTRACT") {
        await api.deleteContractEmployee(deleteEmployee.id);
      } else if (deleteEmployee.employment_type === "TEMPORARY") {
        await api.deleteTemporaryEmployee(deleteEmployee.id);
      }
      addToast(`Record for ${deleteEmployee.name} removed successfully`);
      await loadData();
    } catch (err: any) {
      addToast(err.message || "Failed to delete record", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Sticky Header */}
      <Navbar
        health={health}
        apiUrl={apiUrl}
        onUpdateApiUrl={handleUpdateApiUrl}
        onOpenAddModal={() => {
          setEditEmployee(null);
          setIsAddEditOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Summary Cards */}
        <DashboardStats
          stats={stats}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />

        {/* Unified Employee Directory Table & Filter View */}
        <EmployeeTable
          employees={employees}
          loading={loading}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
          onViewEmployee={(emp) => {
            setDetailEmployee(emp);
            setIsDetailOpen(true);
          }}
          onEditEmployee={(emp) => {
            setEditEmployee(emp);
            setIsAddEditOpen(true);
          }}
          onToggleTerminate={(emp) => {
            setTerminateEmployee(emp);
            setIsTerminateOpen(true);
          }}
          onOpenLogs={(emp) => {
            setLogsEmployee(emp);
            setIsLogsOpen(true);
          }}
          onDeleteEmployee={(emp) => {
            setDeleteEmployee(emp);
            setIsDeleteOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            SmartHCM Enterprise Platform • Built with Next.js, TypeScript & Django REST Framework
          </span>
          <span className="font-mono text-slate-400">
            Ethiopian Birr (ETB) • Production-ready on Railway
          </span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <EmployeeModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditEmployee(null);
        }}
        onSave={handleSaveEmployee}
        editEmployee={editEmployee}
      />

      <EmployeeDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailEmployee(null);
        }}
        employee={detailEmployee}
        onEdit={(emp) => {
          setIsDetailOpen(false);
          setEditEmployee(emp);
          setIsAddEditOpen(true);
        }}
        onToggleTerminate={(emp) => {
          setTerminateEmployee(emp);
          setIsTerminateOpen(true);
        }}
        onOpenLogs={(emp) => {
          setLogsEmployee(emp);
          setIsLogsOpen(true);
        }}
      />

      <TemporaryLogsModal
        isOpen={isLogsOpen}
        onClose={() => {
          setIsLogsOpen(false);
          setLogsEmployee(null);
        }}
        employee={logsEmployee}
        onLogsUpdated={loadData}
      />

      <TerminateModal
        isOpen={isTerminateOpen}
        onClose={() => {
          setIsTerminateOpen(false);
          setTerminateEmployee(null);
        }}
        employee={terminateEmployee}
        onConfirm={handleConfirmTerminate}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteEmployee(null);
        }}
        employee={deleteEmployee}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
