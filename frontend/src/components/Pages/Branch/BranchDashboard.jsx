import React, { useState } from "react";
import Navbar from "../../Navbar/Navbar";
import Sidebar from "../../Sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";

import DashboardHome from "../Admin/DashboardHome";
import AddStudentEntry from "./AddStudentEntry";
import StudentsDetails from "../Admin/StudentsDetails";
import ScheduleExam from "./ScheduleExam";
import StaffDetails from "../Admin/StaffDetails";
import AttendanceDetails from "./AttendanceDetails";
import AddPayment from "./AddPayment";
import ViewStudentFees from "./ViewStudentFees";

export default function BranchDashboard() {
  console.log("data", localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar-multi-level-sidebar");
    sidebar?.classList.toggle("-translate-x-full");
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    const sidebar = document.getElementById("sidebar-multi-level-sidebar");
    sidebar?.classList.add("-translate-x-full");
    setSidebarOpen(false);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="pt-18 flex min-h-screen">
        <Sidebar onClose={closeSidebar} />

        <div className="flex-1 sm:ml-64 bg-gray-100 overflow-auto p-6">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="add_student_entry" element={<AddStudentEntry />} />
            <Route path="add_payment" element={<AddPayment />} />
            <Route path="staff_details" element={<StaffDetails />} />
            <Route path="students_details" element={<StudentsDetails />} />
            <Route path="schedule_exam" element={<ScheduleExam />} />
            <Route path="attendance_details" element={<AttendanceDetails />} />
            <Route path="student_fees_details/:studentId" element={<ViewStudentFees />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
