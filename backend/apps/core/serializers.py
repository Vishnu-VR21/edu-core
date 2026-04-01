from rest_framework import serializers
from apps.core.models import User,ParentProfile, BranchProfile, StudentProfile, Exam, Question, StudentExam, Attendance, PrincipalProfile, TeacherProfile, ScheduleMeet, Timetable, TimetableChangeRequest, Notes, Syllabus, Recordings, MonthlyPayment
import random
import string
from django.db import transaction
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError
from django.conf import settings


class BranchSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)

    class Meta:
        model = BranchProfile
        fields = ['branch_name', 'address', 'contact_number', 'username', 'email']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already used")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        username = validated_data.pop('username')

        password = ''.join(
            random.choices(
                string.ascii_letters + string.digits + "!@#$%^&*", k=8
            )
        )

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='BRANCH',
                is_active=True
            )

            branch = BranchProfile.objects.create(
                user=user,
                branch_name=validated_data['branch_name'],
                address=validated_data['address'],
                contact_number=validated_data['contact_number'],
                email=email,
                encrypted_password=password
            )

        branch._generated_password = password
        return branch

    
class BranchDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    password = serializers.CharField(source='encrypted_password', read_only=True)

    class Meta:
        model = BranchProfile
        fields = ['id', 'branch_name', 'address', 'email', 'contact_number', 'username', 'password', 'is_active']

class BranchUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = BranchProfile
        fields = (
            'branch_name',
            'address',
            'email',
            'contact_number',
            'username',
            'password',
        )

    def validate_username(self, value):
        user = self.instance.user
        if User.objects.exclude(id=user.id).filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if BranchProfile.objects.exclude(id=self.instance.id).filter(email=value).exists():
            raise serializers.ValidationError("Branch email already exists")
        return value

    def update(self, instance, validated_data):
        user = instance.user
        password = validated_data.pop('password', None)
        username = validated_data.pop('username', user.username)
        email = validated_data.pop('email', user.email)

        with transaction.atomic():
            user.username = username
            user.email = email

            if password:
                user.set_password(password)
                instance.encrypted_password = password 

            user.save()

            instance.email = email
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

        return instance
    
class StudentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    branch_name = serializers.CharField(write_only=True)
    parent_name = serializers.CharField(write_only=True)
    parent_email = serializers.EmailField(write_only=True)
    parent_phone = serializers.CharField(write_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'full_name',
            'email',
            'phone_number',
            'username',
            'branch_name',
            'address',
            'fees',
            'date_of_joining',
            'parent_name',
            'parent_email',
            'parent_phone'
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered")
        return value

    def validate_branch_name(self, value):
        if not BranchProfile.objects.filter(branch_name__iexact=value).exists():
            raise serializers.ValidationError("Branch does not exist")
        return value

    def validate_parent_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This parent email is already registered")
        return value

    def create(self, validated_data):
        student_username = validated_data.pop('username')
        student_email = validated_data.pop('email')
        branch_name = validated_data.pop('branch_name')

        parent_name = validated_data.pop('parent_name')
        parent_email = validated_data.pop('parent_email')
        parent_phone = validated_data.pop('parent_phone')

        branch = BranchProfile.objects.get(branch_name__iexact=branch_name)

        student_password = ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=8))
        parent_password = ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=8))
        parent_username = f"{parent_name.split()[0].lower()}{random.randint(1000,9999)}"

        with transaction.atomic():
            student_user = User.objects.create_user(
                username=student_username,
                email=student_email,
                password=student_password,
                role='STUDENT',
                is_active=True
            )

            parent_user = User.objects.create_user(
                username=parent_username,
                email=parent_email,
                password=parent_password,
                role='PARENT',
                is_active=True
            )

            parent_profile = ParentProfile.objects.create(
                user=parent_user,
                full_name=parent_name,
                email=parent_email,
                phone_number=parent_phone
            )

            student = StudentProfile.objects.create(
                user=student_user,
                full_name=validated_data['full_name'],
                email=student_email,
                phone_number=validated_data['phone_number'],
                address=validated_data.get('address'),
                branch=branch,
                fees=validated_data.get('fees'),
                balance_amount=validated_data.get('fees'),
                date_of_joining=validated_data.get('date_of_joining'),
                parent=parent_profile,
                encrypted_password=student_password,
                is_approved=True
            )

        student._generated_password = student_password
        parent_user._generated_password = parent_password
        parent_user._generated_username = parent_username

        return student

class BulkStudentSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    address = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField()
    username = serializers.CharField()

    parent_name = serializers.CharField()
    parent_email = serializers.EmailField()
    parent_phone = serializers.CharField()

    fees = serializers.DecimalField(max_digits=10, decimal_places=2)
    date_of_joining = serializers.DateField(input_formats=["%Y-%m-%d", "%d-%m-%Y", "%m-%d-%Y"])

    def validate(self, attrs):
        if attrs["phone_number"] == attrs["parent_phone"]:
            raise serializers.ValidationError("Student and parent phone numbers must be different")

        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "Username already exists"})

        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "Student email already exists"})

        if User.objects.filter(email=attrs["parent_email"]).exists():
            raise serializers.ValidationError({"parent_email": "Parent email already exists"})

        return attrs

    def create(self, validated_data):
        branch = self.context["branch"]

        student_password = ''.join(
            random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=8)
        )

        student_user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=student_password,
            role="STUDENT",
            is_active=True
        )

        parent_password = ''.join(
            random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=8)
        )

        parent_username = f"{validated_data['parent_name'].split()[0].lower()}{random.randint(1000,9999)}"

        parent_user = User.objects.create_user(
            username=parent_username,
            email=validated_data["parent_email"],
            password=parent_password,
            role="PARENT",
            is_active=True
        )

        parent_profile = ParentProfile.objects.create(
            user=parent_user,
            full_name=validated_data["parent_name"],
            email=validated_data["parent_email"],
            phone_number=validated_data["parent_phone"],
        )

        student = StudentProfile.objects.create(
            user=student_user,
            full_name=validated_data["full_name"],
            email=validated_data["email"],
            address=validated_data["address"],
            phone_number=validated_data["phone_number"],
            parent=parent_profile,
            fees=validated_data["fees"],
            balance_amount=validated_data["fees"],
            date_of_joining=validated_data["date_of_joining"],
            branch=branch,
            encrypted_password=student_password,
            is_approved=True,
        )

        student._student_password = student_password
        student._parent_password = parent_password
        student._parent_username = parent_username

        return student

class StudentRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    branch = serializers.PrimaryKeyRelatedField(
        queryset=BranchProfile.objects.all(),
        write_only=True
    )

    parent_name = serializers.CharField(write_only=True)
    parent_email = serializers.EmailField(write_only=True)
    parent_phone = serializers.CharField(write_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'full_name',
            'email',
            'address',
            'branch',
            'phone_number',
            'username',
            'parent_name',
            'parent_email',
            'parent_phone',
        ]


    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Student email already registered")
        return value

    def validate_parent_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Parent email already registered")
        return value

    def validate_parent_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Parent phone must be exactly 10 digits")
        return value

    def validate_phone_number(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Student phone must be exactly 10 digits")
        return value

    def validate(self, attrs):
        if attrs["phone_number"] == attrs["parent_phone"]:
            raise serializers.ValidationError(
                "Student and parent phone numbers must be different"
            )
        return attrs

    def create(self, validated_data):
        branch = validated_data.pop("branch")

        parent_name = validated_data.pop("parent_name")
        parent_email = validated_data.pop("parent_email")
        parent_phone = validated_data.pop("parent_phone")

        username = validated_data.pop("username")
        email = validated_data.pop("email")

        with transaction.atomic():

            student_user = User.objects.create_user(
                username=username,
                email=email,
                role="STUDENT",
                is_active=False
            )

            parent_username = f"{parent_name.split()[0].lower()}{random.randint(1000,9999)}"

            parent_user = User.objects.create_user(
                username=parent_username,
                email=parent_email,
                role="PARENT",
                is_active=False
            )

            parent_profile = ParentProfile.objects.create(
                user=parent_user,
                full_name=parent_name,
                email=parent_email,
                phone_number=parent_phone
            )

            student = StudentProfile.objects.create(
                user=student_user,
                email=email,
                branch=branch,
                parent=parent_profile,
                **validated_data
            )

        return student

class PendingStudentListSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source="branch.branch_name", read_only=True)
    branch_id = serializers.CharField(source="branch.id", read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    parent_name = serializers.CharField(source="parent.full_name", read_only=True)
    parent_email = serializers.CharField(source="parent.email", read_only=True)
    parent_phone = serializers.CharField(source="parent.phone_number", read_only=True)

    exams = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "full_name",
            "address",
            "email",
            "phone_number",
            "parent_name",
            "parent_email",
            "parent_phone",
            "branch_name",
            "branch_id",
            "is_active",
            "exams"
        ]

    def get_exams(self, student):
        student_exams = student.exams.select_related("exam").all()
        return [
            {
                "exam_name": se.exam.exam_name,
                "percentage": se.percentage
            }
            for se in student_exams
        ]

