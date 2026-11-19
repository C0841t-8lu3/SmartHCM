from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from .models import (
    PermanentEmployee,
    ContractEmployee,
    TemporaryEmployee,
    TemporaryWorkLog,
)


class SmartHCMTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "healthy")
        self.assertEqual(response.data["database"], "connected")

    def test_permanent_employee_creation_and_code_generation(self):
        emp1 = PermanentEmployee.objects.create(
            name="Abebe Bikila",
            department="Engineering",
            job_position="Senior Software Engineer",
            salary_birr=45000.00,
            telephone="+251911223344",
        )
        self.assertTrue(emp1.employee_code.startswith("PERM"))
        
        emp2 = PermanentEmployee.objects.create(
            name="Almaz Ayana",
            department="Operations",
            job_position="Operations Manager",
            salary_birr=50000.00,
        )
        self.assertTrue(emp2.employee_code.startswith("PERM"))
        self.assertNotEqual(emp1.employee_code, emp2.employee_code)

    def test_permanent_employee_toggle_termination(self):
        emp = PermanentEmployee.objects.create(
            name="Derartu Tulu",
            department="HR",
            job_position="HR Specialist",
            salary_birr=32000.00,
        )
        self.assertFalse(emp.terminated)
        
        # Toggle to terminated
        res = self.client.post(f"/api/employees/permanent/{emp.id}/toggle-terminate/", {
            "termination_reason": "End of tenure"
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        emp.refresh_from_db()
        self.assertTrue(emp.terminated)
        self.assertEqual(emp.termination_reason, "End of tenure")
        self.assertIsNotNone(emp.fired_date)

        # Toggle back to active
        res2 = self.client.post(f"/api/employees/permanent/{emp.id}/toggle-terminate/", {}, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        emp.refresh_from_db()
        self.assertFalse(emp.terminated)
        self.assertIsNone(emp.fired_date)

    def test_contract_employee_creation(self):
        emp = ContractEmployee.objects.create(
            name="Haile Gebrselassie",
            department="Logistics",
            job_position="Fleet Coordinator",
            salary_birr=28000.00,
            contract_date=timezone.now().date(),
        )
        self.assertTrue(emp.employee_code.startswith("CONT"))
        
        res = self.client.get(f"/api/employees/contract/{emp.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["employment_type"], "CONTRACT")
        self.assertTrue(res.data["is_active"])

    def test_temporary_employee_and_work_logs(self):
        emp = TemporaryEmployee.objects.create(
            name="Kenenisa Bekele",
            department="Maintenance",
            job_position="Technician",
        )
        self.assertTrue(emp.employee_code.startswith("TEMP"))

        # Add work log via custom action
        log_data = {
            "log_type": "DAILY",
            "recorded_value": 8.5,
            "notes": "Electrical repairs in warehouse B",
        }
        res = self.client.post(f"/api/employees/temporary/{emp.id}/logs/", log_data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(emp.logs.count(), 1)
        self.assertEqual(float(emp.logs.first().recorded_value), 8.5)

        # Retrieve logs
        res_get = self.client.get(f"/api/employees/temporary/{emp.id}/logs/")
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_get.data), 1)

    def test_dashboard_stats(self):
        PermanentEmployee.objects.create(name="Perm 1", salary_birr=10000, department="IT")
        ContractEmployee.objects.create(name="Cont 1", salary_birr=8000, department="IT")
        TemporaryEmployee.objects.create(name="Temp 1", department="Support")

        res = self.client.get("/api/dashboard/stats/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("headcount", res.data)
        self.assertIn("financials", res.data)
        self.assertGreaterEqual(res.data["headcount"]["total_staff"], 3)
        self.assertGreaterEqual(res.data["financials"]["total_monthly_payroll"], 18000)

    def test_unified_search(self):
        PermanentEmployee.objects.create(name="UniqueSearchPerm", department="Finance")
        res = self.client.get("/api/employees/all/?q=UniqueSearchPerm")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["name"], "UniqueSearchPerm")
