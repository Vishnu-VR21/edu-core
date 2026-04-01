import React, { useState} from "react";
import { IoNotifications } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { CgMenuRightAlt } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
import { FaBook } from "react-icons/fa";

export default function Navbar({ sidebarOpen, toggleSidebar, pendingCount }) {
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = user.role === "ADMIN";

  const handleNotificationClick = () => {
    setUserOpen(false);
    setNotifOpen(false);
    navigate("/admin_dashboard/students_approval");
  };

  const handlePasswordChange = () => {
    setUserOpen(false);
    setNotifOpen(false);
    navigate("/student_dashboard/change_password");
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-6 sm:px-16 lg:px-24 xl:px-32 py-4 flex items-center justify-between shadow-lg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-lg">
          <FaBook className="text-white text-xl" />
        </div>
        <span className="text-2xl font-bold bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
          Role-Based Education ERP System
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-4 relative z-10">
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2.5 rounded-xl text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 ease-out transform hover:scale-105 group"
            >
              <IoNotifications
                size={20}
                className="group-hover:animate-pulse"
              />

              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold flex items-center justify-center text-white bg-linear-to-r from-red-500 to-red-600 rounded-full shadow-lg animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <div
              className={`absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl text-slate-900 border border-white/20 rounded-2xl shadow-2xl
                transform transition-all duration-300 origin-top-right ${
                  notifOpen
                    ? "scale-100 opacity-100 translate-y-0"
                    : "scale-95 opacity-0 -translate-y-2 pointer-events-none"
                }
              `}
            >
              <div className="p-1">
                <ul className="text-sm font-medium">
                  {pendingCount > 0 ? (
                    <li
                      onClick={handleNotificationClick}
                      className="px-4 py-3 cursor-pointer hover:bg-blue-50 rounded-xl transition-all duration-300 flex items-center gap-3 group"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                      <span>
                        <span className="font-semibold text-blue-600">
                          {pendingCount}
                        </span>{" "}
                        student
                        {pendingCount > 1 ? "s" : ""} pending approval
                      </span>
                    </li>
                  ) : (
                    <li className="px-4 py-3 text-gray-400 cursor-default flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>No new notifications</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 border border-blue-500/20"
          >
            {user.username}
          </button>

          <div
            className={`absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl
              transform transition-all duration-300 origin-top-right
              ${
                userOpen
                  ? "scale-100 opacity-100 translate-y-0"
                  : "scale-95 opacity-0 -translate-y-2 pointer-events-none"
              }
            `}
          >
            <div className="p-1">
              <ul className="text-sm font-medium">
                {user.role != "ADMIN" && (
                  <li>
                    <button
                      onClick={handlePasswordChange}
                      className="w-full text-left px-4 py-2.5 text-blue-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:translate-x-1 font-medium"
                    >
                      Change Password
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:translate-x-1 font-medium"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="sm:hidden p-2.5 rounded-xl text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 transform hover:scale-105 relative z-10"
      >
        <div className="relative w-6 h-6">
          <CgMenuRightAlt
            className={`absolute inset-0 text-2xl transition-all duration-300
              ${
                sidebarOpen
                  ? "opacity-0 rotate-90 scale-75"
                  : "opacity-100 rotate-0 scale-100"
              }
            `}
          />
          <RxCross2
            className={`absolute inset-0 text-2xl transition-all duration-300
              ${
                sidebarOpen
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-90 scale-75"
              }
            `}
          />
        </div>
      </button>
    </nav>
  );
}
