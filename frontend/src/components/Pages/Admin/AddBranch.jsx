import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";

export default function AddBranch() {
  const [form, setForm] = useState({
    branch_name: "",
    address: "",
    email: "",
    contact_number: "",
    username: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) return "Invalid Gmail address";
    return "";
  };

  const validatePhone = (phone) => {
    if (!/^\d{10}$/.test(phone))
      return "Phone number must be exactly 10 digits";
    return "";
  };

  const checkAvailability = async (field, value) => {
    if (!value) return;

    if (field === "email" && validateEmail(value)) return;
    if (field === "contact_number" && validatePhone(value)) return;

    try {
      const res = await axios.get(
        `${config.baseurl}branches/check_availability/`,
        {
          params: { [field]: value },
        },
      );

      if (!res.data[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: `${field.replace("_", " ")} already exists`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    } catch (err) {
      console.error(err);
      // silent fail
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") setErrors({ ...errors, email: validateEmail(value) });
    if (name === "contact_number")
      setErrors({ ...errors, contact_number: validatePhone(value) });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    checkAvailability(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(form.email);
    const phoneError = validatePhone(form.contact_number);

    setErrors({ ...errors, email: emailError, contact_number: phoneError });
    if (emailError || phoneError) return;

    await Promise.all([
      checkAvailability("branch_name", form.branch_name),
      checkAvailability("username", form.username),
      checkAvailability("email", form.email),
      checkAvailability("contact_number", form.contact_number),
    ]);

    if (Object.values(errors).some(Boolean)) {
      toast.error("Fix errors before saving");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${config.baseurl}add_new_branch/`, form, {
        headers: { Authorization: `Token ${token}` },
      });

      toast.success("Branch added successfully!");
      setForm({
        branch_name: "",
        address: "",
        email: "",
        contact_number: "",
        username: "",
      });
      setErrors({});
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        Object.keys(data).forEach((key) => {
          setErrors((prev) => ({ ...prev, [key]: data[key][0] }));
          toast.error(data[key][0]);
        });
      } else {
        toast.error("Failed to add branch");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[83vh] bg-linear-to-br from-blue-50 to-white flex items-center justify-center py-6 px-4 rounded-2xl">
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Add Branch
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
            <label className="md:col-span-1 text-gray-700 font-medium">
              Branch Name
            </label>
            <div className="md:col-span-2">
              <input
                name="branch_name"
                value={form.branch_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter branch name"
                className={`w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.branch_name ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.branch_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.branch_name}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
            <label className="md:col-span-1 text-gray-700 font-medium">
              Username
            </label>
            <div className="md:col-span-2">
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter username"
                className={`w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
            <label className="md:col-span-1 text-gray-700 font-medium">
              Email
            </label>
            <div className="md:col-span-2">
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="example@gmail.com"
                className={`w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
            <label className="md:col-span-1 text-gray-700 font-medium">
              Phone Number
            </label>
            <div className="md:col-span-2">
              <input
                name="contact_number"
                value={form.contact_number}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="eg: 0000000000"
                maxLength={10}
                className={`w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contact_number ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.contact_number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contact_number}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <label className="md:col-span-1 text-gray-700 font-medium pt-2 md:pt-0">
              Address
            </label>
            <div className="md:col-span-2">
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter branch address"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="reset"
              onClick={() =>
                setForm({
                  branch_name: "",
                  address: "",
                  email: "",
                  contact_number: "",
                  username: "",
                })
              }
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-900 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
