import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../../../utils/config";
import { useRef } from "react";

export default function EditStudentModal({
  student,
  allBranches,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({ ...student });
  const [errors, setErrors] = useState({});
  const originalRef = useRef({
    email: student.email,
    phone_number: student.phone_number,
    parent_email: student.parent_email,
    parent_phone: student.parent_phone,
  });

  useEffect(() => {
    setForm({ ...student });
    setErrors({});
  }, [student]);

  const validateFormat = (field, value) => {
    if (!value || value.trim() === "") return "This field is required";

    if (field === "email" || field === "parent_email") {
      if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value)) {
        return "Email must be a valid @gmail.com address";
      }
    }

    if (field === "phone_number" || field === "parent_phone") {
      if (!/^\d{10}$/.test(value)) {
        return "Phone must be exactly 10 digits";
      }
    }

    if (field === "parent_phone" && value === form.phone_number) {
      return "Parent & student phone must be different";
    }

    return "";
  };

  const checkAvailability = async (field, value) => {
    if (value === originalRef.current[field]) return;

    const formatError = validateFormat(field, value);
    if (formatError) return;

    try {
      const apiField =
        field === "parent_email"
          ? "email"
          : field === "parent_phone"
            ? "phone_number"
            : field;

      const res = await axios.get(
        `${config.baseurl}students/check_availability/`,
        {
          params: { [apiField]: value, exclude_student_id: student.id },
        },
      );

      if (!res.data[apiField]) {
        setErrors((prev) => ({
          ...prev,
          [field]: `${field.replace("_", " ")} already exists`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    } catch {
      // silent fail
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
    await checkAvailability("email", form.email);
    await checkAvailability("phone_number", form.phone_number);
    await checkAvailability("parent_email", form.parent_email);
    await checkAvailability("parent_phone", form.parent_phone);

    if (Object.values(errors).some(Boolean)) {
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
            Edit Student
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
                onBlur={(e) => checkAvailability("email", e.target.value)}
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
                onBlur={(e) =>
                  checkAvailability("phone_number", e.target.value)
                }
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

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                Parent Name
              </label>
              <input
                type="text"
                value={form.parent_name}
                onChange={(e) => handleChange("parent_name", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  errors.parent_name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.parent_name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.parent_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                Parent Email
              </label>
              <input
                type="email"
                value={form.parent_email}
                onChange={(e) => handleChange("parent_email", e.target.value)}
                onBlur={(e) =>
                  checkAvailability("parent_email", e.target.value)
                }
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  errors.parent_email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.parent_email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.parent_email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                Parent Phone
              </label>
              <input
                type="text"
                value={form.parent_phone}
                onChange={(e) => handleChange("parent_phone", e.target.value)}
                onBlur={(e) =>
                  checkAvailability("parent_phone", e.target.value)
                }
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  errors.parent_phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.parent_phone && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.parent_phone}
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
