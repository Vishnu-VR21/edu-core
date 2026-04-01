import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";

export default function ExcelStaffModal({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${config.baseurl}list_all_branches/`);
      setBranches(res.data);
    } catch {
      toast.error("Failed to load branches");
    }
  };

  const downloadExcel = () => {
    if (!branches.length) {
      toast.error("Branches not loaded yet");
      return;
    }

    const branchNames = branches.map((b) => b.branch_name);
    const roles = ["TEACHER", "PRINCIPAL"];

    const instructionRows = [
      { A: "IMPORTANT INSTRUCTIONS (READ BEFORE FILLING):" },
      { A: "1. All columns marked with * are mandatory." },
      { A: "2. Username must be unique for each staff." },
      { A: "3. Phone numbers must be exactly 10 digits." },
      { A: "4. Email must be unique." },
      { A: `5. Branch Name must be one of: [${branchNames.join(", ")}]` },
      { A: `6. Role must be one of: [${roles.join(", ")}]` },
      { A: "7. Do NOT leave any mandatory field empty." },
      {},
    ];

    const headerRow = {
      "Full Name*": "",
      "Address*": "",
      "Email*": "",
      "Phone Number*": "",
      "Username*": "",
      "Branch Name*": "",
      "Role*": "",
    };

    const ws = XLSX.utils.json_to_sheet(instructionRows, { skipHeader: true });
    XLSX.utils.sheet_add_json(ws, [headerRow], { origin: -1 });

    ws["!cols"] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 25 },
      { wch: 22 },
      { wch: 18 },
      { wch: 28 },
      { wch: 20 },
    ];

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 6 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 6 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 6 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 6 } },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff");
    XLSX.writeFile(wb, "staff_bulk_upload_template.xlsx");
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

      console.log("Rows read from Excel:", rows);

      if (!rows.length) {
        toast.error("No staff data found in Excel");
        setUploading(false);
        return;
      }

      const branchMap = {};
      branches.forEach((b) => (branchMap[b.branch_name.trim()] = b.id));

      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      const payload = [];

      rows.forEach((row, index) => {
        const rowNumber = index + 10; 
        const full_name = row["Full Name*"]
          ? String(row["Full Name*"]).trim()
          : "";
        const address = row["Address*"] ? String(row["Address*"]).trim() : "";
        const email = row["Email*"]
          ? String(row["Email*"]).trim().toLowerCase()
          : "";
        const phone_number = row["Phone Number*"]
          ? String(row["Phone Number*"]).trim()
          : "";
        const username = row["Username*"]
          ? String(row["Username*"]).trim()
          : "";
        const branch_name = row["Branch Name*"]
          ? String(row["Branch Name*"]).trim()
          : "";
        const role = row["Role*"] ? String(row["Role*"]).trim() : "";

        let skipReason = null;

        if (
          !full_name ||
          !address ||
          !email ||
          !phone_number ||
          !username ||
          !branch_name ||
          !role
        ) {
          skipReason = "Missing required fields";
        } else if (!gmailRegex.test(email)) {
          skipReason = `Invalid Gmail address: ${email}`;
        } else if (!/^\d{10}$/.test(phone_number)) {
          skipReason = `Invalid phone number: ${phone_number}`;
        } else if (!branchMap[branch_name]) {
          skipReason = `Branch not found: ${branch_name}`;
        }

        if (skipReason) {
          console.warn(`Skipping row ${rowNumber}: ${skipReason}`);
          return;
        }

        payload.push({
          full_name,
          address,
          email,
          phone_number,
          username,
          role,
          branch: branchMap[branch_name],
        });
      });

      console.log("Payload to send to backend:", payload);

      if (!payload.length) {
        toast.error(
          "No valid staff data found in Excel. Check console for details.",
        );
        setUploading(false);
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${config.baseurl}bulk_add_staffs/`,
        { staff: payload },
        { headers: { Authorization: `Token ${token}` } },
      );

      const { created_count, failed_count, errors } = response.data;

      if (created_count) {
        toast.success(`${created_count} staff uploaded successfully`);
      }
      if (failed_count) {
        toast.error(`${failed_count} staff failed to upload`);
        console.table(errors);
        errors.forEach((err) => {
          toast.error(`Row ${err.row_number}: ${err.error}`);
        });
      }

      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          "Upload failed",
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
            disabled={!branches.length}
            className={`text-sm font-medium underline ${
              branches.length
                ? "text-blue-900"
                : "text-gray-400 cursor-not-allowed"
            }`}
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
