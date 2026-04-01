import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";

export default function AddLearningMaterials() {
  const [form, setForm] = useState({
    choice: "",
    topic: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("choice", form.choice);
      formData.append("topic", form.topic);
      formData.append("description", form.description);
      formData.append("file", selectedFile);

      console.log("Submitting form data:", {
        choice: form.choice,
        topic: form.topic,
        description: form.description,
        file: selectedFile,
      });

      await axios.post(`${config.baseurl}add_learning_materials/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Learning Materials added successfully");

      setForm({ choice: "", topic: "", description: "" });
      setSelectedFile(null);
      document.getElementById("fileInput").value = "";
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Failed to add Learning Materials",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[83vh] bg-linear-to-br from-blue-50 to-white flex items-center justify-center py-6 px-4 rounded-2xl">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-3xl font-bold text-blue-900 text-center">
            Add Learning Materials
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
          <section>
            <h3 className="mb-4 text-base font-semibold text-blue-900">
              Learning Materials Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="label">Choice</label>
                <select
                  name="choice"
                  value={form.choice}
                  onChange={handleChange}
                  required
                  className="input-modern bg-blue-50 text-blue-900"
                >
                  <option value="">Select Choice</option>
                  <option value="SYLLABUS">Syllabus</option>
                  <option value="NOTES">Notes</option>
                  <option value="RECORDING">Recordings</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="label">Topic</label>
                <input
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="Enter topic"
                  required
                  className="input-modern"
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="label">File</label>
                <input
                  id="fileInput"
                  type="file"
                  accept="video/*,.pdf,.doc,.docx,.ppt,.pptx"
                  className="input-modern"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  rows={3}
                  required
                  className="input-modern resize-none"
                />
              </div>
            </div>
          </section>

          <div className="pt-6 flex flex-col gap-3 md:flex-row md:justify-between">
            <button
              type="reset"
              disabled={loading}
              onClick={() => {
                setForm({ choice: "", topic: "", description: "" });
                setSelectedFile(null);
                document.getElementById("fileInput").value = "";
              }}
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
              {loading ? "Saving..." : "Save"}
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
