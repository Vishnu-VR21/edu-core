import React, { useState } from "react";
import { Routes, Route} from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import Sidebar from "../../Sidebar/Sidebar";

import DashboardHome from "../Admin/DashboardHome";
import ChangePassword from "../Student/ChangePassword";
import ScheduleMeet from "./ScheduleMeet";
import AddLearningMaterials from "../Principal/AddLearningMaterials";
import AddAttendance from "../Principal/AddAttendance";

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  console.log("token", localStorage.getItem('token'))

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
            <Route path="schedule_meet" element={<ScheduleMeet />} />
            <Route path="add_materials" element={<AddLearningMaterials />} />
            <Route path="add_attendance" element={<AddAttendance />} />
            <Route path="change_password" element={<ChangePassword />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
