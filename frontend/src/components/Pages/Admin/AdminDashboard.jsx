import React, { useEffect, useState } from "react";
import Navbar from "../../Navbar/Navbar";
import Sidebar from "../../Sidebar/Sidebar";
import axios from "axios";
import config from "../../../utils/config";
import { Routes, Route } from "react-router-dom";
import DashboardHome from "./DashboardHome";
import AddBranch from "./AddBranch";
import BranchDetails from "./BranchDetails";
import StudentsDetails from "./StudentsDetails";
import StudentsApproval from "./StudentsApproval";
import AddStaffEntry from "./AddStaffEntry";
import StaffDetails from "./StaffDetails";
import { useCallback } from "react";
import AttendanceDetails from "../Branch/AttendanceDetails";
import PaymentReports from "./PaymentReports";

export default function AdminDashboard() {
  console.log("data", localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${config.baseurl}pending_students_approval/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setPendingCount(res.data.pending_count);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

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
      <Navbar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        pendingCount={pendingCount}
      />

      <div className="pt-18 flex min-h-screen">
        <Sidebar onClose={closeSidebar} />

        <div className="flex-1 sm:ml-64 bg-gray-100 overflow-auto p-6">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="add_branch" element={<AddBranch />} />
            <Route path="add_staff" element={<AddStaffEntry />} />
            <Route path="branch_details" element={<BranchDetails />} />
            <Route path="staff_details" element={<StaffDetails />} />
            <Route path="students_details" element={<StudentsDetails />} />
            <Route
              path="students_approval"
              element={
                <StudentsApproval refreshPendingCount={refreshPendingCount} />
              }
            />
            <Route path="attendance_details" element={<AttendanceDetails />} />
            <Route path="payment_reports" element={<PaymentReports />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
