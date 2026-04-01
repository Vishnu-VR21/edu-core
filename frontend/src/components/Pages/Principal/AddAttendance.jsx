import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";

export default function AddAttendance() {
  const [form, setForm] = useState({
    student: "",
    attendance_status: "",
  });

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${config.baseurl}list_all_students/`, {
        params: { branch_id: user.branch_id },
        headers: { Authorization: `Token ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      toast.error("Failed to load students");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Submitting form:", form);
      const token = localStorage.getItem("token");
      await axios.post(`${config.baseurl}add_attendance/`, form, {
        headers: { Authorization: `Token ${token}` },
      });

      toast.success("Attendance added successfully");
      setForm({
        student: "",
        attendance_status: "",
      });
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to add attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[83vh] bg-linear-to-br from-blue-50 to-white flex items-center justify-center py-6 px-4 rounded-2xl">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-3xl font-bold text-blue-900 text-center">
            Add Attendance
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
          <section>
            <h3 className="mb-4 text-base font-semibold text-blue-900">
              Attendance Details
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className="label">Student</label>
                <select
                  name="student"
                  value={form.student}
                  onChange={handleChange}
                  required
                  className="input-modern"
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="label">Attendance Status</label>

                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="attendance_status"
                      value="PRESENT"
                      checked={form.attendance_status === "PRESENT"}
                      onChange={handleChange}
                      required
                    />
                    <span>Present</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="attendance_status"
                      value="ABSENT"
                      checked={form.attendance_status === "ABSENT"}
                      onChange={handleChange}
                      required
                    />
                    <span>Absent</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6 flex flex-col gap-3 md:flex-row md:justify-between">
            <button
              type="reset"
              disabled={loading}
              onClick={() =>
                setForm({
                  student: "",
                  attendance_status: "",
                })
              }
              className="w-full md:w-auto rounded-lg border px-4 py-2.5 text-blue-900 hover:bg-blue-100"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto rounded-lg px-6 py-2.5 font-medium text-white ${
                loading ? "bg-blue-400" : "bg-blue-900 hover:bg-blue-800"
              }`}
            >
              {loading ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .label {
          margin-bottom: 0.25rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
        }

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

        .file-input {
          display: flex;
          align-items: center;
          border: 1px dashed #c7d2fe;
          border-radius: 0.75rem;
          padding: 0.7rem 0.9rem;
          cursor: pointer;
          background: #f8fafc;
          transition: border 0.2s, background 0.2s;
        }

        .file-input:hover {
          border-color: #1e3a8a;
          background: #eff6ff;
        }

        .file-text {
          font-size: 0.9rem;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