class ApproveStudentSerializer(serializers.Serializer):
    date_of_joining = serializers.DateField()
    fees = serializers.DecimalField(max_digits=10, decimal_places=2)

    def approve(self, student: StudentProfile, approved_by):
        student_password = "".join(
            random.choices(
                string.ascii_letters + string.digits + "!@#$%^&*", k=8
            )
        )

        parent_password = "".join(
            random.choices(
                string.ascii_letters + string.digits + "!@#$%^&*", k=8
            )
        )

        with transaction.atomic():
            student_user = student.user
            student_user.set_password(student_password)
            student_user.is_active = True
            student_user.save(update_fields=["password", "is_active"])

            parent_user = student.parent.user
            parent_user.set_password(parent_password)
            parent_user.is_active = True
            parent_user.save(update_fields=["password", "is_active"])

            student.date_of_joining = self.validated_data["date_of_joining"]
            student.fees = self.validated_data["fees"]
            student.balance_amount = self.validated_data["fees"]
            student.is_approved = True
            student.approved_by = approved_by
            student.encrypted_password = student_password
            student.save()

        student._student_password = student_password
        student._parent_password = parent_password

        return student


class StudentUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    address = serializers.CharField(required=False)
    phone_number = serializers.CharField(required=False)
    branch = serializers.UUIDField(required=False)

    parent_name = serializers.CharField(required=False)
    parent_email = serializers.EmailField(required=False)
    parent_phone = serializers.CharField(required=False)

    def validate_email(self, value):
        student = self.instance

        if User.objects.exclude(id=student.user.id).filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already used by another user")

        if StudentProfile.objects.exclude(id=student.id).filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already used by another student")

        return value

    def validate_phone_number(self, value):
        if StudentProfile.objects.exclude(id=self.instance.id).filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already exists")
        return value

    def validate_parent_email(self, value):
        parent = self.instance.parent

        if not parent:
            return value

        if User.objects.exclude(id=parent.user.id).filter(email__iexact=value).exists():
            raise serializers.ValidationError("Parent email already used")

        if ParentProfile.objects.exclude(id=parent.id).filter(email__iexact=value).exists():
            raise serializers.ValidationError("Parent email already exists")

        return value

    def validate_parent_phone(self, value):
        parent = self.instance.parent

        if not parent:
            return value

        if ParentProfile.objects.exclude(id=parent.id).filter(phone_number=value).exists():
            raise serializers.ValidationError("Parent phone already exists")

        return value

    def validate_branch(self, value):
        if not BranchProfile.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid branch ID")
        return value

    def update(self, instance, validated_data):
        parent = instance.parent
        branch_changed = False
        new_branch = None

        if "branch" in validated_data:
            new_branch = BranchProfile.objects.get(id=validated_data["branch"])
            branch_changed = (instance.branch_id != new_branch.id)

        with transaction.atomic():

            if branch_changed:
                instance.branch = new_branch

                Attendance.objects.filter(
                    student=instance
                ).update(branch=new_branch)

            if "email" in validated_data:
                instance.email = validated_data["email"]
                instance.user.email = validated_data["email"]
                instance.user.save(update_fields=["email"])

            for field in ["full_name", "address", "phone_number"]:
                if field in validated_data:
                    setattr(instance, field, validated_data[field])

            instance.save()

            if parent:
                if "parent_name" in validated_data:
                    parent.full_name = validated_data["parent_name"]

                if "parent_email" in validated_data:
                    parent.email = validated_data["parent_email"]
                    parent.user.email = validated_data["parent_email"]
                    parent.user.save(update_fields=["email"])

                if "parent_phone" in validated_data:
                    parent.phone_number = validated_data["parent_phone"]

                parent.save()

        return instance
    
