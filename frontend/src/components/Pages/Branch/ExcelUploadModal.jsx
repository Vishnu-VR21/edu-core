import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";

export default function ExcelUploadModal({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const downloadExcel = () => {
    const instructionRows = [
      {
        A: "IMPORTANT INSTRUCTIONS (READ BEFORE FILLING):",
      },
      {
        A: "1. All columns marked with * are mandatory.",
      },
      {
        A: "2. Date of Joining must be in YYYY-MM-DD format (example: 2026-01-12).",
      },
      {
        A: "3. Student Email and Parent Email can be the same.",
      },
      {
        A: "4. Student Phone and Parent Phone must be different.",
      },
      {
        A: "5. Phone numbers must be exactly 10 digits.",
      },
      {
        A: "6. Username must be unique for each student.",
      },
      {
        A: "7. Do NOT leave any mandatory field empty.",
      },
      {},
    ];

    const headerRow = {
      "Student Name*": "",
      "Address*": "",
      "Student Email*": "",
      "Student Phone*": "",
      "Username*": "",
      "Date of Joining* (YYYY-MM-DD)": "",
      "Parent Name*": "",
      "Parent Email*": "",
      "Parent Phone*": "",
      "Fees*": "",
    };

    const ws = XLSX.utils.json_to_sheet(instructionRows, {
      skipHeader: true,
    });

    XLSX.utils.sheet_add_json(ws, [headerRow], {
      origin: -1,
    });

    ws["!cols"] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 25 },
      { wch: 22 },
      { wch: 18 },
      { wch: 28 },
      { wch: 20 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
    ];

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 9 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 9 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 9 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 9 } },
      { s: { r: 8, c: 0 }, e: { r: 8, c: 9 } },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_bulk_upload_template.xlsx");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel file first");
      return;
    }

    setUploading(true);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", range: 9 });

      if (!rows.length) {
        toast.error("No student data found in Excel");
        return;
      }

      const mappedRows = rows.map((row, index) => {
        let doj = row["Date of Joining* (YYYY-MM-DD)"];
        if (typeof doj === "number") {
          const date = XLSX.SSF.parse_date_code(doj);
          doj = `${date.y}-${String(date.m).padStart(2, "0")}-${String(
            date.d
          ).padStart(2, "0")}`;
        }
        return {
          full_name: row["Student Name*"]?.toString().trim(),
          address: row["Address*"]?.toString().trim(),
          email: row["Student Email*"]?.toString().trim(),
          phone_number: row["Student Phone*"]?.toString().trim(),
          username: row["Username*"]?.toString().trim(),
          date_of_joining: doj,
          parent_name: row["Parent Name*"]?.toString().trim(),
          parent_email: row["Parent Email*"]?.toString().trim(),
          parent_phone: row["Parent Phone*"]?.toString().trim(),
          fees: row["Fees*"],
          row_number: index + 10,
        };
      });

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${config.baseurl}bulk_add_students/`,
        { students: mappedRows },
        { headers: { Authorization: `Token ${token}` } }
      );

      const { created_count, failed_count, errors } = response.data;

      if (created_count) {
        toast.success(`${created_count} students uploaded successfully`);
      }
      if (failed_count) {
        toast.error(`${failed_count} students failed to upload`);
        console.table(errors);
        errors.forEach((err) => {
          toast.error(`Row ${err.row_number}: ${err.error}`);
        });
      }

      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-blue-900">Excel Upload</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-lg"
            aria-label="Close modal"
          >
            <IoClose size={25} />
          </button>
        </div>

        <div className="px-6 py-6 overflow-y-auto flex-1 flex flex-col space-y-6">
          <button
            onClick={downloadExcel}
            className="text-blue-900 font-medium underline text-sm"
          >
            Download Excel Format
          </button>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Select Excel File
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="input-modern"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t px-6 py-4 sticky bottom-0 bg-white z-10 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2.5 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`rounded-lg px-6 py-2.5 font-medium text-white 
              ${
                uploading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-800"
              }
            `}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
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
      `}</style>
      </div>
    </div>
  );
}
