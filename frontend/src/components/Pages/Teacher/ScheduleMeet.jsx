import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";

export default function ScheduleMeet() {
  const [form, setForm] = useState({
    meet_url: "",
    date: "",
    time: "",
    topic: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateMeetUrl = (url) => {
    const meetRegex = /^https:\/\/meet\.google\.com\/[a-z\-]+$/;
    if (!meetRegex.test(url)) return "Invalid Google Meet URL";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "meet_url") {
      setErrors({ ...errors, meet_url: validateMeetUrl(value) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const meetError = validateMeetUrl(form.meet_url);
    if (meetError) {
      setErrors({ ...errors, meet_url: meetError });
      return;
    }
    console.log("meet data", form);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${config.baseurl}schedules_meet/`, form, {
        headers: { Authorization: `Token ${token}` },
      });

      toast.success("Meeting scheduled successfully");

      setForm({
        meet_url: "",
        date: "",
        time: "",
        topic: "",
        description: "",
      });
      setErrors({});
    } catch {
      toast.error("Failed to schedule meeting");
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMeet = () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  return (
    <div className="min-h-[83vh] bg-linear-to-br from-blue-50 to-white flex items-center justify-center py-6 px-4 rounded-2xl">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-3xl font-bold text-blue-900 text-center">
            Schedule Meeting
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
          <section>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
              <h3 className="mb-4 text-base font-semibold text-blue-900">
                Meeting Details
              </h3>

              <button
                type="button"
                onClick={openGoogleMeet}
                className="w-full md:w-auto rounded-lg px-4 py-2.5 font-medium text-green-600 border border-green-600 bg-green-100 hover:bg-green-200 cursor-pointer"
              >
                Create Google Meet
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="label">Meet URL</label>
                <input
                  name="meet_url"
                  value={form.meet_url}
                  onChange={handleChange}
                  required
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className={`input-modern ${
                    errors.meet_url ? "border-red-500" : ""
                  }`}
                />
                {errors.meet_url && (
                  <p className="text-red-500 text-sm mt-1">{errors.meet_url}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="label">Topic</label>
                <input
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  required
                  placeholder="Enter topic"
                  className="input-modern"
                />
              </div>

              <div className="flex flex-col">
                <label className="label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="input-modern"
                />
              </div>

              <div className="flex flex-col">
                <label className="label">Time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="input-modern"
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  required
                  rows={3}
                  className="input-modern resize-none"
                />
              </div>
            </div>
          </section>

          <div className="pt-6 flex flex-col gap-3 md:flex-row md:justify-between">
            <button
              type="reset"
              disabled={loading}
              onClick={() =>
                setForm({
                  meet_url: "",
                  date: "",
                  time: "",
                  topic: "",
                  description: "",
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
              {loading ? "Scheduling..." : "Schedule Meeting"}
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
