from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("request_for_login/", views.request_for_login, name="request_for_login"),
    path("branches/check_availability/",views.check_branch_availability),

    path("add_new_branch/", views.add_new_branch),
    path("list_branches/", views.list_branches),
    
    path('update_branch/<uuid:branch_id>/', views.update_branch),
    path('delete_branch/<uuid:branch_id>/', views.delete_branch),
    path('block_branch/<uuid:branch_id>/', views.block_branch),

    path("students/check_availability/",views.check_student_availability),
    path("add_new_student/", views.add_new_student),
    path("bulk_add_students/", views.bulk_add_students),
    path("list_all_branches/", views.list_all_branches),

    path("individual_student_register/", views.individual_student_register),
    path("pending_students_approval/", views.pending_students_approval),
    path("list_pending_students_approval/", views.list_pending_students_approval),
    path("list_students/", views.list_students),

    path("approve_student/<uuid:student_id>/", views.approve_student),
    path("reject_student/<uuid:student_id>/", views.reject_student),

    path('update_student/<uuid:student_id>/', views.update_student),
    path("delete_student/<uuid:student_id>/", views.delete_student),
    path("block_student/<uuid:student_id>/", views.block_student),
    
    path("change_password/", views.change_password),
    path("schedule_exam/", views.schedule_exam),
    path("student_exams/", views.student_exams),
    path('exam/start/<uuid:exam_id>/', views.start_exam),
    path('exam/submit/<uuid:exam_id>/', views.submit_exam),

    path("add_new_staff/", views.add_new_staff),
    path("staff/check_availability/",views.check_staff_availability),
    path("bulk_add_staffs/", views.bulk_add_staffs),

    path("list_staffs/", views.list_staffs),
    path('update_staff/<uuid:staff_id>/', views.update_staff),
    path("delete_staff/<uuid:staff_id>/", views.delete_staff),
    path("block_staff/<uuid:staff_id>/", views.block_staff),
    path('schedules_meet/', views.schedules_meet),

    path('list_upcoming_meetings/', views.list_upcoming_meetings),
    path("list_all_teachers/", views.list_all_teachers),

    path('add_timetable/', views.add_timetable),
    path('principal/timetables/', views.list_principal_timetables),
    path('teacher/timetables/', views.list_teacher_timetables),

    path('create_timetable_change_request/', views.create_timetable_change_request),
    path('approve_request/<uuid:request_id>/', views.approve_request),
    path('reject_request/<uuid:request_id>/', views.reject_request),
    path('delete_timetable/<uuid:timetable_id>/', views.delete_timetable),

    path('add_learning_materials/', views.add_learning_materials),
    path("list_all_materials/", views.list_all_materials),

    path("list_all_students/", views.list_all_students),
    path("add_attendance/", views.add_attendance),
    path("list_attendance/", views.list_attendance),
    path("list_all_attendance/", views.list_all_attendance),

    path('get_student_monthly_payment/<uuid:student_id>/', views.get_student_monthly_payment),
    path("add_payment/", views.add_payment),
    path("list_student_fees/<uuid:student_id>/", views.list_student_fees),
    path("delete_student_fees/",views.delete_student_fees),
    path("payment_summary_report/",views.payment_summary_report),

    path("get_current_month_payments/<uuid:student_id>/",views.get_current_month_payments),

    path("get_student_exams/<uuid:student_id>/",views.get_student_exams),


]
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
