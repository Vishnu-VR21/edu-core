import React, { useState } from "react";
import { Routes, Route} from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import Sidebar from "../../Sidebar/Sidebar";

import DashboardHome from "../Admin/DashboardHome";
import ChangePassword from "../Student/ChangePassword";

export default function ParentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  console.log("parent info", localStorage.getItem("user"))

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
          </Routes>
        </div>
      </div>
    </div>
  );
}
