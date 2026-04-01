import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import { MdPriceCheck } from "react-icons/md";
import { FaClockRotateLeft } from "react-icons/fa6";
import axios from "axios";
import config from "../../../utils/config";

export default function PaymentReports() {
  const [allBranches, setAllBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [paidCount, setPaidCount] = useState(null);
  const [unpaidCount, setUnpaidCount] = useState(null);
  const [totalPaidAmount, setTotalPaidAmount] = useState(null);
  const [totalPendingAmount, setTotalPendingAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`${config.baseurl}list_all_branches/`);
        setAllBranches(res.data);
      } catch (err) {
        toast.error("Failed to load branches");
      }
    };
    fetchBranches();
  }, []);

  const handleSearch = async () => {
    if (!selectedBranch || !fromDate || !toDate) {
      toast.error("Please select branch and date range");
      return;
    }
    if (fromDate > toDate) {
      toast.error("From date cannot be after To date");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${config.baseurl}payment_summary_report/`, {
        params: {
          branch_id: selectedBranch,
          from_date: fromDate,
          to_date: toDate,
        },
        headers: { Authorization: `Token ${token}` },
      });

      setPaidCount(res.data.paid_students);
      setTotalPaidAmount(res.data.total_paid_amount);
      setUnpaidCount(res.data.unpaid_students);
      setTotalPendingAmount(res.data.total_pending_amount);
    } catch (err) {
      toast.error("Failed to fetch payment summary");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedBranch("");
    setFromDate("");
    setToDate("");
    setPaidCount(null);
    setUnpaidCount(null);
    setTotalPaidAmount(null);
    setTotalPendingAmount(null);
  };

  return (
    <div className="bg-gray-100 flex justify-center px-0 py-4">
      <div className="w-full max-w-7xl bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">
          Fee Payment Summary
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Branch</option>
              {allBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex justify-center md:justify-start gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
            >
              <FaSearch />
              Search
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              <GrPowerReset />
              Reset
            </button>
          </div>
        </div>

        {paidCount !== null && unpaidCount !== null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-linear-to-br from-slate-50 to-blue-50 rounded-xl border border-blue-100 shadow-sm">
            <div className="bg-white p-5 rounded-lg border-l-4 border-blue-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Paid Students
                </h3>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MdPriceCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800 mb-1">
                {paidCount}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Total Collected
                </p>
                <p className="text-xl font-semibold text-blue-600">
                  ₹{totalPaidAmount?.toLocaleString("en-IN") ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border-l-4 border-blue-300 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Pending Students
                </h3>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <FaClockRotateLeft size={24} className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800 mb-1">
                {unpaidCount}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Amount Pending
                </p>
                <p className="text-xl font-semibold text-slate-700">
                  ₹{totalPendingAmount?.toLocaleString("en-IN") ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
