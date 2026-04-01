import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoEye, IoEyeOff, IoLockClosed } from "react-icons/io5";
import { LuKeyRound } from "react-icons/lu";
import axios from "axios";
import config from "../../../utils/config";

export default function ChangePassword() {
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const isStudent = user.role === "STUDENT";
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      console.log("password details", formData);

      await axios.post(
        `${config.baseurl}change_password/`,
        {
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      toast.success("Password changed successfully. Please log in again.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/auth");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/student_dashboard");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-2xl mt-4 shadow-lg">
            <LuKeyRound className="w-8 h-8 text-white" />
          </div>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-blue-900">
              Change Password
            </h2>
            <p className="text-sm text-gray-600">
              Update your password to keep your account secure
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-semibold text-blue-900 mb-2"
              >
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoLockClosed className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                    errors.currentPassword
                      ? "border-red-300 bg-red-50"
                      : "border-blue-300 bg-blue-50"
                  }`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showCurrentPassword ? (
                    <IoEyeOff className="h-5 w-5 text-blue-400 hover:text-blue-600" />
                  ) : (
                    <IoEye className="h-5 w-5 text-blue-400 hover:text-blue-600" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold text-blue-900 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoLockClosed className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                    errors.newPassword
                      ? "border-red-300 bg-red-50"
                      : "border-blue-300 bg-blue-50"
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showNewPassword ? (
                    <IoEyeOff className="h-5 w-5 text-blue-400 hover:text-blue-600" />
                  ) : (
                    <IoEye className="h-5 w-5 text-blue-400 hover:text-blue-600" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.newPassword}
                </p>
              )}
              <p className="mt-2 text-xs text-blue-500">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-blue-900 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoLockClosed className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                    errors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-blue-300 bg-blue-50"
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showConfirmPassword ? (
                    <IoEyeOff className="h-5 w-5 text-blue-400 hover:text-blue-600" />
                  ) : (
                    <IoEye className="h-5 w-5 text-blue-400 hover:text-blue-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-white border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors ${
                  loading
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : "bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-950 shadow-blue-900/20"
                }`}
              >
                {loading ? "Saving..." : "Save Password"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <IoLockClosed className="h-5 w-5 text-blue-600" />
            Security Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                Use a strong password with a mix of letters, numbers, and
                symbols
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Don't use the same password across multiple sites</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Change your password regularly to maintain security</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
