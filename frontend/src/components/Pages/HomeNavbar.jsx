import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaBars, FaTimes, FaBook } from "react-icons/fa";
import { useState } from "react";

export default function HomeNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToSection = (sectionId) => {
    setMobileMenuOpen(false);

    if (location.pathname !== "/") {
      navigate(`/?scrollTo=${sectionId}`);
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="bg-slate-900/95 fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-blue-500/20">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => goToSection("home")}
        >
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <FaBook className="text-white text-xl" />
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Role-Based Education ERP System
          </span>
        </div>

        <nav className="hidden lg:flex gap-8 text-gray-300 items-center">
          {[
            ["home", "Home"],
            ["gallery", "Gallery"],
            ["courses", "Courses"],
            ["faculty", "Faculty"],
            ["why-us", "Why Us"],
            ["contact", "Contact"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => goToSection(id)}
              className="hover:text-white font-medium relative"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex">
          <button
            onClick={() => navigate("/auth")}
            className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-full px-6 py-3 font-medium flex items-center gap-2"
          >
            <FaUser />
            Login / Register
          </button>
        </div>

        <button
          className="lg:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-800 border-t border-blue-500/20">
          <nav className="flex flex-col px-6 py-4 space-y-4">
            {[
              ["home", "Home"],
              ["gallery", "Gallery"],
              ["courses", "Courses"],
              ["faculty", "Faculty"],
              ["why-us", "Why Us"],
              ["contact", "Contact"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => goToSection(id)}
                className="text-gray-300 hover:text-white text-left"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
