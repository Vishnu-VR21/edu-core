import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../../../utils/config";
import { useRef } from "react";

export default function EditStaffModal({
  staff,
  allBranches,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({ ...staff });
  const [errors, setErrors] = useState({});
  const originalRef = useRef({
    email: staff.email,
    phone_number: staff.phone_number,
  });

  useEffect(() => {
    setForm({ ...staff });
    setErrors({});
  }, [staff]);

  const validateFormat = (field, value) => {
    if (!value || value.trim() === "") return "This field is required";

    if (field === "email") {
      if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value)) {
        return "Email must be a valid @gmail.com address";
      }
    }

    if (field === "phone_number") {
      if (!/^\d{10}$/.test(value)) {
        return "Phone must be exactly 10 digits";
      }
    }

    return "";
  };

  const checkAvailability = async (field, value) => {
    const formatError = validateFormat(field, value);
    if (formatError) return formatError;

    if (value === originalRef.current[field]) return "";

    try {
      const res = await axios.get(
        `${config.baseurl}staff/check_availability/`,
        { params: { [field]: value } },
      );

      if (!res.data[field]) {
        return `${field.replace("_", " ")} already exists`;
      }

      return "";
    } catch {
      return "Availability check failed";
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    const formatError = validateFormat(field, value);

    setErrors((prev) => ({
      ...prev,
      [field]: formatError,
    }));
  };

  const handleSaveClick = async () => {
    const emailError = await checkAvailability("email", form.email);
    const phoneError = await checkAvailability(
      "phone_number",
      form.phone_number,
    );

    const newErrors = {
      email: emailError,
      phone_number: phoneError,
    };

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (emailError || phoneError) {
      toast.error("Fix validation errors before saving");
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-linear-to-r from-blue-900 to-blue-800 px-6 py-5 shrink-0">
          <h3 className="text-2xl font-bold text-white text-center">
            Edit Staff
          </h3>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={(e) => {
                  if (e.target.value !== originalRef.current.email) {
                    checkAvailability("email", e.target.value).then((err) =>
                      setErrors((p) => ({ ...p, email: err })),
                    );
                  }
                }}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={form.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                onBlur={(e) => {
                  if (e.target.value !== originalRef.current.phone_number) {
                    checkAvailability("phone_number", e.target.value).then(
                      (err) => setErrors((p) => ({ ...p, phone_number: err })),
                    );
                  }
                }}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  errors.phone_number ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone_number && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.phone_number}
                </p>
              )}
            </div>

            {allBranches.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                  Branch
                </label>
                <select
                  value={form.branch_name}
                  onChange={(e) => handleChange("branch_name", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  {allBranches.map((b) => (
                    <option key={b.id} value={b.branch_name}>
                      {b.branch_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-5 py-2.5 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