class QuestionSerializer(serializers.Serializer):
    question_text = serializers.CharField()
    option_a = serializers.CharField()
    option_b = serializers.CharField()
    option_c = serializers.CharField()
    option_d = serializers.CharField()
    correct_answer = serializers.CharField()
    statements = serializers.ListField(
        child=serializers.CharField(), required=False, allow_empty=True
    )


class ExamScheduleSerializer(serializers.Serializer):
    exam_name = serializers.CharField()
    date = serializers.DateField()
    start_time = serializers.TimeField()
    duration_minutes = serializers.IntegerField(min_value=1)
    questions_count = serializers.IntegerField(min_value=1)
    questions = QuestionSerializer(many=True)


class StudentExamSerializer(serializers.ModelSerializer):
    exam = serializers.SerializerMethodField()

    class Meta:
        model = StudentExam
        fields = ['id', 'exam', 'started_at', 'submitted_at', 'is_completed', 'score', 'percentage']

    def get_exam(self, obj):
        from datetime import datetime, timedelta

        exam = obj.exam
        start_datetime = datetime.combine(exam.date, exam.start_time)
        end_datetime = start_datetime + timedelta(minutes=exam.duration_minutes)

        return {
            'id': str(exam.id),
            'title': exam.exam_name,
            'correct_answers': obj.correct_count,
            'wrong_answers': obj.wrong_count,
            'score': obj.score,
            'percentage': obj.percentage, 
            'startTime': start_datetime.isoformat(),
            'endTime': end_datetime.isoformat(),
            'resultAvailable': obj.is_completed
        }
    
class QuestionsSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    options = serializers.SerializerMethodField()
    statements = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id", "question_text", "type", "options", "statements"]

    def get_type(self, obj):
        return "statement" if obj.statements else "mcq"

    def get_options(self, obj):
        return [
            obj.option_a,
            obj.option_b,
            obj.option_c,
            obj.option_d,
        ]

    def get_statements(self, obj):
        if not obj.statements:
            return []
        return [s.strip() for s in obj.statements.split("###") if s.strip()]


class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionsSerializer(many=True)

    class Meta:
        model = Exam
        fields = ["id", "exam_name", "duration_minutes", "questions"]


class AddStaffSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    address = serializers.CharField()
    phone_number = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    username = serializers.CharField()
    branch = serializers.UUIDField()
    role = serializers.ChoiceField(choices=["TEACHER", "PRINCIPAL"])

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Email already exists")
        return email

    def validate_phone_number(self, value):
        if (
            PrincipalProfile.objects.filter(phone_number=value).exists()
            or TeacherProfile.objects.filter(phone_number=value).exists()
        ):
            raise serializers.ValidationError("Phone number already exists")
        return value

    def validate_branch(self, value):
        try:
            return BranchProfile.objects.get(id=value)
        except BranchProfile.DoesNotExist:
            raise serializers.ValidationError("Invalid branch")

    def validate(self, data):
        if data["role"] == "PRINCIPAL":
            if PrincipalProfile.objects.filter(branch=data["branch"]).exists():
                raise serializers.ValidationError(
                    {"role": "This branch already has a principal"}
                )
        return data

    def _generate_password(self):
        return "".join(
            random.choices(
                string.ascii_letters + string.digits + "!@#$%^&*", k=8
            )
        )

    def create(self, validated_data):
        request = self.context["request"]

        branch = validated_data.pop("branch")
        role = validated_data.pop("role")
        email = validated_data["email"].lower()

        password = self._generate_password()

        try:
            with transaction.atomic():

                user = User.objects.create_user(
                    username=validated_data["username"],
                    email=email,
                    password=password,
                    role=role,
                    is_active=True,
                )

                profile_data = {
                    "user": user,
                    "branch": branch,
                    "full_name": validated_data["full_name"],
                    "address": validated_data["address"],
                    "phone_number": validated_data["phone_number"],
                    "email": email,
                    "created_by": request.user,
                }

                if role == "PRINCIPAL":
                    profile = PrincipalProfile.objects.create(**profile_data)
                else:
                    profile = TeacherProfile.objects.create(**profile_data)

        except IntegrityError:
            raise serializers.ValidationError(
                "A user with this email or username already exists"
            )

        return {
            "user": user,
            "profile": profile,
            "password": password,
            "role": role,
        }

