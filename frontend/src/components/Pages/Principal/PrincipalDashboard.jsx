import React, { useState } from "react";
import { Routes, Route} from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import Sidebar from "../../Sidebar/Sidebar";

import DashboardHome from "../Admin/DashboardHome";
import ChangePassword from "../Student/ChangePassword";
import AddTimetable from "./AddTimetable";
import AddLearningMaterials from "./AddLearningMaterials";
import AddAttendance from "./AddAttendance";

export default function PrincipalDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log("data", localStorage.getItem("user"));

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
            <Route path="change_password" element={<ChangePassword />} />
            <Route path="add_timetable" element={<AddTimetable />} />
            <Route path="add_materials" element={<AddLearningMaterials />} />
            <Route path="add_attendance" element={<AddAttendance />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
