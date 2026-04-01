from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.conf import settings
from apps.core.serializers import BranchSerializer, BranchDetailSerializer, BranchUpdateSerializer, StudentSerializer, BulkStudentSerializer, StudentRegisterSerializer, PendingStudentListSerializer, ApproveStudentSerializer, StudentUpdateSerializer, ExamScheduleSerializer, StudentExamSerializer, ExamSerializer, AddStaffSerializer, BulkStaffSerializer, StaffListSerializer, StaffUpdateSerializer, ScheduleMeetListSerializer, TimetableSerializer, TimetableListSerializer, TimetableChangeRequestCreateSerializer, NotesSerializer, SyllabusSerializer, RecordingsSerializer, MonthlyPaymentCreateSerializer, StudentMonthlyPaymentListSerializer, MonthlyPaymentSerializer

from apps.core.models import User, BranchProfile, ParentProfile, StudentProfile, Exam, Question, StudentExam, StudentAnswer, TeacherProfile, PrincipalProfile, ScheduleMeet, Timetable, TimetableChangeRequest, Notes, Syllabus, Recordings, Attendance, MonthlyPayment, DeletedMonthlyPayment
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction
from datetime import datetime, timedelta
from datetime import date
from django.utils import timezone
from zoneinfo import ZoneInfo
from django.utils.dateparse import parse_date, parse_time
from django.db import IntegrityError
from decimal import Decimal
from django.db.models import Count, Sum
from decimal import Decimal, ROUND_HALF_UP


