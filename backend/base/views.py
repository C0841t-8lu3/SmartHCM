from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Avg, Count, Q
from django.db import connection
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .models import (
    PermanentEmployee,
    ContractEmployee,
    TemporaryEmployee,
    TemporaryWorkLog,
)
from .serializers import (
    PermanentEmployeeSerializer,
    ContractEmployeeSerializer,
    TemporaryEmployeeSerializer,
    TemporaryWorkLogSerializer,
    UnifiedEmployeeSerializer,
    UserSerializer,
)


# ---------- Health Check Endpoint ----------
@extend_schema(
    summary="Service Health Check",
    description="Validates database connectivity and service health for Railway and uptime monitors.",
    responses={200: OpenApiTypes.OBJECT, 503: OpenApiTypes.OBJECT},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for Railway, Docker, and uptime monitoring.
    Verifies database connectivity and system status.
    """
    db_ok = True
    db_error = None
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as exc:
        db_ok = False
        db_error = str(exc)

    status_code = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE
    return Response(
        {
            "status": "healthy" if db_ok else "unhealthy",
            "database": "connected" if db_ok else f"error: {db_error}",
            "timestamp": timezone.now().isoformat(),
            "service": "SmartHCM API",
            "version": "2.0.0",
        },
        status=status_code,
    )


# ---------- Auth Me Endpoint ----------
@extend_schema(
    summary="Current User Profile",
    description="Returns profile and roles of currently authenticated user or guest info.",
    responses={200: UserSerializer},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def current_user(request):
    """
    Returns the currently authenticated user profile or guest status.
    """
    if request.user and request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response(
        {
            "id": None,
            "username": "guest",
            "is_authenticated": False,
            "is_staff": False,
        }
    )


# ---------- Dashboard Stats ----------
@extend_schema(
    summary="Dashboard Metrics & Statistics",
    description="Aggregates headcounts across employee types, payroll sums in ETB, and department distributions.",
    responses={200: OpenApiTypes.OBJECT},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def dashboard_stats(request):
    """
    Aggregates HCM metrics: headcounts, department distribution,
    payroll commitments, and recent work log activity.
    """
    perm_qs = PermanentEmployee.objects.all()
    cont_qs = ContractEmployee.objects.all()
    temp_qs = TemporaryEmployee.objects.all()

    total_perm = perm_qs.count()
    active_perm = perm_qs.filter(terminated=False).count()
    terminated_perm = perm_qs.filter(terminated=True).count()

    total_cont = cont_qs.count()
    today = timezone.localdate()
    active_cont = cont_qs.filter(Q(end_date__gte=today) | Q(end_date__isnull=True)).count()
    expiring_soon_cont = cont_qs.filter(
        end_date__gte=today,
        end_date__lte=today + timedelta(days=30)
    ).count()

    total_temp = temp_qs.count()
    total_work_logs = TemporaryWorkLog.objects.count()

    # Payroll sums in ETB (Birr)
    perm_payroll = perm_qs.filter(terminated=False).aggregate(total=Sum("salary_birr"))["total"] or 0
    cont_payroll = cont_qs.aggregate(total=Sum("salary_birr"))["total"] or 0
    total_monthly_payroll = float(perm_payroll + cont_payroll)

    total_staff = total_perm + total_cont + total_temp

    # Department breakdown
    dept_counts = {}
    for item in perm_qs.values("department").annotate(count=Count("id")):
        dept = item["department"] or "Unassigned"
        dept_counts[dept] = dept_counts.get(dept, 0) + item["count"]
    for item in cont_qs.values("department").annotate(count=Count("id")):
        dept = item["department"] or "Unassigned"
        dept_counts[dept] = dept_counts.get(dept, 0) + item["count"]
    for item in temp_qs.values("department").annotate(count=Count("id")):
        dept = item["department"] or "Unassigned"
        dept_counts[dept] = dept_counts.get(dept, 0) + item["count"]

    departments = [{"name": k, "count": v} for k, v in sorted(dept_counts.items(), key=lambda x: -x[1])[:8]]

    # Recent activity logs
    recent_logs = TemporaryWorkLogSerializer(
        TemporaryWorkLog.objects.select_related("employee").order_by("-id")[:5],
        many=True
    ).data

    return Response({
        "headcount": {
            "total_staff": total_staff,
            "permanent_total": total_perm,
            "permanent_active": active_perm,
            "permanent_terminated": terminated_perm,
            "contract_total": total_cont,
            "contract_active": active_cont,
            "contract_expiring_soon": expiring_soon_cont,
            "temporary_total": total_temp,
            "total_work_logs": total_work_logs,
        },
        "financials": {
            "currency": "ETB",
            "total_monthly_payroll": total_monthly_payroll,
            "permanent_payroll": float(perm_payroll),
            "contract_payroll": float(cont_payroll),
        },
        "departments": departments,
        "recent_work_logs": recent_logs,
    })


# ---------- Unified Employees Search/List ----------
@extend_schema(
    summary="Unified Employee Directory",
    description="Unified search and filtering across Permanent, Contract, and Temporary employees.",
    parameters=[
        OpenApiParameter(name="q", description="Search query across name, code, dept, position", required=False, type=str),
        OpenApiParameter(name="type", description="Filter by employment type: PERMANENT, CONTRACT, TEMPORARY", required=False, type=str),
        OpenApiParameter(name="department", description="Filter by exact department name", required=False, type=str),
    ],
    responses={200: UnifiedEmployeeSerializer(many=True)},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def unified_employee_list(request):
    """
    Returns a unified search and list of all employees across all three types.
    Supports query parameter '?q=' for search and '?type=PERMANENT|CONTRACT|TEMPORARY'.
    """
    q = request.query_params.get("q", "").strip()
    emp_type = request.query_params.get("type", "").upper()
    dept = request.query_params.get("department", "").strip()

    items = []

    if not emp_type or emp_type == "PERMANENT":
        qs = PermanentEmployee.objects.all()
        if q:
            qs = qs.filter(
                Q(name__icontains=q) |
                Q(employee_code__icontains=q) |
                Q(department__icontains=q) |
                Q(job_position__icontains=q) |
                Q(telephone__icontains=q)
            )
        if dept:
            qs = qs.filter(department__iexact=dept)
        for emp in qs:
            items.append({
                "id": emp.id,
                "employee_code": emp.employee_code,
                "name": emp.name,
                "age": emp.age,
                "telephone": emp.telephone,
                "department": emp.department,
                "job_position": emp.job_position,
                "salary_birr": emp.salary_birr,
                "nationality": emp.nationality,
                "marital_status": emp.marital_status,
                "address": emp.address,
                "sub_city": emp.sub_city,
                "wereda": emp.wereda,
                "tin_no": emp.tin_no,
                "working_hour": emp.working_hour,
                "branch": emp.branch,
                "hire_date": emp.hire_date,
                "employment_type": "PERMANENT",
                "status": "Terminated" if emp.terminated else "Active",
                "extra_info": {
                    "terminated": emp.terminated,
                    "fired_date": emp.fired_date,
                    "termination_reason": emp.termination_reason,
                },
            })

    if not emp_type or emp_type == "CONTRACT":
        qs = ContractEmployee.objects.all()
        if q:
            qs = qs.filter(
                Q(name__icontains=q) |
                Q(employee_code__icontains=q) |
                Q(department__icontains=q) |
                Q(job_position__icontains=q) |
                Q(telephone__icontains=q)
            )
        if dept:
            qs = qs.filter(department__iexact=dept)
        today = timezone.localdate()
        for emp in qs:
            is_active = not emp.end_date or emp.end_date >= today
            items.append({
                "id": emp.id,
                "employee_code": emp.employee_code,
                "name": emp.name,
                "age": emp.age,
                "telephone": emp.telephone,
                "department": emp.department,
                "job_position": emp.job_position,
                "salary_birr": emp.salary_birr,
                "nationality": emp.nationality,
                "marital_status": emp.marital_status,
                "address": emp.address,
                "sub_city": emp.sub_city,
                "wereda": emp.wereda,
                "tin_no": emp.tin_no,
                "working_hour": emp.working_hour,
                "branch": emp.branch,
                "hire_date": emp.hire_date,
                "employment_type": "CONTRACT",
                "status": "Active" if is_active else "Expired",
                "extra_info": {
                    "contract_date": emp.contract_date,
                    "end_date": emp.end_date,
                    "is_active": is_active,
                },
            })

    if not emp_type or emp_type == "TEMPORARY":
        qs = TemporaryEmployee.objects.all()
        if q:
            qs = qs.filter(
                Q(name__icontains=q) |
                Q(employee_code__icontains=q) |
                Q(department__icontains=q) |
                Q(job_position__icontains=q) |
                Q(telephone__icontains=q)
            )
        if dept:
            qs = qs.filter(department__iexact=dept)
        for emp in qs:
            items.append({
                "id": emp.id,
                "employee_code": emp.employee_code,
                "name": emp.name,
                "age": emp.age,
                "telephone": emp.telephone,
                "department": emp.department,
                "job_position": emp.job_position,
                "salary_birr": emp.salary_birr,
                "nationality": emp.nationality,
                "marital_status": emp.marital_status,
                "address": emp.address,
                "sub_city": emp.sub_city,
                "wereda": emp.wereda,
                "tin_no": emp.tin_no,
                "working_hour": emp.working_hour,
                "branch": emp.branch,
                "hire_date": emp.hire_date,
                "employment_type": "TEMPORARY",
                "status": "Active",
                "extra_info": {
                    "logs_count": emp.logs.count(),
                },
            })

    # Sort items by name
    items.sort(key=lambda x: x["name"].lower())

    serializer = UnifiedEmployeeSerializer(items, many=True)
    return Response({
        "count": len(items),
        "results": serializer.data,
    })


# ---------- ViewSets ----------
class PermanentEmployeeViewSet(viewsets.ModelViewSet):
    queryset = PermanentEmployee.objects.all()
    serializer_class = PermanentEmployeeSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["terminated", "department", "branch", "working_hour"]
    search_fields = ["name", "employee_code", "department", "job_position", "telephone", "tin_no"]
    ordering_fields = ["name", "employee_code", "hire_date", "salary_birr", "fired_date", "id"]
    ordering = ["terminated", "name"]

    @action(detail=True, methods=["post"], url_path="toggle-terminate")
    def toggle_terminate(self, request, pk=None):
        employee = self.get_object()
        employee.terminated = not employee.terminated
        if employee.terminated:
            employee.fired_date = request.data.get("fired_date", timezone.localdate())
            employee.termination_reason = request.data.get("termination_reason", "Terminated via system")
        else:
            employee.fired_date = None
            employee.termination_reason = None
        employee.save()
        return Response(self.get_serializer(employee).data)


class ContractEmployeeViewSet(viewsets.ModelViewSet):
    queryset = ContractEmployee.objects.all()
    serializer_class = ContractEmployeeSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["department", "branch", "working_hour"]
    search_fields = ["name", "employee_code", "department", "job_position", "telephone", "tin_no"]
    ordering_fields = ["name", "employee_code", "contract_date", "end_date", "salary_birr", "id"]
    ordering = ["-contract_date", "name"]


class TemporaryEmployeeViewSet(viewsets.ModelViewSet):
    queryset = TemporaryEmployee.objects.all()
    serializer_class = TemporaryEmployeeSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["department", "branch", "working_hour"]
    search_fields = ["name", "employee_code", "department", "job_position", "telephone", "tin_no"]
    ordering_fields = ["name", "employee_code", "salary_birr", "id"]
    ordering = ["name"]

    @action(detail=True, methods=["get", "post"], url_path="logs")
    def logs(self, request, pk=None):
        employee = self.get_object()
        if request.method == "POST":
            data = request.data.copy()
            data["employee"] = employee.id
            serializer = TemporaryWorkLogSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        logs = employee.logs.all().order_by("-date", "-id")
        serializer = TemporaryWorkLogSerializer(logs, many=True)
        return Response(serializer.data)


class TemporaryWorkLogViewSet(viewsets.ModelViewSet):
    queryset = TemporaryWorkLog.objects.select_related("employee").all()
    serializer_class = TemporaryWorkLogSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["employee", "log_type", "date"]
    search_fields = ["employee__name", "employee__employee_code", "notes"]
    ordering_fields = ["date", "recorded_value", "id"]
    ordering = ["-date", "-id"]
