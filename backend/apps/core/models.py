from django.db import models

import uuid
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('BRANCH', 'Branch'),
        ('PRINCIPAL', 'Principal'),
        ('TEACHER', 'Teacher'),
        ('STUDENT', 'Student'),
        ('PARENT', 'Parent'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20,choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
    

class BranchProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='branch_profile')
    branch_name = models.CharField(max_length=255)
    address = models.TextField()
    email = models.EmailField(unique=True)
    contact_number = models.CharField(max_length=20)
    encrypted_password = models.TextField(help_text="Encrypted branch password. Admin only.")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.branch_name
    
class ParentProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='parent_profile')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name
    
class StudentProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    address = models.TextField(null=True)
    phone_number = models.CharField(max_length=20)
    branch = models.ForeignKey('BranchProfile', on_delete=models.CASCADE, related_name='students')
    parent = models.ForeignKey(ParentProfile,on_delete=models.SET_NULL,null=True,blank=True,related_name='students')
    date_of_joining = models.DateField(null=True, blank=True,)
    fees = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,)
    balance_amount = models.DecimalField(max_digits=10,decimal_places=2,default=0)
    is_approved = models.BooleanField(default=False)
    encrypted_password = models.TextField(null=True, blank=True,help_text="Encrypted password.")
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_students')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name
    
    
class PrincipalProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name='principal_profile')
    branch = models.OneToOneField(BranchProfile,on_delete=models.CASCADE,related_name='principal')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True,blank=True)
    address = models.TextField()
    phone_number = models.CharField(max_length=20)
    created_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True,related_name='created_principals')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} (Principal - {self.branch.branch_name})"


class TeacherProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name='teacher_profile')
    branch = models.ForeignKey(BranchProfile,on_delete=models.CASCADE,related_name='teachers')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True,blank=True)
    address = models.TextField()
    phone_number = models.CharField(max_length=20)
    created_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True,related_name='created_teachers')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.branch.branch_name}"


class Exam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(BranchProfile, on_delete=models.CASCADE)
    exam_name = models.CharField(max_length=255)
    date = models.DateField()
    start_time = models.TimeField()
    duration_minutes = models.IntegerField()
    total_questions = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    option_a = models.TextField()
    option_b = models.TextField()
    option_c = models.TextField()
    option_d = models.TextField()
    correct_answer = models.CharField(max_length=10)
    statements = models.TextField(null=True, blank=True)

class StudentExam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="exams")
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="student_exams")
    started_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    correct_count = models.IntegerField(default=0)
    wrong_count = models.IntegerField(default=0)
    percentage = models.FloatField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student', 'exam')

class StudentAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_exam = models.ForeignKey(StudentExam, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.CharField(max_length=10)

    class Meta:
        unique_together = ('student_exam', 'question')


class ScheduleMeet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(BranchProfile,on_delete=models.CASCADE,related_name='teacher_schedules')
    meet_url = models.URLField()
    topic = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    created_by = models.ForeignKey( TeacherProfile, on_delete=models.CASCADE,related_name='schedules')
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.created_by.branch != self.branch:
            raise ValidationError(
                "Teacher must belong to the same branch"
            )


class Timetable(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(BranchProfile,on_delete=models.CASCADE,related_name='timetables')
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, related_name='timetables')
    topic = models.CharField(max_length=255)
    from_date = models.DateField()
    to_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(PrincipalProfile, on_delete=models.CASCADE,related_name='created_timetables')
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.teacher.branch != self.branch:
            raise ValidationError("Teacher must belong to the same branch")

        if self.created_by.branch != self.branch:
            raise ValidationError("Principal must belong to the same branch")


class TimetableChangeRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timetable = models.ForeignKey(Timetable,on_delete=models.CASCADE,related_name='change_requests')
    requested_by = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, related_name='timetable_change_requests')
    from_date = models.DateField(null=True, blank=True)
    to_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    reason = models.TextField()
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)


class Attendance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(StudentProfile,on_delete=models.CASCADE,related_name='attendance_records')
    branch = models.ForeignKey(BranchProfile,on_delete=models.CASCADE,related_name='attendance_records')
    date = models.DateField(auto_now_add=True)
    status = models.BooleanField()
    marked_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='marked_attendance')

    class Meta:
        unique_together = ('student', 'date')

class Notes(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(BranchProfile,on_delete=models.CASCADE,related_name='notes')
    uploaded_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='uploaded_notes')
    topic = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='notes/')
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.uploaded_by and self.uploaded_by.role not in ['TEACHER', 'PRINCIPAL']:
            raise ValidationError(
                "Only teachers or principals can upload notes"
            )


class Syllabus(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(BranchProfile,on_delete=models.CASCADE,related_name='syllabus_items')
    uploaded_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='uploaded_syllabus')
    topic = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='syllabus/')
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.uploaded_by and self.uploaded_by.role not in ['TEACHER', 'PRINCIPAL']:
            raise ValidationError(
                "Only teachers or principals can upload Syllabus"
            )


class Recordings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(BranchProfile,on_delete=models.CASCADE,related_name='recordings')
    uploaded_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='uploaded_recordings')
    topic = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='recordings/')
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.uploaded_by and self.uploaded_by.role not in ['TEACHER', 'PRINCIPAL']:
            raise ValidationError(
                "Only teachers or principals can upload Recordings"
            )


class MonthlyPayment(models.Model):
    STATUS_CHOICES = (
        ('PAID', 'Paid'),
        ('UNPAID', 'Unpaid'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(StudentProfile,on_delete=models.CASCADE,related_name='monthly_payments')
    year = models.PositiveIntegerField()
    month = models.PositiveSmallIntegerField()
    monthly_amount = models.DecimalField(max_digits=10,decimal_places=2)
    status = models.CharField(max_length=10,choices=STATUS_CHOICES,default='UNPAID')
    paid_date = models.DateField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'year', 'month')
        ordering = ['year', 'month']

    def __str__(self):
        return f"{self.student.full_name} - {self.month}/{self.year}"

class DeletedMonthlyPayment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    monthly_payment = models.OneToOneField(MonthlyPayment,on_delete=models.CASCADE,related_name='deleted_record')
    deleted_amount = models.DecimalField(max_digits=10,decimal_places=2)
    deleted_by = models.ForeignKey(User,on_delete=models.SET_NULL, null=True,blank=True)
    deleted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Deleted {self.deleted_amount} - {self.monthly_payment}"
