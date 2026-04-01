import React, { useState, useMemo } from 'react';
import { FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { GoXCircleFill } from "react-icons/go";
import { IoMdTrendingUp } from "react-icons/io";

export default function AttendanceSection({ attendance }) {
  const [filter, setFilter] = useState('all');
  const [searchDate, setSearchDate] = useState('');

  const stats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const absent = attendance.filter(a => a.status === 'ABSENT').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, percentage };
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    return attendance
      .filter(record =>
        (filter === 'all' || record.status === filter.toUpperCase()) &&
        (!searchDate || record.date.includes(searchDate))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendance, filter, searchDate]);

  const getStatusColor = status => {
    switch(status) {
      case 'PRESENT': return 'bg-green-500';
      case 'ABSENT': return 'bg-red-500';
      default: return 'bg-gray-200';
    }
  };

  const renderCard = (title, value, icon, textColor, bgColor, borderColor) => (
    <div className={`${bgColor} rounded-lg p-4 border ${borderColor}`}>
      <div className={`flex items-center gap-2 mb-1 ${textColor}`}>
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border mb-8 border-gray-200 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-blue-900 flex items-center gap-2">
          <FaCalendarAlt className="w-6 h-6" />
          Attendance
        </h2>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {renderCard(
          'Present',
          stats.present,
          <FaCheckCircle className="w-4 h-4 text-green-600" />,
          'text-green-700',
          'bg-green-50',
          'border-green-200'
        )}
        {renderCard(
          'Absent',
          stats.absent,
          <GoXCircleFill className="w-4 h-4 text-red-600" />,
          'text-red-700',
          'bg-red-50',
          'border-red-200'
        )}
        {renderCard(
          'Total',
          stats.total,
          <FaCalendarAlt className="w-4 h-4 text-blue-600" />,
          'text-blue-700',
          'bg-blue-50',
          'border-blue-200'
        )}
        {renderCard(
          'Rate',
          `${stats.percentage}%`,
          <IoMdTrendingUp className="w-4 h-4 text-purple-600" />,
          'text-purple-700',
          'bg-purple-50',
          'border-purple-200'
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('present')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'present'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setFilter('absent')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'absent'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Absent
          </button>
        </div>
        <input
          type="date"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Filter by date"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredAttendance.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No attendance records found</p>
        ) : (
          filteredAttendance.map(record => (
            <div
              key={record.attendance_id}
              className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                record.status === 'PRESENT'
                  ? 'bg-green-50 border-green-500 hover:bg-green-100'
                  : 'bg-red-50 border-red-500 hover:bg-red-100'
              } transition`}
            >
              <div className={`w-10 h-10 rounded-full ${getStatusColor(record.status)} flex items-center justify-center shrink-0`}>
                {record.status === 'PRESENT' ? (
                  <FaCheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <GoXCircleFill className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">{"Branch : "}{record.branch_name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full font-semibold text-xs ${
                record.status === 'PRESENT'
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              }`}>
                {record.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
