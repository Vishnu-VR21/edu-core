import React, { useState, useMemo } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaSearch, FaSort, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { GoXCircleFill } from "react-icons/go";
import { IoMdTrendingUp } from "react-icons/io";
import { HiUsers } from "react-icons/hi";

export default function StudentAttendance({ attendanceData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'student_name', direction: 'asc' });
  const [expandedStudent, setExpandedStudent] = useState(null);

  const studentAttendanceMap = useMemo(function () {
    const map = {};
    attendanceData.forEach(function (record) {
      if (!map[record.student_id]) {
        map[record.student_id] = {
          student_id: record.student_id,
          student_name: record.student_name,
          branch_name: record.branch_name,
          records: []
        };
      }
      map[record.student_id].records.push(record);
    });
    return map;
  }, [attendanceData]);

  const studentStats = useMemo(function () {
    return Object.values(studentAttendanceMap).map(function (student) {
      const total = student.records.length;
      const present = student.records.filter(r => r.status === 'PRESENT').length;
      const absent = student.records.filter(r => r.status === 'ABSENT').length;
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

      const sortedRecords = [...student.records].sort((a, b) => new Date(b.date) - new Date(a.date));
      const lastStatus = sortedRecords.length > 0 ? sortedRecords[0].status : 'N/A';
      const lastDate = sortedRecords.length > 0 ? sortedRecords[0].date : 'N/A';

      return {
        ...student,
        total,
        present,
        absent,
        percentage: parseFloat(percentage),
        lastStatus,
        lastDate
      };
    });
  }, [studentAttendanceMap]);

  const overallStats = useMemo(function () {
    const totalStudents = studentStats.length;
    const avgAttendance = totalStudents > 0
      ? (studentStats.reduce((sum, s) => sum + s.percentage, 0) / totalStudents).toFixed(1)
      : 0;

    const todayDate = new Date().toISOString().split('T')[0];
    const todayPresent = attendanceData.filter(r =>
      r.date === todayDate && r.status === 'PRESENT'
    ).length;

    return { totalStudents, avgAttendance, todayPresent };
  }, [studentStats, attendanceData]);

  function handleSort(key) {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }

  function toggleExpand(studentId) {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  }

  function getPercentageColor(percentage) {
    if (percentage >= 90) return 'text-green-700 bg-green-100';
    if (percentage >= 75) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  }

  function getStatusColor(status) {
    if (status === 'PRESENT') return 'bg-green-500';
    if (status === 'ABSENT') return 'bg-red-500';
    return 'bg-gray-200';
  }

  function SortIcon({ columnKey }) {
    if (sortConfig.key !== columnKey) return <FaSort className="w-3 h-3 text-gray-400" />;
    return sortConfig.direction === 'asc'
      ? <FaChevronUp className="w-3 h-3 text-blue-600" />
      : <FaChevronDown className="w-3 h-3 text-blue-600" />;
  }

  const filteredAndSortedStudents = useMemo(function () {
    let filtered = studentStats.filter(student =>
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort(function (a, b) {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [studentStats, searchTerm, sortConfig]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border mb-8 border-gray-200 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-blue-900 flex items-center gap-2">
          <FaCalendarAlt className="w-6 h-6" />
          Student Attendance
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <HiUsers className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Total Students</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{overallStats.totalStudents}</p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <IoMdTrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Average Attendance</span>
          </div>
          <p className="text-3xl font-bold text-purple-900">{overallStats.avgAttendance}%</p>
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <FaCheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Present Today</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{overallStats.todayPresent}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search student by name..."
            value={searchTerm}
            onChange={function (e) { setSearchTerm(e.target.value); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('student_name')}
              >
                <div className="flex items-center gap-2">
                  Student Name
                  <FaSort columnKey="student_name" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('present')}
              >
                <div className="flex items-center justify-center gap-2">
                  Present
                  <FaSort columnKey="present" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('absent')}
              >
                <div className="flex items-center justify-center gap-2">
                  Absent
                  <FaSort columnKey="absent" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center justify-center gap-2">
                  Total
                  <FaSort columnKey="total" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('percentage')}
              >
                <div className="flex items-center justify-center gap-2">
                  Percentage
                  <FaSort columnKey="percentage" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Last Status
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedStudents.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              filteredAndSortedStudents.map((student) => (
                
                <React.Fragment key={student.student_id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {student.student_name}
                    </td>
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
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getPercentageColor(student.percentage)}`}>
                        {student.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(student.lastStatus)}`} />
                        <span className="text-xs text-gray-600">
                          {new Date(student.lastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleExpand(student.student_id)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition"
                      >
                        {expandedStudent === student.student_id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  
                  {expandedStudent === student.student_id && (
                    <tr>
                      <td colSpan="7" className="px-4 py-4 bg-gray-50">
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          <h4 className="font-semibold text-gray-800 mb-3">
                            Attendance History - {student.student_name}
                          </h4>
                          {[...student.records]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((record) => (
                              <div
                                key={record.attendance_id}
                                className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                                  record.status === 'PRESENT' 
                                    ? 'bg-green-50 border-green-500' 
                                    : 'bg-red-50 border-red-500'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full ${getStatusColor(record.status)} flex items-center justify-center shrink-0`}>
                                  {record.status === 'PRESENT' ? (
                                    <FaCheckCircle className="w-4 h-4 text-white" />
                                  ) : (
                                    <GoXCircleFill className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800 text-sm">
                                    {new Date(record.date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                  <p className="text-xs text-gray-500">{record.branch_name}</p>
                                </div>
                                
                                <span className={`px-3 py-1 rounded-full font-semibold text-xs ${
                                  record.status === 'PRESENT' 
                                    ? 'bg-green-200 text-green-800' 
                                    : 'bg-red-200 text-red-800'
                                }`}>
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
        Showing {filteredAndSortedStudents.length} of {studentStats.length} students
      </div>
    </div>
  );
}
