import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";
import { useParams } from "react-router-dom";

export default function ViewStudentFees() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === "ADMIN";

  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const { studentId } = useParams();

  const fetchFees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${config.baseurl}list_student_fees/${studentId}/`,
        { headers: { Authorization: `Token ${token}` } },
      );
      setFees(res.data || []);
      setSelectedIds([]);
    } catch {
      toast.error("Failed to load student fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchFees();
  }, [studentId]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const unpaidIds = fees
      .filter((f) => f.status === "UNPAID")
      .map((f) => f.id);

    if (selectedIds.length === unpaidIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unpaidIds);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Select at least one fee record");
      return;
    }

    if (!window.confirm("Delete selected student fees?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${config.baseurl}delete_student_fees/`,
        { ids: selectedIds },
        { headers: { Authorization: `Token ${token}` } },
      );

      setFees((prev) => prev.filter((f) => !selectedIds.includes(f.id)));
      setSelectedIds([]);
      toast.success("Student fees deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center px-6 py-4">
      <div className="w-full max-w-6xl bg-white p-4 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">
          Student Fees Details
        </h1>

        {isAdmin && (
          <div className="mb-3">
            <button
              onClick={handleDelete}
              disabled={selectedIds.length === 0}
              className={`w-full sm:w-auto px-4 py-2 rounded-md text-white text-sm font-semibold
              ${
                selectedIds.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Delete Selected
            </button>
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] rounded-lg border border-gray-300">
          <table className="w-full min-w-4xl text-[13px]">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                {isAdmin && (
                  <th className="px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={
                        fees.filter((f) => f.status === "UNPAID").length > 0 &&
                        selectedIds.length ===
                          fees.filter((f) => f.status === "UNPAID").length
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th className="px-2 py-1 text-center font-semibold">Sl No</th>
                <th className="px-2 py-1 text-center font-semibold">
                  Student Name
                </th>
                <th className="px-2 py-1 text-center font-semibold">Month</th>
                <th className="px-2 py-1 text-center font-semibold">Fees</th>
                <th className="px-2 py-1 text-center font-semibold">
                  Payment Status
                </th>
                <th className="px-2 py-1 text-center font-semibold">
                  Paid Date
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading && fees.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 8 : 7}
                    className="text-center py-4 text-gray-500"
                  >
                    No Data
                  </td>
                </tr>
              )}
              {fees.map((fee, index) => (
                <tr
                  key={fee.id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
                >
                  {isAdmin && (
                    <td className="px-2 py-1 text-center">
                      {fee.status === "UNPAID" && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(fee.id)}
                          onChange={() => toggleSelect(fee.id)}
                        />
                      )}
                    </td>
                  )}
                  <td className="px-2 py-1 text-center">{index + 1}</td>
                  <td className="px-2 py-1 text-center">{fee.student_name}</td>
                  <td className="px-2 py-1 text-center">
                    {new Date(fee.year, fee.month - 1).toLocaleString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {fee.monthly_amount}
                  </td>
                  <td className="px-2 py-1 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-xl text-white text-xs ${
                        fee.status === "PAID" ? "bg-green-600" : "bg-red-500"
                      }`}
                    >
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-center">
                    {fee.paid_date || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
