import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../../../utils/config";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaSearch,
  FaSort,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
} from "react-icons/fa";
import { GoXCircleFill } from "react-icons/go";
import { IoMdTrendingUp } from "react-icons/io";
import { HiUsers } from "react-icons/hi";
import { MdWarning } from "react-icons/md";

export default function AttendanceDetails() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "student_name",
    direction: "asc",
  });
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";
  const userBranchId = user.branch_id;

  useEffect(function () {
    if (isAdmin) {
      fetchDataAdmin();
    } else {
      fetchAttendanceOnly();
    }
  }, []);

  const fetchDataAdmin = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAttendance(), fetchBranches()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceOnly = async () => {
    setLoading(true);
    try {
      await fetchBranchAttendance();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${config.baseurl}list_all_attendance/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setAttendanceData(res.data);
    } catch (err) {
      toast.error("Failed to load attendance");
      console.error(err);
    }
  };

  const fetchBranchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${config.baseurl}list_all_attendance/`, {
        headers: { Authorization: `Token ${token}` },
      });
      let data = res.data;
      data = data.filter((record) => record.branch_id === userBranchId);
      setAttendanceData(data);
    } catch (err) {
      toast.error("Failed to load attendance");
      console.error(err);
    }
  };

  console.log("attendance", attendanceData);

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${config.baseurl}list_all_branches/`);
      setAllBranches(res.data);
    } catch (err) {
      toast.error("Failed to load branches");
      console.error(err);
    }
  };

  console.log("branches", allBranches);
  console.log("attendance", attendanceData);

  const studentAttendanceMap = useMemo(
    function () {
      const map = {};
      attendanceData.forEach(function (record) {
        if (!map[record.student_id]) {
          map[record.student_id] = {
            student_id: record.student_id,
            student_name: record.student_name,
            branch_id: record.branch_id,
            branch_name: record.branch_name,
            records: [],
          };
        }
        map[record.student_id].records.push(record);
      });
      return map;
    },
    [attendanceData],
  );

  const studentStats = useMemo(
    function () {
      return Object.values(studentAttendanceMap).map(function (student) {
        const total = student.records.length;
        const present = student.records.filter(function (r) {
          return r.status === "PRESENT";
        }).length;
        const absent = student.records.filter(function (r) {
          return r.status === "ABSENT";
        }).length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        const sortedRecords = [...student.records].sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        });
        const lastStatus =
          sortedRecords.length > 0 ? sortedRecords[0].status : "N/A";
        const lastDate =
          sortedRecords.length > 0 ? sortedRecords[0].date : "N/A";

        let statusBadge = "Good";
        if (percentage < 70) statusBadge = "Critical";
        else if (percentage < 85) statusBadge = "Warning";

        return {
          ...student,
          total: total,
          present: present,
          absent: absent,
          percentage: parseFloat(percentage),
          lastStatus: lastStatus,
          lastDate: lastDate,
          statusBadge: statusBadge,
        };
      });
    },
    [studentAttendanceMap],
  );

  const filteredStudents = useMemo(
    function () {
      var filtered = studentStats;
      if (selectedBranch !== "all") {
        filtered = filtered.filter(function (student) {
          return student.branch_id === selectedBranch;
        });
      }
      if (searchTerm) {
        filtered = filtered.filter(function (student) {
          return student.student_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        });
      }
      return filtered;
    },
    [studentStats, selectedBranch, searchTerm],
  );

  const sortedStudents = useMemo(
    function () {
      var sorted = [...filteredStudents];
      sorted.sort(function (a, b) {
        var aVal = a[sortConfig.key];
        var bVal = b[sortConfig.key];

        if (typeof aVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      });
      return sorted;
    },
    [filteredStudents, sortConfig],
  );

  const overallStats = useMemo(
    function () {
      const totalStudents = filteredStudents.length;
      const avgAttendance =
        totalStudents > 0
          ? (
              filteredStudents.reduce(function (sum, s) {
                return sum + s.percentage;
              }, 0) / totalStudents
            ).toFixed(1)
          : 0;

      const criticalCount = filteredStudents.filter(function (s) {
        return s.statusBadge === "Critical";
      }).length;
      const warningCount = filteredStudents.filter(function (s) {
        return s.statusBadge === "Warning";
      }).length;
      const goodCount = filteredStudents.filter(function (s) {
        return s.statusBadge === "Good";
      }).length;

      return {
        totalStudents,
        avgAttendance,
        criticalCount,
        warningCount,
        goodCount,
      };
    },
    [filteredStudents],
  );

  function handleSort(key) {
    setSortConfig(function (prev) {
      return {
        key: key,
        direction:
          prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      };
    });
  }

  function toggleExpand(studentId) {
    setExpandedStudent(function (prev) {
      return prev === studentId ? null : studentId;
    });
  }

  function getStatusBadgeStyle(badge) {
    switch (badge) {
      case "Good":
        return "bg-green-100 text-green-800 border-green-300";
      case "Warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Critical":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }

  function getPercentageColor(percentage) {
    if (percentage >= 85) return "text-green-700 bg-green-100";
    if (percentage >= 70) return "text-yellow-700 bg-yellow-100";
    return "text-red-700 bg-red-100";
  }

  function getStatusColor(status) {
    if (status === "PRESENT") return "bg-green-500";
    if (status === "ABSENT") return "bg-red-500";
    return "bg-gray-200";
  }

  function SortIcon(props) {
    if (sortConfig.key !== props.columnKey)
      return <FaSort className="w-3 h-3 text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <FaChevronUp className="w-3 h-3 text-blue-600" />
    ) : (
      <FaChevronDown className="w-3 h-3 text-blue-600" />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
            <FaCalendarAlt className="w-8 h-8" />
            Attendance Details
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <HiUsers className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Total Students
              </span>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {overallStats.totalStudents}
            </p>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <IoMdTrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Average Attendance
              </span>
            </div>
            <p className="text-3xl font-bold text-purple-900">
              {overallStats.avgAttendance}%
            </p>
          </div>

          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Good Attendance
              </span>
            </div>
            <p className="text-3xl font-bold text-green-900">
              {overallStats.goodCount}
            </p>
          </div>

          <div className="bg-linear-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <MdWarning className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                Critical / Warning
              </span>
            </div>
            <p className="text-3xl font-bold text-red-900">
              {overallStats.criticalCount} / {overallStats.warningCount}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
          {isAdmin && (
            <div className="w-full md:flex-1">

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Branches</option>
                {allBranches.map((branch) => (
                  <option key={branch.branch_id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="w-full md:flex-1">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Student
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("student_name")}
                >
                  <div className="flex items-center gap-2">
                    Student Name
                    <SortIcon columnKey="student_name" />
                  </div>
                </th>

                {isAdmin && (
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("branch_name")}
                  >
                    <div className="flex items-center gap-2">
                      Branch
                      <SortIcon columnKey="branch_name" />
                    </div>
                  </th>
                )}

                <th
                  className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("present")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Present
                    <SortIcon columnKey="present" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("absent")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Absent
                    <SortIcon columnKey="absent" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("total")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Total
                    <SortIcon columnKey="total" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("percentage")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Percentage
                    <SortIcon columnKey="percentage" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? "8" : "7"}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student) => (
                  <React.Fragment key={student.student_id}>
                    <tr className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {student.student_name}
                      </td>

                      {isAdmin && (
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {student.branch_name}
                        </td>
                      )}

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          <FaCheckCircle className="w-3 h-3" />
                          {student.present}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          <GoXCircleFill className="w-3 h-3" />
                          {student.absent}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                        {student.total}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getPercentageColor(student.percentage)}`}
                        >
                          {student.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(student.statusBadge)}`}
                        >
                          {student.statusBadge}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleExpand(student.student_id)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition"
                        >
                          {expandedStudent === student.student_id
                            ? "Hide"
                            : "View Details"}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row - Detailed Timeline */}
                    {expandedStudent === student.student_id && (
                      <tr>
                        <td
                          colSpan={isAdmin ? "8" : "7"}
                          className="px-4 py-4 bg-gray-50"
                        >
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Attendance History - {student.student_name}
                            </h4>
                            {[...student.records]
                              .sort(
                                (a, b) => new Date(b.date) - new Date(a.date),
                              )
                              .map((record) => (
                                <div
                                  key={record.attendance_id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                                    record.status === "PRESENT"
                                      ? "bg-green-50 border-green-500"
                                      : "bg-red-50 border-red-500"
                                  }`}
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full ${getStatusColor(record.status)} flex items-center justify-center shrink-0`}
                                  >
                                    {record.status === "PRESENT" ? (
                                      <FaCheckCircle className="w-4 h-4 text-white" />
                                    ) : (
                                      <GoXCircleFill className="w-4 h-4 text-white" />
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-sm">
                                      {new Date(record.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          weekday: "short",
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        },
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {record.branch_name}
                                    </p>
                                  </div>

                                  <span
                                    className={`px-3 py-1 rounded-full font-semibold text-xs ${
                                      record.status === "PRESENT"
                                        ? "bg-green-200 text-green-800"
                                        : "bg-red-200 text-red-800"
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {sortedStudents.length} of {studentStats.length} students
        </div>
      </div>
    </div>
  );
}