class BulkStaffSerializer(serializers.Serializer):
    staff = serializers.ListField(child=serializers.DictField())

    def create(self, validated_data):
        staff_list = validated_data.get('staff', [])
        created_staff = []
        failed_list = []

        for staff in staff_list:
            username = staff.get('username')
            email = staff.get('email')
            role = staff.get('role')
            branch_id = staff.get('branch')
            full_name = staff.get('full_name')
            address = staff.get('address')
            phone_number = staff.get('phone_number')
            row_number = staff.get('row_number', 'unknown')

            try:
                raw_password = ''.join(
                    random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=8)
                )
                hashed_password = make_password(raw_password)

                user = User.objects.create(
                    username=username,
                    email=email,
                    role=role,
                    password=hashed_password,
                    is_active=True,
                )

                branch = BranchProfile.objects.get(id=branch_id)

                if role == 'PRINCIPAL':
                    PrincipalProfile.objects.create(
                        user=user,
                        branch=branch,
                        full_name=full_name,
                        email=email,
                        address=address,
                        phone_number=phone_number,
                        created_by=self.context.get('request').user
                    )
                elif role == 'TEACHER':
                    TeacherProfile.objects.create(
                        user=user,
                        branch=branch,
                        full_name=full_name,
                        email=email,
                        address=address,
                        phone_number=phone_number,
                        created_by=self.context.get('request').user
                    )
                else:
                    user.delete()
                    failed_list.append({
                        'row_number': row_number,
                        'error': f"Unsupported role: {role}"
                    })
                    continue

                created_staff.append({
                    'user': user,
                    'full_name': full_name,
                    'email': email,
                    'password': raw_password
                })

            except Exception as e:
                failed_list.append({
                    'row_number': row_number,
                    'error': str(e)
                })

        return {
            'created_staff': created_staff,
            'failed_list': failed_list
        }

class StaffListSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    full_name = serializers.CharField()
    address = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField()
    branch_name = serializers.CharField()
    branch_id = serializers.UUIDField()
    role = serializers.CharField()
    is_active = serializers.BooleanField()

class StaffUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    address = serializers.CharField(required=False)
    phone_number = serializers.CharField(required=False)
    branch = serializers.UUIDField(required=False)

    def validate_email(self, value):
        staff = self.instance
        user = staff.user

        if User.objects.exclude(id=user.id).filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already used by another user")

        if TeacherProfile.objects.exclude(id=staff.id).filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already used by another teacher")

        if PrincipalProfile.objects.exclude(id=staff.id).filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already used by another principal")

        return value

    def validate_phone_number(self, value):
        staff = self.instance

        if TeacherProfile.objects.exclude(id=staff.id).filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already exists")

        if PrincipalProfile.objects.exclude(id=staff.id).filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already exists")

        return value

    def validate_branch(self, value):
        if not BranchProfile.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid branch ID")
        return value

    def update(self, instance, validated_data):

        if "branch" in validated_data:
            instance.branch = BranchProfile.objects.get(id=validated_data["branch"])

        if "email" in validated_data:
            instance.email = validated_data["email"]
            instance.user.email = validated_data["email"]
            instance.user.save(update_fields=["email"])

        for field in ("full_name", "address", "phone_number"):
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        instance.save()
        return instance

class ScheduleMeetListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source="created_by.full_name", read_only=True
    )
    branch_name = serializers.CharField(
        source="branch.branch_name", read_only=True
    )
    branch_id = serializers.UUIDField(
        source="branch.id", read_only=True
    )

    class Meta:
        model = ScheduleMeet
        fields = [
            "id",
            "topic",
            "description",
            "meet_url",
            "date",
            "time",
            "teacher_name",
            "branch_name",
            "branch_id",
        ]

class TimetableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timetable
        fields = ['teacher', 'topic', 'from_date', 'to_date', 'start_time', 'end_time', 'description']

    def validate_teacher(self, value):
        if not TeacherProfile.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Teacher not found.")
        return value


class TimetableChangeRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="requested_by.full_name", read_only=True)

    class Meta:
        model = TimetableChangeRequest
        fields = [
            'id',
            'teacher_name',
            'from_date',
            'to_date',
            'start_time',
            'end_time',
            'reason',
            'status',
            'created_at',
        ]

class TimetableListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True)
    pending_request = serializers.SerializerMethodField()

    class Meta:
        model = Timetable
        fields = [
            'id',
            'topic',
            'from_date',
            'to_date',
            'start_time',
            'end_time',
            'description',
            'teacher_name',
            'pending_request',
        ]

    def get_pending_request(self, obj):
        request = obj.change_requests.filter(status='PENDING').first()
        if request:
            return TimetableChangeRequestSerializer(request).data
        return None

class TimetableChangeRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimetableChangeRequest
        fields = [
            "timetable",
            "from_date",
            "to_date",
            "start_time",
            "end_time",
            "reason",
        ]

    def validate(self, data):
        timetable = data.get("timetable")
        teacher = self.context["teacher"]

        if TimetableChangeRequest.objects.filter(
            timetable=timetable,
            requested_by=teacher,
            status="PENDING"
        ).exists():
            raise serializers.ValidationError(
                "A pending request already exists for this timetable."
            )

        if data.get("from_date") and data.get("to_date"):
            if data["from_date"] > data["to_date"]:
                raise serializers.ValidationError(
                    "From date cannot be after To date."
                )

        if data.get("start_time") and data.get("end_time"):
            if data["start_time"] >= data["end_time"]:
                raise serializers.ValidationError(
                    "Start time must be before End time."
                )

        return data

    def create(self, validated_data):
        teacher = self.context["teacher"]

        return TimetableChangeRequest.objects.create(
            requested_by=teacher,
            **validated_data
        )
    
class NotesSerializer(serializers.ModelSerializer):
    material_type = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source="uploaded_by.username", read_only=True)

    class Meta:
        model = Notes
        fields = [
            "id",
            "material_type",
            "topic",
            "description",
            "file",
            "uploaded_by_name",
            "created_at",
        ]

    def get_material_type(self, obj):
        return "NOTES"
    
    def get_file_url(self, obj):
        if obj.file:
            return f"{settings.MEDIA_URL}{obj.file.name}"
        return None


class SyllabusSerializer(serializers.ModelSerializer):
    material_type = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source="uploaded_by.username", read_only=True)

    class Meta:
        model = Syllabus
        fields = [
            "id",
            "material_type",
            "topic",
            "description",
            "file",
            "uploaded_by_name",
            "created_at",
        ]

    def get_material_type(self, obj):
        return "SYLLABUS"
    
    def get_file_url(self, obj):
        if obj.file:
            return f"{settings.MEDIA_URL}{obj.file.name}"
        return None


class RecordingsSerializer(serializers.ModelSerializer):
    material_type = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source="uploaded_by.username", read_only=True)

    class Meta:
        model = Recordings
        fields = [
            "id",
            "material_type",
            "topic",
            "description",
            "file",
            "uploaded_by_name",
            "created_at",
        ]

    def get_material_type(self, obj):
        return "RECORDING"
    
    def get_file_url(self, obj):
        if obj.file:
            return f"{settings.MEDIA_URL}{obj.file.name}"
        return None
    
class MonthlyPaymentCreateSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=StudentProfile.objects.all())

    class Meta:
        model = MonthlyPayment
        fields = ['student', 'monthly_amount']


class StudentMonthlyPaymentListSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = MonthlyPayment
        fields = (
            'id',
            'student_name',
            'year',
            'month',
            'monthly_amount',
            'status',
            'paid_date',
        )

class MonthlyPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyPayment
        fields = ['id', 'year', 'month', 'monthly_amount', 'status', 'paid_date']