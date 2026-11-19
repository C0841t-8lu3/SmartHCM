from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"employees/permanent", views.PermanentEmployeeViewSet, basename="permanent-employee")
router.register(r"employees/contract", views.ContractEmployeeViewSet, basename="contract-employee")
router.register(r"employees/temporary", views.TemporaryEmployeeViewSet, basename="temporary-employee")
router.register(r"work-logs", views.TemporaryWorkLogViewSet, basename="work-log")

urlpatterns = [
    # Health check for monitoring and Railway uptime
    path("health/", views.health_check, name="health_check"),
    
    # User / Auth status
    path("auth/me/", views.current_user, name="auth_me"),

    # Aggregated metrics & dashboard
    path("dashboard/stats/", views.dashboard_stats, name="dashboard_stats"),

    # Unified list across permanent, contract, temporary
    path("employees/all/", views.unified_employee_list, name="unified_employee_list"),

    # Router endpoints (CRUD for permanent, contract, temporary, work logs)
    path("", include(router.urls)),
]
