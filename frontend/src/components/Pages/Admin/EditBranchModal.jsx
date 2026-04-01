import { useState, useEffect, useRef } from "react";
import axios from "axios";
import config from "../../../utils/config";

export default function EditBranchModal({ branch, onClose, onSave }) {
  const [form, setForm] = useState({ ...branch });
  const [errors, setErrors] = useState({});
  const originalRef = useRef({
    branchName: branch.branchName,
    email: branch.email,
    phone: branch.phone,
    username: branch.username,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({ ...branch });
    setErrors({});
    originalRef.current = {
      branchName: branch.branchName,
      email: branch.email,
      phone: branch.phone,
      username: branch.username,
    };
  }, [branch]);

  const validateFormat = (field, value) => {
    if (field === "email" && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value)) {
      return "Invalid email address";
    }
    if (field === "phone" && !/^\d{10}$/.test(value)) {
      return "Phone number must be 10 digits";
    }
    if (field === "password") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{6,}$/;
      if (!passwordRegex.test(value))
        return "Password must be ≥6 chars, include uppercase, lowercase, number & special char";
    }
    return "";
  };

  const checkAvailability = async (field, value) => {
    if (value === originalRef.current[field]) return;
    const formatError = validateFormat(field, value);
    if (formatError) return;

    const params = { exclude_branch_id: branch.id };
    if (field === "branchName") params.branch_name = value;
    if (field === "email") params.email = value;
    if (field === "phone") params.contact_number = value;
    if (field === "username") params.username = value;

    try {
      const res = await axios.get(
        `${config.baseurl}branches/check_availability/`,
        { params },
      );
      const backendKey = Object.keys(res.data)[0];
      const available = res.data[backendKey];

      setErrors((prev) => ({
        ...prev,
        [field]: available
          ? ""
          : `${field.replace(/([A-Z])/g, " $1")} already exists`,
      }));
    } catch {
      setErrors((prev) => ({ ...prev, [field]: "Server error" }));
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateFormat(field, value) }));
  };

  const handleBlur = (field, value) => {
    if (["branchName", "email", "phone", "username"].includes(field)) {
      checkAvailability(field, value);
    }
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      await Promise.all([
        checkAvailability("branchName", form.branchName),
        checkAvailability("email", form.email),
        checkAvailability("phone", form.phone),
        checkAvailability("username", form.username),
      ]);

      if (Object.values(errors).some(Boolean)) {
        setLoading(false);
        return;
      }

      await onSave(form);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-linear-to-r from-blue-900 to-blue-800 px-6 py-5 sticky top-0 z-10">
          <h3 className="text-2xl font-bold text-white text-center">
            Edit Branch
          </h3>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-blue-900 mb-1.5">
              Branch Name
            </label>
            <input
              type="text"
              value={form.branchName || ""}
              onChange={(e) => handleChange("branchName", e.target.value)}
              onBlur={(e) => handleBlur("branchName", e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                errors.branchName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.branchName && (
              <p className="text-red-600 text-sm mt-1">{errors.branchName}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-blue-900 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={(e) => handleBlur("email", e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-blue-900 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={form.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              onBlur={(e) => handleBlur("phone", e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-blue-900 mb-1.5">
              Address
            </label>
            <input
              type="text"
              value={form.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-blue-900 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={form.username || ""}
              onChange={(e) => handleChange("username", e.target.value)}
              onBlur={(e) => handleBlur("username", e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-blue-900 mb-1.5">
              Password
            </label>
            <input
              type="text"
              value={form.password || ""}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-3 px-6 py-4 bg-white sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-5 py-2.5 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
