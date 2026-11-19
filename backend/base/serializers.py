from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from drf_spectacular.utils import extend_schema_field
from .models import (
    PermanentEmployee,
    ContractEmployee,
    TemporaryEmployee,
    TemporaryWorkLog,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff", "is_superuser"]
        read_only_fields = ["id", "is_staff", "is_superuser"]


class PermanentEmployeeSerializer(serializers.ModelSerializer):
    employment_type = serializers.CharField(default="PERMANENT", read_only=True)

    class Meta:
        model = PermanentEmployee
        fields = "__all__"
        read_only_fields = ["id", "employee_code", "created_at", "updated_at"]

    def validate(self, data):
        # If marked terminated, fired_date should default to today if not provided
        if data.get("terminated") and not data.get("fired_date"):
            data["fired_date"] = timezone.localdate()
        return data


class ContractEmployeeSerializer(serializers.ModelSerializer):
    employment_type = serializers.CharField(default="CONTRACT", read_only=True)
    is_active = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = ContractEmployee
        fields = "__all__"
        read_only_fields = ["id", "employee_code", "created_at", "updated_at"]

    def get_is_active(self, obj) -> bool:
        if not obj.end_date:
            return True
        return obj.end_date >= timezone.localdate()

    def get_days_remaining(self, obj) -> int | None:
        if not obj.end_date:
            return None
        delta = (obj.end_date - timezone.localdate()).days
        return delta


class TemporaryWorkLogSerializer(serializers.ModelSerializer):
    employee_code = serializers.CharField(source="employee.employee_code", read_only=True)
    employee_name = serializers.CharField(source="employee.name", read_only=True)

    class Meta:
        model = TemporaryWorkLog
        fields = [
            "id",
            "employee",
            "employee_code",
            "employee_name",
            "log_type",
            "date",
            "recorded_value",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "employee_code", "employee_name"]


class TemporaryEmployeeSerializer(serializers.ModelSerializer):
    employment_type = serializers.CharField(default="TEMPORARY", read_only=True)
    logs_count = serializers.SerializerMethodField()
    total_value_logged = serializers.SerializerMethodField()
    recent_logs = serializers.SerializerMethodField()

    class Meta:
        model = TemporaryEmployee
        fields = "__all__"
        read_only_fields = ["id", "employee_code", "created_at", "updated_at"]

    def get_logs_count(self, obj) -> int:
        return obj.logs.count()

    def get_total_value_logged(self, obj) -> float:
        total = sum(log.recorded_value or 0 for log in obj.logs.all())
        return float(total)

    @extend_schema_field(TemporaryWorkLogSerializer(many=True))
    def get_recent_logs(self, obj):
        logs = obj.logs.all().order_by("-date", "-id")[:3]
        return TemporaryWorkLogSerializer(logs, many=True).data


class UnifiedEmployeeSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    employee_code = serializers.CharField()
    name = serializers.CharField()
    age = serializers.IntegerField(allow_null=True)
    telephone = serializers.CharField(allow_null=True)
    department = serializers.CharField(allow_null=True)
    job_position = serializers.CharField(allow_null=True)
    salary_birr = serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True)
    nationality = serializers.CharField(allow_null=True)
    marital_status = serializers.CharField(allow_null=True)
    address = serializers.CharField(allow_null=True)
    sub_city = serializers.CharField(allow_null=True)
    wereda = serializers.CharField(allow_null=True)
    tin_no = serializers.CharField(allow_null=True)
    working_hour = serializers.CharField(allow_null=True)
    branch = serializers.CharField(allow_null=True)
    hire_date = serializers.DateField(allow_null=True)
    employment_type = serializers.CharField()
    status = serializers.CharField()
    extra_info = serializers.DictField(default=dict)
