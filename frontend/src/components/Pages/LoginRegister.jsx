import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../utils/config";
import { GiSpellBook } from "react-icons/gi";
import { FaArrowLeft } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import HomeNavbar from "./HomeNavbar";

export default function LoginRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    branch: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });
  const [errors, setErrors] = useState({
    phone: "",
    email: "",
    parentPhone: "",
    parentEmail: "",
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`${config.baseurl}list_all_branches/`);
        setBranches(res.data);
      } catch (err) {
        toast.error("Failed to load branches");
        console.error(err);
      }
    };

    if (!isLogin) {
      fetchBranches();
    }
  }, [isLogin]);

  const validateField = (name, value, updatedFormData) => {
    let newErrors = { ...errors };

    const isGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

    const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

    if (name === "email") {
      if (!isGmail(value)) {
        newErrors.email = "Email must be a valid @gmail.com address";
      } else {
        newErrors.email = "";
      }
    }

    if (name === "parentEmail") {
      if (!isGmail(value)) {
        newErrors.parentEmail =
          "Parent email must be a valid @gmail.com address";
      } else {
        newErrors.parentEmail = "";
      }
    }

    if (name === "phone") {
      if (!isValidPhone(value)) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      } else if (
        updatedFormData.parentPhone &&
        value === updatedFormData.parentPhone
      ) {
        newErrors.phone = "Student and parent phone numbers must be different";
      } else {
        newErrors.phone = "";
      }
    }

    if (name === "parentPhone") {
      if (!isValidPhone(value)) {
        newErrors.parentPhone = "Parent phone number must be exactly 10 digits";
      } else if (updatedFormData.phone && value === updatedFormData.phone) {
        newErrors.parentPhone =
          "Student and parent phone numbers must be different";
      } else {
        newErrors.parentPhone = "";
      }
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);
    validateField(name, value, updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin) {
      toast.info("Registration is disabled for now");
      return;
    }

    const { username, password } = formData;
    try {
      setLoading(true);
      const response = await axios.post(`${config.baseurl}request_for_login/`, {
        username,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Login successful");

      switch (user.role) {
        case "ADMIN":
          navigate("/admin_dashboard");
          break;
        case "BRANCH":
          navigate("/branch_dashboard");
          break;
        case "STUDENT":
          navigate("/student_dashboard");
          break;
        case "PARENT":
          navigate("/parent_dashboard");
          break;
        case "TEACHER":
          navigate("/teacher_dashboard");
          break;
        case "PRINCIPAL":
          navigate("/principal_dashboard");
          break;
        default:
          console.error("Unknown role:", user.role);
          toast.error("Unauthorized role");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid username or password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some((err) => err);

    if (hasErrors) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    const payload = {
      username: formData.username,
      password: formData.password,
      full_name: formData.fullName,
      phone_number: formData.phone,
      email: formData.email,
      address: formData.address,
      branch: formData.branch,
      parent_name: formData.parentName,
      parent_email: formData.parentEmail,
      parent_phone: formData.parentPhone,
    };

    console.log("register data", payload);

    try {
      setLoading(true);

      await axios.post(
        `${config.baseurl}individual_student_register/`,
        payload
      );

      toast.success("Registration successful. Wait for approval.");
      toggleMode();
    } catch (error) {
      console.error(error.response?.data);

      const data = error.response?.data;

      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const firstError = data[firstKey][0];

        toast.error(firstError);
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setFormData({
      username: "",
      password: "",
      fullName: "",
      phone: "",
      email: "",
      branch: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
    });
    setErrors({
      phone: "",
      email: "",
      password: "",
    });
  };

  return (
    <>
      <HomeNavbar />
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden pt-22 lg:pt-25">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
        </div>

        <div className="relative w-full max-w-5xl bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-2/5 bg-linear-to-br from-blue-600 to-blue-800 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20"></div>
              <div className="relative z-10 text-center space-y-6">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm transform hover:scale-110 transition-transform duration-500">
                  <GiSpellBook className="text-white text-6xl" />
                </div>
                <h2 className="text-3xl font-bold">
                  Welcome {isLogin ? "Back" : ""}
                </h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {isLogin
                    ? "Enter your credentials to access your account and continue your learning journey"
                    : "Create an account to start your educational journey with us"}
                </p>
                <div className="pt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <FaCheck className="text-white text-sm" />
                    </div>
                    <span>Secure & Encrypted</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <FaCheck className="text-white text-sm" />
                    </div>
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <FaCheck className="text-white text-sm" />
                    </div>
                    <span>Premium Features</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-3/5 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">
                    {isLogin ? "Sign In" : "Create Account"}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {isLogin
                      ? "Please enter your credentials to continue"
                      : "Fill in the details to get started"}
                  </p>
                </div>

                <form
                  onSubmit={isLogin ? handleSubmit : handleRegister}
                  className="space-y-5"
                >
                  {!isLogin && (
                    <div className="space-y-5 animate-slide-in">
                      <div className="form-group">
                        <label className="block text-white text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="form-group">
                        <label className="block text-white text-sm font-medium mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="block text-white text-sm font-medium mb-2">
                          Email-ID
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your email"
                        />
                        {errors.email && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="block text-white text-sm font-medium mb-2">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your address"
                        ></textarea>
                      </div>

                      <div className="form-group">
                        <label className="block text-white text-sm font-medium mb-2">
                          Branch
                        </label>
                        <select
                          name="branch"
                          value={formData.branch}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" className="bg-slate-800">
                            Select branch
                          </option>

                          {branches.map((branch) => (
                            <option
                              key={branch.id}
                              value={branch.id}
                              className="bg-slate-800"
                            >
                              {branch.branch_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="block text-white text-sm font-medium mb-2">
                          Parent Full Name
                        </label>
                        <input
                          type="text"
                          name="parentName"
                          value={formData.parentName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter parent's full name"
                        />
                      </div>

                      <div className="form-group">
                        <label className="block text-white text-sm font-medium mb-2">
                          Parent Email-ID
                        </label>
                        <input
                          type="email"
                          name="parentEmail"
                          value={formData.parentEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter parent's email"
                        />
                        {errors.parentEmail && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.parentEmail}
                          </p>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="block text-white text-sm font-medium mb-2">
                          Parent Phone Number
                        </label>
                        <input
                          type="tel"
                          name="parentPhone"
                          value={formData.parentPhone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter parent's phone number"
                        />
                        {errors.parentPhone && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.parentPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="block text-white text-sm font-medium mb-2">
                      User Name
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  {isLogin && (
                    <div className="form-group">
                      <label className="block text-white text-sm font-medium mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {isLogin ? "Logging in..." : "Registering..."}
                      </span>
                    ) : isLogin ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <div className="text-center text-sm text-gray-400 pt-4">
                    {isLogin ? (
                      <>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={toggleMode}
                          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300"
                        >
                          Register
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={toggleMode}
                          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300"
                        >
                          Sign In
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
      </div>
    </>
  );
}
