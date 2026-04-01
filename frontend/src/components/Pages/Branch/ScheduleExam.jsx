import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";

export default function ScheduleExam() {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    exam_name: "",
    date: "",
    duration_minutes: "",
    questions_count: "",
    start_time: "",
    excel_file: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const downloadTemplate = () => {
    const instructionRows = [
      { A: "IMPORTANT INSTRUCTIONS (READ BEFORE FILLING):" },
      { A: "1. Enter the correct answer as A, B, C, or D" },
      {
        A: "2. Enter multiple statements in a single cell separated by '###' (e.g., Statement1###Statement2)",
      },
      {},
    ];

    const data = [
      ...instructionRows,
      {
        A: "Question",
        B: "Statements",
        D: "Option A",
        E: "Option B",
        F: "Option C",
        G: "Option D",
        H: "Correct Answer",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "exam_questions_template.xlsx");
  };

  const readExcelFile = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet, { range: 4 });

    return jsonData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.excel_file) {
      toast.error("Excel file is required");
      return;
    }

    try {
      setLoading(true);

      const jsonData = await readExcelFile(form.excel_file);

      if (!jsonData.length) {
        toast.error("No questions found in the Excel file");
        setLoading(false);
        return;
      }

      const questions = jsonData.map((q) => ({
        question: q.Question,
        statements: q.Statements
          ? q.Statements.split("###").map((s) => s.trim())
          : [],
        options: {
          A: q["Option A"],
          B: q["Option B"],
          C: q["Option C"],
          D: q["Option D"],
        },
        correct_answer: q["Correct Answer"],
      }));

      const formCount = parseInt(form.questions_count, 10);

      if (questions.length !== formCount) {
        toast.error(
          `Mismatch: Form specifies ${formCount} questions, but Excel contains ${questions.length} questions. Exam will not be saved.`
        );
        setLoading(false);
        return;
      }

      const payload = {
        exam_name: form.exam_name,
        date: form.date,
        start_time: form.start_time,
        duration_minutes: parseInt(form.duration_minutes, 10),
        questions_count: formCount,
        questions: questions,
      };

      console.log("Payload going to backend:", payload);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing. Please login again.");
        setLoading(false);
        return;
      }

      await axios.post(`${config.baseurl}schedule_exam/`, payload, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Exam Scheduled successfully");

      setForm({
        exam_name: "",
        date: "",
        duration_minutes: "",
        questions_count: "",
        start_time: "",
        excel_file: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to schedule exam";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[83vh] bg-linear-to-br from-blue-50 to-white flex items-center justify-center py-6 px-4 rounded-2xl">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className=" px-6 py-4">
          <h1 className="text-3xl font-bold text-blue-900 text-center">
            Schedule Exam
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
          <section>
            <h3 className="mb-4 text-base font-semibold text-blue-900">
              Exam Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="label">Exam Name</label>
                <input
                  name="exam_name"
                  value={form.exam_name}
                  className="input-modern"
                  placeholder="Enter exam name"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="label">Exam Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  className="input-modern"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="label">Duration</label>
                <input
                  type="number"
                  value={form.duration_minutes}
                  name="duration_minutes"
                  placeholder="Duration in minutes"
                  min="1"
                  className="input-modern"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="label">Number of Questions</label>
                <input
                  type="number"
                  name="questions_count"
                  value={form.questions_count}
                  placeholder="no of questions"
                  className="input-modern"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="label">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  className="input-modern"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="label">Upload Questions (Excel)</label>

                <label className="file-input">
                  <span className="file-text">
                    {form.excel_file
                      ? form.excel_file.name
                      : "Choose Excel file (.xlsx)"}
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    name="excel_file"
                    accept=".xlsx,.xls"
                    onChange={handleChange}
                    hidden
                    required
                  />
                </label>
              </div>
            </div>
          </section>

          <div className="pt-6 flex flex-col gap-3 md:flex-row md:justify-between">
            <button
              type="button"
              onClick={downloadTemplate}
              className="w-full md:w-auto rounded-lg border px-4 py-2.5 text-blue-900 hover:bg-blue-100 hover:cursor-pointer"
            >
              Download Excel Template
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto rounded-lg px-6 py-2.5 font-medium text-white hover:cursor-pointer ${
                loading ? "bg-blue-400" : "bg-blue-900 hover:bg-blue-800"
              }`}
            >
              {loading && (
                <svg
                  className="mr-2 h-5 w-5 inline-block animate-spin text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {loading ? "Scheduling..." : "Schedule Exam"}
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
