import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoNotifications, IoPersonCircle } from "react-icons/io5";
import axios from "axios";
import config from "../../utils/config";

const linkClass = ({ isActive }) =>
  `flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 transform ${
    isActive
      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105"
      : "text-white hover:bg-white/10 hover:scale-105 hover:translate-x-1"
  }`;

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isAdmin = user.role === "ADMIN";
  const isBranch = user.role === "BRANCH";
  const isStudent = user.role === "STUDENT";
  const isParent = user.role === "PARENT";
  const isTeacher = user.role === "TEACHER";
  const isPrincipal = user.role === "PRINCIPAL";
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${config.baseurl}pending_students_approval/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );
        setPendingCount(res.data.pending_count);
      } catch (err) {
        console.error("Failed to fetch pending count", err);
      }
    };

    fetchPendingCount();
  }, [isAdmin]);

  if (!user) return null;

  const handleNotificationClick = () => {
    navigate("/admin_dashboard/students_approval");
    onClose();
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside
      id="sidebar-multi-level-sidebar"
      className="fixed bg-slate-900/95 backdrop-blur-xl border-r border-white/10 top-17 left-0 z-40 w-90 sm:w-64 h-[calc(100vh-4rem)] transition-transform -translate-x-full sm:translate-x-0 shadow-2xl flex flex-col justify-between "
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 mt-10 md:mt-0 relative z-10">
        <ul className="space-y-3 font-medium">
          {isAdmin && (
            <>
              <NavLink
                to="/admin_dashboard"
                end
                onClick={onClose}
                className={linkClass}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin_dashboard/add_branch"
                onClick={onClose}
                className={linkClass}
              >
                Add Branch
              </NavLink>
              <NavLink
                to="/admin_dashboard/branch_details"
                onClick={onClose}
                className={linkClass}
              >
                Branch Details
              </NavLink>
              <NavLink
                to="/admin_dashboard/add_staff"
                onClick={onClose}
                className={linkClass}
              >
                Add Staff
              </NavLink>
              <NavLink
                to="/admin_dashboard/staff_details"
                onClick={onClose}
                className={linkClass}
              >
                Staff Details
              </NavLink>
              <NavLink
                to="/admin_dashboard/students_approval"
                onClick={onClose}
                className={linkClass}
              >
                Students Approval
              </NavLink>
              <NavLink
                to="/admin_dashboard/students_details"
                onClick={onClose}
                className={linkClass}
              >
                Students Details
              </NavLink>
              <NavLink
                to="/admin_dashboard/attendance_details"
                end
                onClick={onClose}
                className={linkClass}
              >
                Attendance Details
              </NavLink>
              <NavLink
                to="/admin_dashboard/payment_reports"
                end
                onClick={onClose}
                className={linkClass}
              >
                Fee Payment Summary
              </NavLink>
            </>
          )}

          {isBranch && (
            <>
              <NavLink
                to="/branch_dashboard"
                end
                onClick={onClose}
                className={linkClass}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/branch_dashboard/add_student_entry"
                onClick={onClose}
                className={linkClass}
              >
                Add Student
              </NavLink>
              <NavLink
                to="/branch_dashboard/add_payment"
                onClick={onClose}
                className={linkClass}
              >
                Add Payment
              </NavLink>
              <NavLink
                to="/branch_dashboard/staff_details"
                onClick={onClose}
                className={linkClass}
              >
                Staff Details
              </NavLink>
              <NavLink
                to="/branch_dashboard/students_details"
                onClick={onClose}
                className={linkClass}
              >
                Students Details
              </NavLink>
              <NavLink
                to="/branch_dashboard/schedule_exam"
                onClick={onClose}
                className={linkClass}
              >
                Schedule Exam
              </NavLink>
              <NavLink
                to="/branch_dashboard/attendance_details"
                end
                onClick={onClose}
                className={linkClass}
              >
                Attendance Details
              </NavLink>
            </>
          )}

          {isStudent && (
            <>
              <NavLink
                to="/student_dashboard"
                end
                onClick={onClose}
                className={linkClass}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/student_dashboard/exam_details"
                onClick={onClose}
                className={linkClass}
              >
                My Exam
              </NavLink>
            </>
          )}

          {isParent && (
            <>
              <NavLink
                to="/parent_dashboard"
                end
                onClick={onClose}
                className={linkClass}
              >
                Dashboard
              </NavLink>
            </>
          )}

          {isTeacher && (
            <>
              <NavLink
                to="/teacher_dashboard"
                end
                onClick={onClose}
                className={linkClass}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/teacher_dashboard/schedule_meet"
                end
                onClick={onClose}
                className={linkClass}
              >
                Schedule Meet
              </NavLink>
              <NavLink
                to="/teacher_dashboard/add_materials"
                end
                onClick={onClose}
                className={linkClass}
              >
                Learning Materials
              </NavLink>
              <NavLink
                to="/teacher_dashboard/add_attendance"
                end
                onClick={onClose}
                className={linkClass}
              >
                Attendance
              </NavLink>
            </>
          )}

          {isPrincipal && (
            <>
              <NavLink
                to="/principal_dashboard"
                end
                onClick={onClose}
                className={linkClass}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/principal_dashboard/add_timetable"
                end
                onClick={onClose}
                className={linkClass}
              >
                Timetable
              </NavLink>
              <NavLink
                to="/principal_dashboard/add_materials"
                end
                onClick={onClose}
                className={linkClass}
              >
                Learning Materials
              </NavLink>
              <NavLink
                to="/principal_dashboard/add_attendance"
                end
                onClick={onClose}
                className={linkClass}
              >
                Attendance
              </NavLink>
            </>
          )}
        </ul>
      </div>

      <div className="sm:hidden px-4 py-6 border-t border-white/10 relative z-10">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-3 w-full text-white bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          <IoPersonCircle size={35} className="text-blue-400" />
          <span className="font-semibold text-lg">{user.username}</span>
        </button>

        <div
          className={`mt-3 overflow-hidden transition-all duration-300 ${
            userMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="space-y-2">
            {isAdmin && (
              <li>
                <button
                  onClick={handleNotificationClick}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 border border-white/10"
                >
                  <span className="flex items-center gap-2">
                    <IoNotifications size={18} />
                    Pending Approvals
                  </span>
                  <span className="bg-linear-to-r from-red-500 to-red-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                    {pendingCount}
                  </span>
                </button>
              </li>
            )}

            {user.role != "ADMIN" && (
              <li>
                <button
                  onClick={() => {
                    navigate("/student_dashboard/change_password");
                    onClose();
                  }}
                  className="w-full text-left block px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:translate-x-1 border border-white/10"
                >
                  Change Password
                </button>
              </li>
            )}

            <li>
              <button
                onClick={handleSignOut}
                className="w-full text-left block px-4 py-3 text-red-400 hover:bg-red-50/10 rounded-xl transition-all duration-300 hover:translate-x-1 border border-red-400/20 font-medium"
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
