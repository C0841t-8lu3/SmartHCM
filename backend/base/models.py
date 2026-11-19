from django.db import models
from django.utils import timezone


# ---------- Employee Code Generators ----------
def _next_code(prefix: str, qs):
    """
    Safely generates the next unique employee code by finding the maximum
    sequence number currently stored with the given prefix.
    """
    codes = qs.values_list("employee_code", flat=True)
    max_num = 0
    for code in codes:
        if code and code.startswith(prefix):
            digits = "".join(ch for ch in code[len(prefix):] if ch.isdigit())
            if digits:
                try:
                    max_num = max(max_num, int(digits))
                except ValueError:
                    pass
    return f"{prefix}{max_num + 1:03d}"


# ---------- Common / Abstract ----------
class BaseEmployee(models.Model):
    """
    Abstract base for shared fields across employee types.
    """
    MARITAL_CHOICES = [
        ("SINGLE", "Single"),
        ("MARRIED", "Married"),
        ("DIVORCED", "Divorced"),
        ("WIDOWED", "Widowed"),
        ("OTHER", "Other"),
    ]

    WORKING_HOUR_CHOICES = [
        ("NORMAL", "Normal Hour"),
        ("PART", "Part Time"),
        ("MORNING", "Morning"),
        ("AFTERNOON", "Afternoon"),
        ("NIGHT", "Night"),
        ("SHIFTING", "Shifting"),
    ]

    employee_code = models.CharField(max_length=20, unique=True, editable=False, db_index=True)
    name = models.CharField(max_length=200, db_index=True)
    age = models.PositiveIntegerField(blank=True, null=True)

    # Contact
    telephone = models.CharField(max_length=50, blank=True, null=True)

    # Job
    department = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    job_position = models.CharField(max_length=100, blank=True, null=True, db_index=True)

    # Pay (in Ethiopian Birr)
    salary_birr = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    # Extra demographic and address fields
    nationality = models.CharField(max_length=100, blank=True, null=True, default="Ethiopian")
    marital_status = models.CharField(
        max_length=20,
        choices=MARITAL_CHOICES,
        blank=True, null=True
    )
    address = models.CharField(max_length=255, blank=True, null=True)
    sub_city = models.CharField(max_length=100, blank=True, null=True)
    wereda = models.CharField(max_length=100, blank=True, null=True)
    tin_no = models.CharField(max_length=50, blank=True, null=True)

    working_hour = models.CharField(
        max_length=50,
        choices=WORKING_HOUR_CHOICES,
        blank=True, null=True,
        default="NORMAL"
    )
    branch = models.CharField(max_length=100, blank=True, null=True)
    hire_date = models.DateField(blank=True, null=True, default=timezone.localdate)

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.employee_code} • {self.name}"


# ---------- Permanent ----------
class PermanentEmployee(BaseEmployee):
    fired_date = models.DateField(blank=True, null=True)
    terminated = models.BooleanField(default=False, db_index=True)
    termination_reason = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["terminated", "name"]
        verbose_name = "Permanent Employee"
        verbose_name_plural = "Permanent Employees"

    def save(self, *args, **kwargs):
        if not self.employee_code:
            self.employee_code = _next_code("PERM", PermanentEmployee.objects)
        super().save(*args, **kwargs)


# ---------- Contract ----------
class ContractEmployee(BaseEmployee):
    contract_date = models.DateField(default=timezone.localdate)
    end_date = models.DateField(blank=True, null=True)

    class Meta:
        ordering = ["-contract_date", "name"]
        verbose_name = "Contract Employee"
        verbose_name_plural = "Contract Employees"

    def save(self, *args, **kwargs):
        if not self.employee_code:
            self.employee_code = _next_code("CONT", ContractEmployee.objects)
        super().save(*args, **kwargs)


# ---------- Temporary ----------
class TemporaryEmployee(BaseEmployee):
    class Meta:
        ordering = ["name"]
        verbose_name = "Temporary Employee"
        verbose_name_plural = "Temporary Employees"

    def save(self, *args, **kwargs):
        if not self.employee_code:
            self.employee_code = _next_code("TEMP", TemporaryEmployee.objects)
        super().save(*args, **kwargs)


class TemporaryWorkLog(models.Model):
    LOG_TYPES = [
        ("DAILY", "Daily"),
        ("WEEKLY", "Weekly"),
        ("MONTHLY", "Monthly"),
    ]
    employee = models.ForeignKey(
        TemporaryEmployee,
        on_delete=models.CASCADE,
        related_name="logs"
    )
    log_type = models.CharField(max_length=10, choices=LOG_TYPES)
    date = models.DateField(default=timezone.localdate)
    recorded_value = models.DecimalField(
        max_digits=12, decimal_places=2, blank=True, null=True,
        help_text="Hours logged or payment value in Birr"
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        ordering = ["-date", "-id"]
        verbose_name = "Temporary Work Log"
        verbose_name_plural = "Temporary Work Logs"

    def __str__(self):
        return f"{self.employee.employee_code} • {self.log_type} • {self.date}"
