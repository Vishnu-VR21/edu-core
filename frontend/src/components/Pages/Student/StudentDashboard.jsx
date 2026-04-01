import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import Sidebar from "../../Sidebar/Sidebar";

import DashboardHome from "../Admin/DashboardHome";
import ExamDetails from "./ExamDetails";
import ExamCenter from "./ExamCenter";
import ChangePassword from "./ChangePassword";

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  console.log("user info", localStorage.getItem("user"))

  const isExamPage = location.pathname.includes("/exam/");

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
      {!isExamPage && (
        <div>
          <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <Sidebar onClose={closeSidebar} />
        </div>
      )}

      <div className={`flex min-h-screen ${!isExamPage ? "pt-18" : ""}`}>
        <div
          className={`flex-1 ${
            isExamPage
              ? "w-full p-0 bg-white"
              : "sm:ml-64 bg-gray-100 overflow-auto p-6"
          }`}
        >
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="exam_details" element={<ExamDetails />} />
            <Route path="exam/:examId/start" element={<ExamCenter />} />
            <Route path="change_password" element={<ChangePassword />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
