export type EmploymentType = "PERMANENT" | "CONTRACT" | "TEMPORARY";

export type WorkingHourType =
  | "NORMAL"
  | "PART"
  | "MORNING"
  | "AFTERNOON"
  | "NIGHT"
  | "SHIFTING";

export type MaritalStatusType = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "OTHER";

export type LogType = "DAILY" | "WEEKLY" | "MONTHLY";

export interface BaseEmployee {
  id: number;
  employee_code: string;
  name: string;
  age?: number | null;
  telephone?: string | null;
  department?: string | null;
  job_position?: string | null;
  salary_birr?: number | string | null;
  nationality?: string | null;
  marital_status?: MaritalStatusType | null;
  address?: string | null;
  sub_city?: string | null;
  wereda?: string | null;
  tin_no?: string | null;
  working_hour?: WorkingHourType | null;
  branch?: string | null;
  hire_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PermanentEmployee extends BaseEmployee {
  employment_type: "PERMANENT";
  fired_date?: string | null;
  terminated: boolean;
  termination_reason?: string | null;
}

export interface ContractEmployee extends BaseEmployee {
  employment_type: "CONTRACT";
  contract_date: string;
  end_date?: string | null;
  is_active: boolean;
  days_remaining?: number | null;
}

export interface TemporaryWorkLog {
  id: number;
  employee: number;
  employee_code?: string;
  employee_name?: string;
  log_type: LogType;
  date: string;
  recorded_value?: number | string | null;
  notes?: string | null;
  created_at?: string;
}

export interface TemporaryEmployee extends BaseEmployee {
  employment_type: "TEMPORARY";
  logs_count: number;
  total_value_logged: number;
  recent_logs: TemporaryWorkLog[];
}

export interface UnifiedEmployee {
  id: number;
  employee_code: string;
  name: string;
  age?: number | null;
  telephone?: string | null;
  department?: string | null;
  job_position?: string | null;
  salary_birr?: number | string | null;
  nationality?: string | null;
  marital_status?: MaritalStatusType | null;
  address?: string | null;
  sub_city?: string | null;
  wereda?: string | null;
  tin_no?: string | null;
  working_hour?: WorkingHourType | null;
  branch?: string | null;
  hire_date?: string | null;
  employment_type: EmploymentType;
  status: string;
  extra_info: Record<string, any>;
}

export interface DashboardStats {
  headcount: {
    total_staff: number;
    permanent_total: number;
    permanent_active: number;
    permanent_terminated: number;
    contract_total: number;
    contract_active: number;
    contract_expiring_soon: number;
    temporary_total: number;
    total_work_logs: number;
  };
  financials: {
    currency: string;
    total_monthly_payroll: number;
    permanent_payroll: number;
    contract_payroll: number;
  };
  departments: Array<{ name: string; count: number }>;
  recent_work_logs: TemporaryWorkLog[];
}

export interface ApiHealth {
  status: "healthy" | "unhealthy";
  database: string;
  timestamp: string;
  service: string;
  version: string;
}
