import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";
import { useEffect } from "react";

export default function SingleStaffModal({ onClose }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    address: "",
    email: "",
    phone_number: "",
    username: "",
    branch: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [availability, setAvailability] = useState({
    email: null,
    phone_number: null,
    username: null,
  });

  const [branches, setBranches] = useState([]);

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${config.baseurl}list_all_branches/`);
      setBranches(res.data);
    } catch (err) {
      toast.error("Failed to load branches");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const validate = (name, value) => {
    if (!value || value.trim() === "") {
      return "This field is required";
    }

    if (name.includes("email")) {
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(value)) {
        return "Email must be a valid @gmail.com address";
      }
    }

    if (name.includes("phone")) {
      if (!/^\d{10}$/.test(value)) {
        return "Phone must be exactly 10 digits";
      }
    }

    return "";
  };

  const checkAvailability = async (field, value) => {
    if (validate(field, value)) return;

    try {
      const res = await axios.get(
        `${config.baseurl}staff/check_availability/`,
        { params: { [field]: value } },
      );

      setAvailability((prev) => ({
        ...prev,
        [field]: res.data[field],
      }));

      if (!res.data[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: `${field.replace("_", " ")} already exists`,
        }));
      }
    } catch {
      // silent fail
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: validate(name, value) });
  };

  const validateAll = () => {
    const newErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      const err = validate(key, value);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error("Fix validation errors before submitting");
      return;
    }

    if (
      availability.email === false ||
      availability.phone_number === false ||
      availability.username === false
    ) {
      toast.error("Fix availability errors before submitting");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    const payload = {
      ...form,
    };

    console.log("staff payload", payload);

    try {
      setLoading(true);

      const response = await axios.post(
        `${config.baseurl}add_new_staff/`,
        payload,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      toast.success("Staff added successfully");
      onClose();
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const firstMessage = Array.isArray(data[firstKey])
          ? data[firstKey][0]
          : data[firstKey];

        toast.error(firstMessage);
      } else {
        toast.error("Failed to add staff");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-blue-900">Add Staff</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-lg"
            aria-label="Close modal"
          >
            <IoClose size={25} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 overflow-y-auto"
          style={{ flex: "1 1 auto" }}
        >
          <div className=" space-y-8">
            <section>
              <h3 className="mb- text-lg font-semibold text-blue-900">
                Staff Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label
                    htmlFor="full_name"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    placeholder="Enter name"
                    className="input-modern"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="username"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    className="input-modern"
                    onChange={handleChange}
                    onBlur={(e) =>
                      checkAvailability("username", e.target.value)
                    }
                    required
                  />
                  {errors.username && (
                    <p className="error-text">{errors.username}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="email"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Email-ID
                  </label>
                  <input
                    id="email"
                    name="email"
                    placeholder="Enter email"
                    className="input-modern"
                    onChange={handleChange}
                    onBlur={(e) => checkAvailability("email", e.target.value)}
                    required
                  />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="phone_number"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    placeholder="10-digit phone number"
                    className="input-modern"
                    onChange={handleChange}
                    onBlur={(e) =>
                      checkAvailability("phone_number", e.target.value)
                    }
                    required
                  />
                  {errors.phone_number && (
                    <p className="error-text">{errors.phone_number}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="branch"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    required
                    className="input-modern bg-blue-50 text-blue-900 "
                  >
                    <option value="">Select branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="role"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                    className="input-modern bg-blue-50 text-blue-900"
                  >
                    <option value="">Select role</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="PRINCIPAL">Principal</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="address"
                    className="mb-1 text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <textarea
                    name="address"
                    onChange={handleChange}
                    placeholder="Enter address"
                    rows={3}
                    className="input-modern"
                    required
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 px-6 py-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-2 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-900 px-6 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Staff"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input-modern {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          padding: 0.65rem 0.9rem;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .input-modern:focus {
          outline: none;
          border-color: #1e3a8a;
          box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.15);
        }

        .error-text {
          margin-top: 0.25rem;
          font-size: 0.8rem;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}