@api_view(['POST'])
@permission_classes([AllowAny])
def request_for_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"message": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"message": "Invalid username or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {"message": "Account is inactive"},
            status=status.HTTP_403_FORBIDDEN
        )

    resolved_role = user.role if user.role else "ADMIN"

    token, _ = Token.objects.get_or_create(user=user)

    branch_name = None
    student_id = None
    teacher_id = None
    principal_id = None
    parent_id = None
    branch_id = None 

    if resolved_role == "BRANCH" and hasattr(user, "branch_profile"):
        branch_id = str(user.branch_profile.id)
        branch_name = user.branch_profile.branch_name

    elif resolved_role == "STUDENT" and hasattr(user, "student_profile"):
        student = user.student_profile
        student_id = str(student.id)
        branch_id = str(student.branch.id)
        branch_name = student.branch.branch_name

    elif resolved_role == "TEACHER" and hasattr(user, "teacher_profile"):
        teacher = user.teacher_profile
        teacher_id = str(teacher.id)
        branch_id = str(teacher.branch.id)
        branch_name = teacher.branch.branch_name

    elif resolved_role == "PRINCIPAL" and hasattr(user, "principal_profile"):
        principal = user.principal_profile
        principal_id = str(principal.id)
        branch_id = str(principal.branch.id)
        branch_name = principal.branch.branch_name

    elif resolved_role == "PARENT" and hasattr(user, "parent_profile"):
        parent = user.parent_profile
        parent_id = str(parent.id)
        
        student = parent.students.first()
        if student:
            student_id = str(student.id)
            branch_id = str(student.branch.id)
            branch_name = student.branch.branch_name
        else:
            student_id = None
            branch_id = None
            branch_name = None


    return Response(
        {
            "token": token.key,
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "role": resolved_role,
                "is_superuser": user.is_superuser,
                "branch_id": branch_id,
                "branch_name": branch_name,
                "student_id": student_id,
                "teacher_id": teacher_id,
                "principal_id": principal_id,
                "parent_id": parent_id,
            }
        },
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def check_branch_availability(request):
    branch_name = request.query_params.get("branch_name")
    email = request.query_params.get("email")
    contact_number = request.query_params.get("contact_number")
    username = request.query_params.get("username")
    exclude_branch_id = request.query_params.get("exclude_branch_id")

    branch_filter = BranchProfile.objects.all()
    user_filter = User.objects.filter(role='BRANCH')

    if exclude_branch_id:
        branch_filter = branch_filter.exclude(id=exclude_branch_id)
        user_filter = user_filter.exclude(branch_profile__id=exclude_branch_id)

    data = {}

    if branch_name:
        data["branch_name"] = not branch_filter.filter(branch_name__iexact=branch_name).exists()
    if email:
        data["email"] = not (branch_filter.filter(email__iexact=email).exists() or user_filter.filter(email__iexact=email).exists())
    if contact_number:
        data["contact_number"] = not branch_filter.filter(contact_number=contact_number).exists()
    if username:
        data["username"] = not user_filter.filter(username__iexact=username).exists()

    return Response(data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_new_branch(request):
    if not request.user.is_superuser:
        return Response(
            {"error": "Only admins can create branches"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = BranchSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    branch = serializer.save()

    send_mail(
        subject="Your Branch Account Credentials",
        message=(
            f"Hello {branch.branch_name},\n\n"
            f"Your account has been created.\n"
            f"Username: {branch.user.username}\n"
            f"Password: {branch._generated_password}\n\n"
            f"Please login and change your password."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[branch.user.email],
        fail_silently=False
    )

    return Response(
        {"message": "Branch created successfully"},
        status=201
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_branches(request):
    if not request.user.is_superuser:
        return Response({"error": "Only admins can view branches"}, status=403)

    branches = BranchProfile.objects.select_related('user').all()
    serializer = BranchDetailSerializer(branches, many=True)
    return Response(serializer.data, status=200)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_branch(request, branch_id):
    if not request.user.is_superuser:
        raise PermissionDenied("Only superadmin can update branch details")

    branch = get_object_or_404(
        BranchProfile.objects.select_related('user'),
        id=branch_id
    )

    serializer = BranchUpdateSerializer(
        instance=branch,
        data=request.data,
        partial=True
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer.save()

    return Response(
        {"message": "Branch updated successfully"},
        status=status.HTTP_200_OK
    )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_branch(request, branch_id):
    if not request.user.is_superuser:
        raise PermissionDenied("Only superadmin can delete a branch")

    branch = get_object_or_404(BranchProfile.objects.select_related('user'), id=branch_id)
    user = branch.user

    try:
        with transaction.atomic():
            branch.delete()

            user.delete()

        return Response(
            {"message": "Branch and associated user deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": f"Failed to delete branch: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def block_branch(request, branch_id):
    if not request.user.is_superuser:
        raise PermissionDenied("Only superadmin can block/unblock a branch")

    branch = get_object_or_404(BranchProfile.objects.select_related('user'), id=branch_id)
    user = branch.user

    is_active = request.data.get('is_active')
    if is_active is None:
        return Response(
            {"error": "is_active field is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.is_active = bool(is_active)
    user.save()

    return Response(
        {
            "message": f"Branch {'unblocked' if user.is_active else 'blocked'} successfully",
            "is_active": user.is_active
        },
        status=status.HTTP_200_OK
    )

@api_view(["GET"])
@permission_classes([AllowAny])
def check_student_availability(request):
    username = request.query_params.get("username")
    email = request.query_params.get("email")
    phone = request.query_params.get("phone_number")
    parent_email = request.query_params.get("parent_email")
    parent_phone = request.query_params.get("parent_phone")
    exclude_student_id = request.query_params.get("exclude_student_id")

    data = {}

    if username:
        username = username.strip().lower()
        user_qs = User.objects.all()

        if exclude_student_id:
            user_qs = user_qs.exclude(student_profile__id=exclude_student_id)

        data["username"] = not user_qs.filter(username__iexact=username).exists()

    if email:
        email = email.strip().lower()
        data["email"] = not (
            User.objects.filter(email__iexact=email).exists()
            or StudentProfile.objects.filter(email__iexact=email).exists()
        )

    if phone:
        phone = phone.strip()
        data["phone_number"] = not StudentProfile.objects.filter(
            phone_number=phone
        ).exists()

    if parent_email:
        parent_email = parent_email.strip().lower()
        data["parent_email"] = not (
            User.objects.filter(email__iexact=parent_email).exists()
            or ParentProfile.objects.filter(email__iexact=parent_email).exists()
        )

    if parent_phone:
        parent_phone = parent_phone.strip()
        data["parent_phone"] = not ParentProfile.objects.filter(
            phone_number=parent_phone
        ).exists()

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_new_student(request):
    serializer = StudentSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    student = serializer.save() 

    send_mail(
        subject="Your Student Account Credentials",
        message=(
            f"Hello {student.full_name},\n\n"
            f"Your registration was successful! Log in using the credentials below:\n"
            f"Username: {student.user.username}\n"
            f"Password: {student._generated_password}\n\n"
            f"Please login and change your password."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[student.user.email],
        fail_silently=False
    )

    parent = student.parent
    parent_user = parent.user
    send_mail(
        subject="Your Parent Account Credentials",
        message=(
            f"Hello {parent.full_name},\n\n"
            f"Your parent account was created! Log in using the credentials below:\n"
            f"Username: {parent_user._generated_username}\n"
            f"Password: {parent_user._generated_password}\n\n"
            f"Please login and change your password."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[parent_user.email],
        fail_silently=False
    )

    return Response(
        {"message": "Student and parent registered successfully"},
        status=201
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bulk_add_students(request):
    if request.user.role != "BRANCH":
        return Response({"error": "Only branches can upload students"}, status=403)

    try:
        branch = request.user.branch_profile
    except Exception:
        return Response({"error": "Branch profile not found"}, status=400)

    rows = request.data.get("students", [])
    if not rows:
        return Response({"error": "No student data provided"}, status=400)

    created, errors = [], []

    with transaction.atomic():
        for idx, row in enumerate(rows, start=2):
            serializer = BulkStudentSerializer(data=row, context={"branch": branch})

            if not serializer.is_valid():
                errors.append({"row": idx, "errors": serializer.errors})
                continue

            try:
                student = serializer.save()

                send_mail(
                    "Student Account Credentials",
                    f"""
                    Hello {student.full_name},

                    Username: {student.user.username}
                    Password: {student._student_password}
                    """,
                    settings.DEFAULT_FROM_EMAIL,
                    [student.email],
                )

                send_mail(
                    "Parent Account Credentials",
                    f"""
                    Hello {student.parent.full_name},
                    Username: {student._parent_username}
                    Password: {student._parent_password}
                    """,
                    settings.DEFAULT_FROM_EMAIL,
                    [student.parent.email],
                )

                created.append(student.full_name)

            except Exception as e:
                errors.append({"row": idx, "errors": str(e)})

    return Response(
        {
            "created_count": len(created),
            "failed_count": len(errors),
            "errors": errors,
        },
        status=201 if created else 400,
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def list_all_branches(request):
    branches = BranchProfile.objects.values('id', 'branch_name')
    return Response(branches, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def individual_student_register(request):

    serializer = StudentRegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    student = serializer.save()

    send_mail(
        subject="Student Registration Submitted",
        message=(
            f"Hello {student.full_name},\n\n"
            "Your registration was successful.\n"
            "Please wait for admin approval.\n\n"
            "You will receive another email once your account is approved.\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[student.user.email],
        fail_silently=False
    )

    send_mail(
        subject="Student Registration Submitted",
        message=(
            f"Hello {student.parent.full_name},\n\n"
            f"The registration for {student.full_name} was submitted successfully.\n"
            "Please wait for admin approval.\n\n"
            "You will receive credentials once the account is approved.\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[student.parent.email],
        fail_silently=False
    )

    return Response(
        {"message": "Student registered successfully. Awaiting admin approval."},
        status=201
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_students_approval(request):
    if not request.user.is_superuser:
        return Response({"error": "Only admins can view approvals"}, status=403)

    count = StudentProfile.objects.filter(is_approved=False).count()
    return Response({"pending_count": count})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_pending_students_approval(request):
    if not request.user.is_superuser:
        return Response({"error": "Only admins can list it"}, status=403)

    students = (
        StudentProfile.objects
        .filter(is_approved=False)
        .select_related("branch")
        .order_by("-created_at")
    )

    serializer = PendingStudentListSerializer(students, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_students(request):

    students = (
        StudentProfile.objects
        .filter(is_approved=True)
        .select_related("branch")
        .order_by("-created_at")
    )

    serializer = PendingStudentListSerializer(students, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_student(request, student_id):
    if not request.user.is_superuser:
        return Response({"error": "Only admin"}, status=403)

    student = get_object_or_404(StudentProfile, id=student_id)

    if student.is_approved:
        return Response(
            {"detail": "Student already approved"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = ApproveStudentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        with transaction.atomic():
            student = serializer.approve(
                student=student,
                approved_by=request.user,
            )

            send_mail(
                subject="Your Student Account Credentials",
                message=(
                    f"Hello {student.full_name},\n\n"
                    f"Username: {student.user.username}\n"
                    f"Password: {student._student_password}\n\n"
                    "Please login and change your password immediately."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[student.user.email],
                fail_silently=False,
            )

            send_mail(
                subject="Your Parent Account Credentials",
                message=(
                    f"Hello {student.parent.full_name},\n\n"
                    f"Username: {student.parent.user.username}\n"
                    f"Password: {student._parent_password}\n\n"
                    "Please login and change your password immediately."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[student.parent.email],
                fail_silently=False,
            )

        return Response(
            {"detail": "Student and parent approved. Credentials sent."},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {
                "detail": "Approval failed.",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def reject_student(request, student_id):
    if not request.user.is_superuser:
        return Response({"error": "Only admin"}, status=403)

    student = get_object_or_404(StudentProfile, id=student_id)

    student_user = student.user
    parent = student.parent
    parent_user = parent.user if parent else None

    student_email = student_user.email
    parent_email = parent.email if parent else None

    student_name = student.full_name
    parent_name = parent.full_name if parent else None

    try:
        with transaction.atomic():
            student.delete()

            student_user.delete()

            if parent:
                parent.delete()
                parent_user.delete()

        send_mail(
            subject="Student Registration Rejected",
            message=(
                f"Hello {student_name},\n\n"
                "Your registration request has been rejected by the admin.\n"
                "You may register again or contact support for assistance."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[student_email],
            fail_silently=False,
        )

        if parent_email:
            send_mail(
                subject="Student Registration Rejected",
                message=(
                    f"Hello {parent_name},\n\n"
                    "The student registration linked to your details "
                    "has been rejected by the admin.\n"
                    "Please contact support if you have questions."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[parent_email],
                fail_silently=False,
            )

        return Response(
            {"detail": "Student and parent rejected and removed successfully"},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {
                "detail": "Rejection failed",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    
@api_view(['PUT'])
@permission_classes([AllowAny])
def update_student(request, student_id):
    student = get_object_or_404(StudentProfile, id=student_id)

    serializer = StudentUpdateSerializer(
        instance=student,
        data=request.data,
        partial=True
    )

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save()
    return Response({"message": "Student updated successfully"}, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def delete_student(request, student_id):
    student = get_object_or_404(StudentProfile, id=student_id)

    student_user = student.user
    parent_profile = student.parent
    parent_user = parent_profile.user if parent_profile else None

    try:
        with transaction.atomic():
            student.delete()

            if student_user:
                student_user.delete()

            if parent_profile:
                parent_profile.delete()

            if parent_user:
                parent_user.delete()

        return Response(
            {"detail": "Student and parent deleted successfully"},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {
                "detail": "Failed to delete student and parent",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def block_student(request, student_id):
    student = get_object_or_404(StudentProfile, id=student_id)
    user = student.user

    user.is_active = not user.is_active
    user.save()

    return Response(
        {
            "message": f"Student {'unblocked' if user.is_active else 'blocked'} successfully",
            "is_active": user.is_active
        },
        status=status.HTTP_200_OK
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not user.check_password(current_password):
        return Response({"message": "Current password is incorrect"}, status=400)
    
    user.set_password(new_password)
    user.save()

    if user.role == "BRANCH":
        try:
            branch_profile = user.branch_profile
            branch_profile.encrypted_password = new_password
            branch_profile.save()
        except Exception as e:
            return Response({"message": f"Password updated for user, but failed for branch profile: {str(e)}"}, status=500)


    return Response({"message": "Password changed successfully"})

import logging

logger = logging.getLogger(__name__)

def send_exam_email(student, exam):
    try:
        send_mail(
            subject="Exam Scheduled",
            message=(
                f"Hello {student.full_name},\n\n"
                f"A new exam has been scheduled.\n\n"
                f"Exam name: {exam.exam_name}\n"
                f"Date: {exam.date}\n"
                f"Start Time: {exam.start_time}\n"
                f"Duration: {exam.duration_minutes} minutes\n\n"
                f"Please login and attend the exam on time."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[student.email],
            fail_silently=False,
        )
    except Exception as e:
        logger.error(f"Failed to send exam mail to {student.email}: {e}")

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def schedule_exam(request):
    if request.user.role != "BRANCH":
        return Response({"error": "Only branches can schedule exams"}, status=403)

    try:
        branch = request.user.branch_profile
    except Exception:
        return Response({"error": "Branch profile not found for user"}, status=400)

    questions = request.data.get("questions")
    if not isinstance(questions, list) or not questions:
        return Response(
            {"error": "Questions list is required and cannot be empty"},
            status=400,
        )

    questions_count = request.data.get("questions_count")

    if questions_count is None:
        return Response(
            {"error": "questions_count is required"},
            status=400,
        )

    if int(questions_count) != len(questions):
        return Response(
            {
                "error": "questions_count mismatch",
                "details": {
                    "questions_count": questions_count,
                    "actual_questions": len(questions),
                },
            },
            status=400,
        )

    required_fields = [
        "Question",
        "Option A",
        "Option B",
        "Option C",
        "Option D",
        "Correct Answer",
    ]

    for idx, q in enumerate(questions, start=1):
        if "question" not in q or not str(q["question"]).strip():
            return Response({
                "error": "Excel validation failed",
                "details": f"Question {idx} missing field: question"
            }, status=400)
        
        if "options" not in q or not isinstance(q["options"], dict):
            return Response({
                "error": "Excel validation failed",
                "details": f"Question {idx} missing field: options"
            }, status=400)
        
        for opt in ["A", "B", "C", "D"]:
            if opt not in q["options"] or not str(q["options"][opt]).strip():
                return Response({
                    "error": "Excel validation failed",
                    "details": f"Question {idx} missing option: {opt}"
                }, status=400)

        if "correct_answer" not in q or not str(q["correct_answer"]).strip():
            return Response({
                "error": "Excel validation failed",
                "details": f"Question {idx} missing field: correct_answer"
            }, status=400)

    normalized_questions = []
    for q in questions:
        normalized_questions.append({
            "question_text": q["question"].strip(),
            "option_a": str(q["options"]["A"]).strip(),
            "option_b": str(q["options"]["B"]).strip(),
            "option_c": str(q["options"]["C"]).strip(),
            "option_d": str(q["options"]["D"]).strip(),
            "correct_answer": q["correct_answer"].strip(),
            "statements": q.get("statements", []),
        })


    payload = {
        "exam_name": request.data.get("exam_name"),
        "date": request.data.get("date"),
        "start_time": request.data.get("start_time"),
        "duration_minutes": request.data.get("duration_minutes"),
        "questions_count": questions_count,
        "questions": normalized_questions,
    }

    serializer = ExamScheduleSerializer(data=payload)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    data = serializer.validated_data
    students = StudentProfile.objects.filter(branch=branch, is_approved=True)

    with transaction.atomic():
        exam = Exam.objects.create(
            branch=branch,
            exam_name=data["exam_name"],
            date=data["date"],
            start_time=data["start_time"],
            duration_minutes=data["duration_minutes"],
            total_questions=data["questions_count"],
        )

        for q in data["questions"]:
            Question.objects.create(
                exam=exam,
                question_text=q["question_text"],
                option_a=q["option_a"],
                option_b=q["option_b"],
                option_c=q["option_c"],
                option_d=q["option_d"],
                correct_answer=q["correct_answer"],
                statements="###".join(q["statements"]),
            )


        for student in students:
            StudentExam.objects.create(student=student, exam=exam)

    def send_notifications():
        for student in students:
            if student.email:
                send_exam_email(student, exam)


    transaction.on_commit(send_notifications)

    return Response(
        {
            "exam_id": exam.id,
            "questions_created": len(data["questions"]),
            "student_exams_created": students.count(),
        },
        status=201,
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_exams(request):
    student = request.user.student_profile
    exams = StudentExam.objects.filter(student=student)
    serializer = StudentExamSerializer(exams, many=True)
    return Response(serializer.data)

IST = ZoneInfo("Asia/Kolkata")

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def start_exam(request, exam_id):
    student = request.user.student_profile

    try:
        exam = Exam.objects.prefetch_related("questions").get(id=exam_id)
    except Exam.DoesNotExist:
        return Response({"message": "Exam not found"}, status=404)

    now_utc = timezone.now()
    now_ist = now_utc.astimezone(IST)

    exam_start_naive = datetime.combine(exam.date, exam.start_time)
    exam_start = exam_start_naive.replace(tzinfo=IST)

    exam_end = exam_start + timedelta(minutes=exam.duration_minutes)

    print("NOW UTC:", now_utc)
    print("NOW IST:", now_ist)
    print("EXAM START IST:", exam_start)

    if now_ist < exam_start:
        return Response(
            {"message": "Exam has not started yet", "can_start": False},
            status=400,
        )

    if now_ist >= exam_end:
        return Response(
            {"message": "Exam time is over", "can_start": False},
            status=400,
        )

    student_exam, _ = StudentExam.objects.get_or_create(
        student=student,
        exam=exam,
    )

    if student_exam.is_completed:
        return Response({"message": "Exam already completed"}, status=400)

    if student_exam.started_at is None:
        student_exam.started_at = now_utc
        student_exam.save(update_fields=["started_at"])

    time_left_seconds = int((exam_end - now_ist).total_seconds())

    exam_data = ExamSerializer(exam).data

    return Response(
        {
            "exam": {
                "id": str(exam_data["id"]),
                "title": exam_data["exam_name"],
                "duration_minutes": exam_data["duration_minutes"],
                "questions": exam_data["questions"],
                "start_time": exam_start.isoformat(),
                "end_time": exam_end.isoformat(),
            },
            "time_left_seconds": max(time_left_seconds, 0),
            "can_start": True,
        },
        status=200,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_exam(request, exam_id):
    student = request.user.student_profile
    answers = request.data.get("answers", {})

    if not isinstance(answers, dict):
        return Response({"message": "Invalid answers format"}, status=400)

    NEGATIVE_MARK = 0.33

    with transaction.atomic():
        try:
            student_exam = StudentExam.objects.select_for_update().get(
                student=student, exam_id=exam_id
            )
        except StudentExam.DoesNotExist:
            return Response({"message": "Exam not started"}, status=404)

        if student_exam.is_completed:
            return Response({"message": "Exam already submitted"}, status=400)

        questions = Question.objects.filter(exam_id=exam_id)
        question_map = {str(q.id): q for q in questions}

        correct = 0
        wrong = 0
        score = 0.0
        total_questions = questions.count()

        student_exam.submitted_at = timezone.now()

        for qid, selected_answer in answers.items():
            question = question_map.get(str(qid))
            if not question:
                continue

            StudentAnswer.objects.update_or_create(
                student_exam=student_exam,
                question=question,
                defaults={"selected_answer": selected_answer},
            )

            if selected_answer == question.correct_answer:
                correct += 1
            else:
                wrong += 1

        score = max(correct - (wrong * NEGATIVE_MARK), 0)

        percentage = (correct / total_questions) * 100
        percentage = max(round(percentage, 2), 0)
        student_exam.correct_count = correct
        student_exam.wrong_count = wrong
        student_exam.score = round(score, 2)
        student_exam.percentage = percentage
        student_exam.is_completed = True
        student_exam.save()

    return Response(
        {
            "message": "Exam submitted successfully",
            "correct": correct,
            "wrong": wrong,
            "score": round(score, 2),
            "percentage": percentage,
        },
        status=status.HTTP_200_OK,
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_new_staff(request):
    serializer = AddStaffSerializer(
        data=request.data,
        context={"request": request}
    )

    serializer.is_valid(raise_exception=True)
    result = serializer.save()

    user = result["user"]
    password = result["password"]
    role = result["role"]

    send_mail(
        subject="Welcome to Our Institution",
        message=(
            f"Hello {user.username},\n\n"
            f"You have been registered successfully as {role}.\n\n"
            f"Login Credentials:\n"
            f"Username: {user.username}\n"
            f"Password: {password}\n\n"
            f"Please change your password after login."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return Response(
        {"message": "Staff created successfully"},
        status=status.HTTP_201_CREATED,
    )

@api_view(["GET"])
@permission_classes([AllowAny])
def check_staff_availability(request):
    username = request.query_params.get("username")
    email = request.query_params.get("email")
    phone = request.query_params.get("phone_number")

    data = {}

    if username:
        username = username.strip()
        data["username"] = not User.objects.filter(
            username__iexact=username
        ).exists()

    if email:
        email = email.strip().lower()
        data["email"] = not (
            User.objects.filter(email__iexact=email).exists()
            or PrincipalProfile.objects.filter(email__iexact=email).exists()
            or TeacherProfile.objects.filter(email__iexact=email).exists()
        )

    if phone:
        phone = phone.strip()
        data["phone_number"] = not (
            PrincipalProfile.objects.filter(phone_number=phone).exists()
            or TeacherProfile.objects.filter(phone_number=phone).exists()
        )

    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bulk_add_staffs(request):
    serializer = BulkStaffSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        result = serializer.save()
        created_staff = result.get('created_staff', [])
        failed_list = result.get('failed_list', [])

        for staff in created_staff:
            try:
                send_mail(
                    subject="Welcome to the System",
                    message=(
                        f"Hello {staff['full_name']},\n\n"
                        f"Your account has been created.\n"
                        f"Username: {staff['user'].username}\n"
                        f"Password: {staff['password']}\n\n"
                        "Please login and change your password immediately."
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[staff['email']],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Failed to send email to {staff['email']}: {e}")

        return Response({
            "created_count": len(created_staff),
            "failed_count": len(failed_list),
            "errors": failed_list
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_staffs(request):
    teachers = TeacherProfile.objects.select_related("user", "branch").all()
    principals = PrincipalProfile.objects.select_related("user", "branch").all()

    staff_list = []

    for t in teachers:
        staff_list.append({
            "id": t.id,
            "full_name": t.full_name,
            "address": t.address,
            "email": t.email,
            "phone_number": t.phone_number,
            "branch_name": t.branch.branch_name,
            "branch_id": t.branch.id,
            "role": t.user.role,
            "is_active": t.user.is_active,
        })

    for p in principals:
        staff_list.append({
            "id": p.id,
            "full_name": p.full_name,
            "address": p.address,
            "email": p.email,
            "phone_number": p.phone_number,
            "branch_name": p.branch.branch_name,
            "branch_id": p.branch.id,
            "role": p.user.role,
            "is_active": p.user.is_active,
        })

    staff_list.sort(key=lambda x: x["id"], reverse=True)

    serializer = StaffListSerializer(staff_list, many=True)
    return Response(serializer.data)

@api_view(["PUT"])
@permission_classes([IsAdminUser])
def update_staff(request, staff_id):

    staff = (
        TeacherProfile.objects.filter(id=staff_id).first()
        or PrincipalProfile.objects.filter(id=staff_id).first()
    )

    if not staff:
        return Response(
            {"detail": "Staff not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = StaffUpdateSerializer(
        instance=staff,
        data=request.data,
        partial=True
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(
        {"message": "Staff updated successfully"},
        status=status.HTTP_200_OK
    )

@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def delete_staff(request, staff_id):
    staff = (
        TeacherProfile.objects.filter(id=staff_id).first()
        or PrincipalProfile.objects.filter(id=staff_id).first()
    )

    if not staff:
        return Response({"detail": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)

    if hasattr(staff, "user") and staff.user:
        staff.user.delete()

    staff.delete()

    return Response({"detail": "Staff and all related data deleted"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def block_staff(request, staff_id):
    staff = (
        TeacherProfile.objects.filter(id=staff_id).first()
        or PrincipalProfile.objects.filter(id=staff_id).first()
    )

    if not staff:
        return Response(
            {"detail": "Staff not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    user = staff.user

    user.is_active = not user.is_active
    user.save()

    return Response(
        {
            "message": f"Staff {'unblocked' if user.is_active else 'blocked'} successfully",
            "is_active": user.is_active
        },
        status=status.HTTP_200_OK
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedules_meet(request):
    user = request.user
    teacher_profile = getattr(user, "teacher_profile", None)
    if not teacher_profile:
        return Response({"detail": "Logged in user is not a teacher"}, status=status.HTTP_403_FORBIDDEN)

    meet_url = request.data.get("meet_url")
    topic = request.data.get("topic")
    description = request.data.get("description", "")
    date_str = request.data.get("date")
    time_str = request.data.get("time")

    errors = {}
    if not meet_url:
        errors["meet_url"] = "Meet URL is required"
    if not topic:
        errors["topic"] = "Topic is required"
    if not date_str:
        errors["date"] = "Date is required"
    if not time_str:
        errors["time"] = "Time is required"

    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    import re
    meet_regex = r'^https:\/\/meet\.google\.com\/[a-z\-]+$'
    if not re.match(meet_regex, meet_url):
        return Response({"meet_url": "Invalid Google Meet URL"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        date_obj = parse_date(date_str)
        time_obj = parse_time(time_str)
    except ValueError:
        return Response({"detail": "Invalid date or time format"}, status=status.HTTP_400_BAD_REQUEST)

    schedule = ScheduleMeet.objects.create(
        branch=teacher_profile.branch,
        created_by=teacher_profile,
        meet_url=meet_url,
        topic=topic,
        description=description,
        date=date_obj,
        time=time_obj
    )

    students = StudentProfile.objects.filter(branch=teacher_profile.branch)
    emails = [s.user.email for s in students if s.user.email]

    if emails:
        send_mail(
            subject=f"New Meeting Scheduled: {topic}",
            message=(
                f"Dear Student,\n\n"
                f"A new meeting has been scheduled.\n\n"
                f"Topic: {topic}\n"
                f"Date: {date_str}\n"
                f"Time: {time_str}\n"
                f"Google Meet Link: {meet_url}\n\n"
                f"Description: {description}\n\n"
                f"Please join on time."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=emails,
            fail_silently=False
        )

    return Response({
        "id": str(schedule.id),
        "meet_url": schedule.meet_url,
        "topic": schedule.topic,
        "description": schedule.description,
        "date": str(schedule.date),
        "time": str(schedule.time),
        "branch": schedule.branch.branch_name,
        "created_by": schedule.created_by.user.username,
        "created_at": schedule.created_at.isoformat()
    }, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_upcoming_meetings(request):
    today = date.today()
    user = request.user

    qs = ScheduleMeet.objects.select_related("branch", "created_by", "created_by__user").filter(date__gte=today)

    if not user.is_staff:
        user_branch = getattr(user, "branch", None)
        if user_branch:
            qs = qs.filter(branch=user_branch)
        else:
            qs = qs.none() 

    qs = qs.order_by("date", "time")
    serializer = ScheduleMeetListSerializer(qs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_all_teachers(request):
    branch_id = request.query_params.get("branch_id")

    queryset = TeacherProfile.objects.select_related("branch")

    if branch_id:
        queryset = queryset.filter(branch_id=branch_id)

    teachers = queryset.values(
        "id",
        "full_name",
        "branch_id",
        "branch__branch_name",
    )

    return Response(teachers, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_timetable(request):
    try:
        principal = PrincipalProfile.objects.get(user=request.user)
    except PrincipalProfile.DoesNotExist:
        return Response({"message": "Principal profile not found."}, status=status.HTTP_403_FORBIDDEN)

    serializer = TimetableSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    teacher_id = serializer.validated_data['teacher'].id
    try:
        teacher = TeacherProfile.objects.get(id=teacher_id)
    except TeacherProfile.DoesNotExist:
        return Response({"message": "Teacher not found."}, status=status.HTTP_400_BAD_REQUEST)

    if teacher.branch != principal.branch:
        return Response({"message": "Teacher must belong to the same branch as principal."}, status=status.HTTP_400_BAD_REQUEST)

    timetable = Timetable.objects.create(
        branch=principal.branch,
        created_by=principal,
        teacher=teacher,
        topic=serializer.validated_data['topic'],
        from_date=serializer.validated_data['from_date'],
        to_date=serializer.validated_data['to_date'],
        start_time=serializer.validated_data['start_time'],
        end_time=serializer.validated_data['end_time'],
        description=serializer.validated_data.get('description', '')
    )

    return Response({"message": "Timetable added successfully"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_principal_timetables(request):
    try:
        principal = PrincipalProfile.objects.get(user=request.user)
    except PrincipalProfile.DoesNotExist:
        return Response({"message": "Principal profile not found."}, status=403)

    timetables = (
        Timetable.objects
        .filter(created_by=principal)
        .select_related('teacher')
        .prefetch_related('change_requests')
        .order_by('-created_at')
    )

    serializer = TimetableListSerializer(timetables, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_teacher_timetables(request):
    try:
        teacher = TeacherProfile.objects.get(user=request.user)
    except TeacherProfile.DoesNotExist:
        return Response(
            {"message": "Teacher profile not found."},
            status=403
        )

    timetables = (
        Timetable.objects
        .filter(teacher=teacher)
        .select_related('teacher', 'created_by')
        .prefetch_related('change_requests')
        .order_by('-from_date', '-start_time')
    )

    serializer = TimetableListSerializer(timetables, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_timetable_change_request(request):
    try:
        teacher = TeacherProfile.objects.get(user=request.user)
    except TeacherProfile.DoesNotExist:
        return Response(
            {"message": "Teacher profile not found."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = TimetableChangeRequestCreateSerializer(
        data=request.data,
        context={"teacher": teacher}
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer.save()

    return Response(
        {"message": "Timetable change request submitted successfully."},
        status=status.HTTP_201_CREATED
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_request(request, request_id):
    change_request = get_object_or_404(TimetableChangeRequest, id=request_id)

    if change_request.status != 'PENDING':
        return Response({"message": "Request is already processed."}, status=status.HTTP_400_BAD_REQUEST)

    timetable = change_request.timetable
    timetable.from_date = change_request.from_date
    timetable.to_date = change_request.to_date
    timetable.start_time = change_request.start_time
    timetable.end_time = change_request.end_time
    timetable.save()

    change_request.status = 'APPROVED'
    change_request.save()

    return Response({"message": "Request approved and timetable updated."}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def reject_request(request, request_id):
    change_request = get_object_or_404(TimetableChangeRequest, id=request_id)

    if change_request.status != 'PENDING':
        return Response({"message": "Request is already processed."}, status=status.HTTP_400_BAD_REQUEST)

    change_request.status = 'REJECTED'
    change_request.save()

    return Response({"message": "Request rejected."}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_timetable(request, timetable_id):
    timetable = get_object_or_404(Timetable, id=timetable_id)

    timetable.delete()
    return Response({"message": "Timetable deleted successfully"}, status=200)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_learning_materials(request):
    user = request.user

    if user.role not in ["TEACHER", "PRINCIPAL"]:
        return Response(
            {"message": "You are not allowed to upload materials"},
            status=status.HTTP_403_FORBIDDEN,
        )

    choice = request.data.get("choice")
    topic = request.data.get("topic")
    description = request.data.get("description", "")
    file = request.FILES.get("file")

    if not choice or not topic or not file:
        return Response(
            {"message": "choice, topic and file are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    choice = choice.upper()

    MODEL_MAP = {
        "NOTES": Notes,
        "SYLLABUS": Syllabus,
        "RECORDING": Recordings,
    }

    ModelClass = MODEL_MAP.get(choice)
    if not ModelClass:
        return Response(
            {"message": "Invalid material type"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        if user.role == "TEACHER":
            profile = TeacherProfile.objects.select_related("branch").get(user=user)
        else:
            profile = PrincipalProfile.objects.select_related("branch").get(user=user)
    except (TeacherProfile.DoesNotExist, PrincipalProfile.DoesNotExist):
        return Response(
            {"message": "User profile not found"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    material = ModelClass(
        branch=profile.branch,
        uploaded_by=user,
        topic=topic,
        description=description,
        file=file,
    )

    material.full_clean()
    material.save()

    return Response(
        {"message": f"{choice.capitalize()} uploaded successfully"},
        status=status.HTTP_201_CREATED,
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_all_materials(request):
    user = request.user
    branch_id = request.query_params.get("branch_id")

    if not branch_id:
        return Response(
            {"message": "branch_id is required"},
            status=400
        )

    if hasattr(user, "branch_id") and str(user.branch_id) != str(branch_id):
        return Response(
            {"message": "Unauthorized branch access"},
            status=403
        )

    notes = Notes.objects.filter(branch_id=branch_id).select_related("uploaded_by")
    syllabus = Syllabus.objects.filter(branch_id=branch_id).select_related("uploaded_by")
    recordings = Recordings.objects.filter(branch_id=branch_id).select_related("uploaded_by")

    data = (
        NotesSerializer(notes, many=True).data
        + SyllabusSerializer(syllabus, many=True).data
        + RecordingsSerializer(recordings, many=True).data
    )

    data.sort(key=lambda x: x["created_at"], reverse=True)

    return Response(data, status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_all_students(request):
    branch_id = request.query_params.get("branch_id")

    queryset = StudentProfile.objects.select_related("branch").filter(
        is_approved=True
    )

    if branch_id:
        queryset = queryset.filter(branch_id=branch_id)

    students = (
        queryset
        .values(
            "id",
            "full_name",
            "branch_id",
            "branch__branch_name",
        )
        .distinct()
    )

    return Response(students, status=200)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_attendance(request):
    user = request.user

    if user.role not in ["TEACHER", "PRINCIPAL"]:
        return Response(
            {"message": "You are not allowed to mark attendance"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        profile = (
            TeacherProfile.objects.select_related("branch").get(user=user)
            if user.role == "TEACHER"
            else PrincipalProfile.objects.select_related("branch").get(user=user)
        )
    except (TeacherProfile.DoesNotExist, PrincipalProfile.DoesNotExist):
        return Response(
            {"message": "User profile not found"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    branch = profile.branch

    student_id = request.data.get("student")
    attendance_status = request.data.get("attendance_status")

    if not student_id or attendance_status not in ["PRESENT", "ABSENT"]:
        return Response(
            {"message": "Invalid attendance data"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        student = StudentProfile.objects.get(id=student_id, branch=branch)
    except StudentProfile.DoesNotExist:
        return Response(
            {"message": "Student not found in your branch"},
            status=status.HTTP_404_NOT_FOUND,
        )

    status_value = attendance_status == "PRESENT"

    try:
        Attendance.objects.create(
            student=student,
            branch=branch,
            status=status_value,
            marked_by=user,
        )
    except IntegrityError:
        return Response(
            {"message": "Attendance already marked for this student today"},
            status=status.HTTP_409_CONFLICT,
        )

    return Response(
        {"message": "Student attendance marked successfully"},
        status=status.HTTP_201_CREATED,
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_attendance(request):
    user = request.user

    if user.role == "STUDENT":
        student = getattr(user, "student_profile", None)
        if not student:
            return Response({"error": "Student profile not found"}, status=400)
        attendance_qs = Attendance.objects.filter(student=student)

    elif user.role == "PARENT":
        parent = getattr(user, "parent_profile", None)
        if not parent:
            return Response({"error": "Parent profile not found"}, status=400)
        attendance_qs = Attendance.objects.filter(student__parent=parent)

    elif user.role == "TEACHER":
        teacher = getattr(user, "teacher_profile", None)
        if not teacher:
            return Response({"error": "Teacher profile not found"}, status=400)
        attendance_qs = Attendance.objects.filter(branch=teacher.branch)

    elif user.role == "PRINCIPAL":
        principal = getattr(user, "principal_profile", None)
        if not principal:
            return Response({"error": "Principal profile not found"}, status=400)
        attendance_qs = Attendance.objects.filter(branch=principal.branch)

    else:
        return Response({"error": "Not allowed"}, status=403)

    attendance_qs = attendance_qs.select_related("student", "branch", "marked_by").order_by("-date")

    data = []
    for att in attendance_qs:
        marked_by_name = None
        if att.marked_by:
            profile = getattr(att.marked_by, "teacherprofile", None) or getattr(att.marked_by, "principalprofile", None)
            marked_by_name = profile.full_name if profile else None

        data.append({
            "attendance_id": att.id,
            "student_id": att.student.id,
            "student_name": att.student.full_name,
            "branch_id": att.branch.id,
            "branch_name": att.branch.branch_name,
            "date": att.date,
            "status": "PRESENT" if att.status else "ABSENT",
            "marked_by": marked_by_name,
        })

    return Response(data, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_all_attendance(request):
    attendance_qs = Attendance.objects.select_related(
        "student",
        "branch",
        "marked_by"
    ).order_by("-date")

    data = []
    for att in attendance_qs:
        marked_by_name = None
        
        if att.marked_by:
            teacher_profile = TeacherProfile.objects.filter(user=att.marked_by).first()
            if teacher_profile:
                marked_by_name = teacher_profile.full_name
            else:
                principal_profile = PrincipalProfile.objects.filter(user=att.marked_by).first()
                if principal_profile:
                    marked_by_name = principal_profile.full_name

        data.append({
            "attendance_id": att.id,
            "student_id": att.student.id,
            "student_name": att.student.full_name,
            "branch_id": att.branch.id,
            "branch_name": att.branch.branch_name,
            "date": att.date,
            "status": "PRESENT" if att.status else "ABSENT",
            "marked_by": marked_by_name,
        })

    return Response(data, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_monthly_payment(request, student_id):
    student = get_object_or_404(
        StudentProfile,
        id=student_id,
        is_approved=True
    )

    if not student.date_of_joining:
        return Response(
            {"message": "Student has no date of joining"},
            status=400
        )

    join_month = student.date_of_joining.month
    remaining_months = 12 - join_month + 1

    if remaining_months <= 0:
        return Response(
            {"message": "Invalid date of joining"},
            status=400
        )

    raw_monthly_fee = float(student.fees or 0) / remaining_months
    monthly_fee = round(max(raw_monthly_fee, 0), 2)

    last_payment = MonthlyPayment.objects.filter(
        student=student
    ).order_by('-year', '-month').first()

    if last_payment:
        next_month = last_payment.month + 1
        year = last_payment.year
        if next_month > 12:
            next_month = 1
            year += 1
    else:
        next_month = join_month
        year = student.date_of_joining.year

    unpaid_records = MonthlyPayment.objects.filter(
        student=student,
        status='UNPAID'
    ).order_by('year', 'month')

    unpaid_months = [
        {
            "month": r.month,
            "year": r.year,
            "amount": monthly_fee
        }
        for r in unpaid_records
    ]

    return Response({
        "student_id": str(student.id),
        "full_name": student.full_name,
        "next_month": next_month,
        "year": year,
        "monthly_amount": monthly_fee,
        "unpaid_months": unpaid_months
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def add_payment(request):
    serializer = MonthlyPaymentCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    student = serializer.validated_data['student']

    if not student.date_of_joining:
        return Response({"message": "Student has no date of joining"}, status=400)

    if student.balance_amount <= 0:
        return Response({"message": "No balance amount remaining"}, status=400)

    today = date.today()
    current_year = today.year
    current_month = today.month
    join_month = student.date_of_joining.month
    join_year = student.date_of_joining.year

    if (current_year, current_month) < (join_year, join_month):
        return Response(
            {"message": "Payment cannot be added before joining month"},
            status=400
        )

    remaining_months = 12 - join_month + 1
    monthly_fee = (Decimal(student.fees) / Decimal(remaining_months)).quantize(
        Decimal("0.00"), rounding=ROUND_HALF_UP
    )

    existing_payments = MonthlyPayment.objects.filter(
        student=student,
        is_deleted=False
    ).values_list('year', 'month')

    existing_months = {(y, m) for y, m in existing_payments}

    if not existing_months:
        for month in range(join_month, 13):
            status = 'PAID' if month == current_month and join_year == current_year else 'UNPAID'
            paid_date = today if status == 'PAID' else None
            MonthlyPayment.objects.create(
                student=student,
                year=join_year,
                month=month,
                monthly_amount=monthly_fee,
                status=status,
                paid_date=paid_date
            )
        student.balance_amount -= monthly_fee
        if student.balance_amount < 0:
            student.balance_amount = Decimal("0.00")
        student.balance_amount = student.balance_amount.quantize(
            Decimal("0.00"), rounding=ROUND_HALF_UP
        )
        student.save(update_fields=['balance_amount'])
        return Response(
            {
                "message": "Payment recorded successfully",
                "year": current_year,
                "month": current_month,
                "amount_paid": float(monthly_fee),
                "remaining_balance": float(student.balance_amount)
            },
            status=201
        )

    if (current_year, current_month) not in existing_months:
        MonthlyPayment.objects.create(
            student=student,
            year=current_year,
            month=current_month,
            monthly_amount=monthly_fee,
            status='PAID',
            paid_date=today
        )
        student.balance_amount -= monthly_fee
        if student.balance_amount < 0:
            student.balance_amount = Decimal("0.00")
        student.balance_amount = student.balance_amount.quantize(
            Decimal("0.00"), rounding=ROUND_HALF_UP
        )
        student.save(update_fields=['balance_amount'])
        return Response(
            {
                "message": "Payment recorded successfully",
                "year": current_year,
                "month": current_month,
                "amount_paid": float(monthly_fee),
                "remaining_balance": float(student.balance_amount)
            },
            status=201
        )

    payment_record = MonthlyPayment.objects.get(
        student=student,
        year=current_year,
        month=current_month,
        is_deleted=False
    )
    if payment_record.status == 'PAID':
        return Response(
            {"message": "Payment already recorded for this month"},
            status=400
        )

    payment_record.status = 'PAID'
    payment_record.paid_date = today
    payment_record.save(update_fields=['status', 'paid_date'])

    student.balance_amount -= monthly_fee
    if student.balance_amount < 0:
        student.balance_amount = Decimal("0.00")
    student.balance_amount = student.balance_amount.quantize(
        Decimal("0.00"), rounding=ROUND_HALF_UP
    )
    student.save(update_fields=['balance_amount'])

    return Response(
        {
            "message": "Payment recorded successfully",
            "year": current_year,
            "month": current_month,
            "amount_paid": float(monthly_fee),
            "remaining_balance": float(student.balance_amount)
        },
        status=201
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_student_fees(request, student_id):
    student = get_object_or_404(StudentProfile, id=student_id)

    payments = MonthlyPayment.objects.filter(
        student=student,
        is_deleted=False
    ).order_by('year', 'month')

    serializer = StudentMonthlyPaymentListSerializer(payments, many=True)

    return Response(serializer.data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def delete_student_fees(request):
    ids = request.data.get("ids", [])

    if not ids or not isinstance(ids, list):
        return Response(
            {"message": "ids must be a non-empty list"},
            status=status.HTTP_400_BAD_REQUEST
        )

    payments = MonthlyPayment.objects.select_for_update().filter(
        id__in=ids,
        is_deleted=False
    )

    if not payments.exists():
        return Response(
            {"message": "No valid payments found to delete"},
            status=status.HTTP_400_BAD_REQUEST
        )

    deleted_count = 0

    for payment in payments:
        if hasattr(payment, "deleted_record"):
            continue

        DeletedMonthlyPayment.objects.create(
            monthly_payment=payment,
            deleted_amount=payment.monthly_amount,
            deleted_by=request.user,
        )

        payment.is_deleted = True
        payment.save(update_fields=["is_deleted"])

        deleted_count += 1

    return Response(
        {
            "message": "Monthly payments deleted successfully",
            "deleted_count": deleted_count
        },
        status=status.HTTP_200_OK
    )

from django.db.models import Q, Count, Sum

def month_diff(start, end):
    return (end.year - start.year) * 12 + (end.month - start.month) + 1


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def payment_summary_report(request):
    branch_id = request.query_params.get("branch_id")
    from_date = request.query_params.get("from_date")
    to_date = request.query_params.get("to_date")

    if not branch_id or not from_date or not to_date:
        return Response(
            {"error": "branch_id, from_date and to_date are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        branch = BranchProfile.objects.get(id=branch_id)
        from_date = datetime.strptime(from_date, "%Y-%m-%d").date()
        to_date = datetime.strptime(to_date, "%Y-%m-%d").date()
    except Exception:
        return Response(
            {"error": "Invalid branch or date format"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if from_date > to_date:
        return Response(
            {"error": "from_date cannot be after to_date"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    from_year, from_month = from_date.year, from_date.month
    to_year, to_month = to_date.year, to_date.month

    paid_qs = MonthlyPayment.objects.filter(
        student__branch=branch,
        status="PAID",
        is_deleted=False,
        paid_date__range=(from_date, to_date),
    )

    paid = paid_qs.aggregate(
        paid_students=Count("student", distinct=True),
        total_paid_amount=Sum("monthly_amount"),
    )

    unpaid_payment_qs = MonthlyPayment.objects.filter(
        student__branch=branch,
        status="UNPAID",
        is_deleted=False,
    ).filter(
        Q(year__gt=from_year) |
        Q(year=from_year, month__gte=from_month)
    ).filter(
        Q(year__lt=to_year) |
        Q(year=to_year, month__lte=to_month)
    )

    unpaid_payment_data = unpaid_payment_qs.aggregate(
        unpaid_students=Count("student", distinct=True),
        total_pending_amount=Sum("monthly_amount"),
    )

    unpaid_payment_student_ids = unpaid_payment_qs.values_list(
        "student_id", flat=True
    ).distinct()

    students = StudentProfile.objects.filter(
        branch=branch,
        is_approved=True,
        date_of_joining__lte=to_date,
    ).exclude(
        id__in=MonthlyPayment.objects.values_list("student_id", flat=True)
    )

    unpaid_students_count = 0
    unpaid_amount_no_payment = 0

    for student in students:
        if not student.date_of_joining or not student.fees:
            continue

        join_year = student.date_of_joining.year

        charge_start = date(join_year, student.date_of_joining.month, 1)
        charge_end = date(join_year, 12, 31)

        if charge_end < from_date or charge_start > to_date:
            continue

        effective_start = max(charge_start, from_date)
        effective_end = min(charge_end, to_date)

        months = month_diff(effective_start, effective_end)

        active_months_in_year = 12 - student.date_of_joining.month + 1
        monthly_fee = student.fees / active_months_in_year

        unpaid_students_count += 1
        unpaid_amount_no_payment += monthly_fee * months

    return Response(
        {
            "paid_students": paid["paid_students"] or 0,
            "total_paid_amount": paid["total_paid_amount"] or 0,
            "unpaid_students": unpaid_students_count + (unpaid_payment_data["unpaid_students"] or 0),
            "total_pending_amount": unpaid_amount_no_payment + (unpaid_payment_data["total_pending_amount"] or 0),
        },
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_month_payments(request, student_id):
    student = get_object_or_404(StudentProfile, id=student_id)

    now = datetime.now()
    current_year = now.year
    current_month = now.month

    payments = MonthlyPayment.objects.filter(
        student=student,
        year=current_year,
        month=current_month,
        is_deleted=False
    )

    serializer = MonthlyPaymentSerializer(payments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_student_exams(request, student_id):

    exams = StudentExam.objects.filter(student_id=student_id).select_related('exam')
    
    result = [
        {
            "id": exam.id,
            "exam_name": exam.exam.exam_name,
            "exam_date": exam.exam.date,
            "percentage": exam.percentage
        }
        for exam in exams
    ]
    
    return Response(result)
