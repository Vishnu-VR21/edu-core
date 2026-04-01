import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";
import EditStudentModal from "./EditStudentModal";
import { useNavigate } from "react-router-dom";

export default function StudentsDetails() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isAdmin = user?.role === "ADMIN";

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [savingId, setSavingId] = useState(null);
  const [allBranches, setAllBranches] = useState([]);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${config.baseurl}list_all_branches/`);
      setAllBranches(res.data);
    } catch (err) {
      toast.error("Failed to load branches");
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${config.baseurl}list_students/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const studentsData = res.data || [];
      setStudents(studentsData);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    if (isAdmin) fetchBranches();
  }, []);

  const filteredStudents = isAdmin
    ? selectedBranch === "ALL"
      ? students
      : students.filter((s) => s.branch_id === selectedBranch)
    : students.filter((s) => s.branch_name === user.branch_name);

  const getBranchIdByName = (name) => {
    const branch = allBranches.find((b) => b.branch_name === name);
    return branch ? branch.id : null;
  };

  const handleSave = async (student) => {
    try {
      setSavingId(student.id);
      const token = localStorage.getItem("token");

      const payload = {
        full_name: student.full_name,
        email: student.email,
        address: student.address,
        phone_number: student.phone_number,
        parent_name: student.parent_name,
        parent_email: student.parent_email,
        parent_phone: student.parent_phone,
      };

      if (isAdmin) {
        const branchId = getBranchIdByName(student.branch_name);
        if (!branchId) {
          toast.error("Invalid branch selected");
          return;
        }
        payload.branch = branchId;
      }

      await axios.put(
        `${config.baseurl}update_student/${student.id}/`,
        payload,
        { headers: { Authorization: `Token ${token}` } },
      );

      toast.success("Student updated");
      return true;
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const firstMessage = Array.isArray(data[firstKey])
          ? data[firstKey][0]
          : data[firstKey];

        toast.error(firstMessage);
      } else {
        toast.error("Update failed");
      }
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student permanently?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${config.baseurl}delete_student/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success("Student deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleBlock = async (student) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${config.baseurl}block_student/${student.id}/`,
        {},
        { headers: { Authorization: `Token ${token}` } },
      );

      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, is_active: !s.is_active } : s,
        ),
      );

      toast.success(
        student.is_active ? "Student blocked" : "Student unblocked",
      );
    } catch {
      toast.error("Action failed");
    }
  };

  const navigate = useNavigate();

  const handleFees = (id) => {
    navigate(`/branch_dashboard/student_fees_details/${id}`);
  };

  return (
    <div className="bg-gray-100 flex justify-center px-0 py-4">
      <div className="w-full max-w-7xl bg-white p-4 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">
          Student Details
        </h1>

        {isAdmin && (
          <div className="mb-4 flex flex-row items-center gap-2">
            <label className="font-medium text-blue-900">Branch:</label>

            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-auto"
            >
              <option value="ALL">All Branches</option>

              {allBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] rounded-lg border border-gray-300">
          <table className="w-full min-w-4xl text-[13px]">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-1 text-center font-semibold">Sl No</th>
                <th className="px-2 py-1 text-center font-semibold">
                  Student Name
                </th>
                <th className="px-2 py-1 text-center font-semibold">
                  Address
                </th>
                <th className="px-2 py-1 text-center font-semibold">Email</th>
                <th className="px-2 py-1 text-center font-semibold">
                  Phone Number
                </th>
                <th className="px-2 py-1 text-center font-semibold">
                  Parent Name
                </th>
                <th className="px-2 py-1 text-center font-semibold">
                  Parent Email
                </th>
                <th className="px-2 py-1 text-center font-semibold">
                  Parent Phone
                </th>
                {isAdmin && (
                  <th className="px-2 py-1 text-center font-semibold">
                    Branch Name
                  </th>
                )}
                <th className="px-2 py-1 text-center font-semibold">
                  Exam Result
                </th>
                <th className="px-2 py-1 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
                >
                  <td className="px-2 py-1 text-center">{index + 1}</td>
                  <td className="px-2 py-1 text-center">{student.full_name}</td>
                  <td className="px-2 py-1 text-center">
                    {student.address}
                  </td>
                  <td className="px-2 py-1 text-center">{student.email}</td>
                  <td className="px-2 py-1 text-center">
                    {student.phone_number}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {student.parent_name}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {student.parent_email}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {student.parent_phone}
                  </td>
                  {isAdmin && (
                    <td className="px-2 py-1 text-center">
                      {student.branch_name}
                    </td>
                  )}
                  <td className="px-2 py-1 text-center">
                    <button
                      onClick={() => setViewingStudent(student)}
                      className="px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View Result
                    </button>
                  </td>
                  <td className="px-2 py-1 text-center flex gap-2 justify-center">
                    <button
                      className="text-purple-600 hover:underline"
                      onClick={() => handleFees(student.id)}
                    >
                      View Fees
                    </button>
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setEditingStudent(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(student.id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`hover:underline ${
                        student.is_active ? "text-yellow-600" : "text-green-600"
                      }`}
                      onClick={() => handleBlock(student)}
                    >
                      {student.is_active ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-4">
                    No Student found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Exam Results – {viewingStudent.full_name}
            </h3>

            {viewingStudent.exams.length === 0 ? (
              <p className="text-gray-500 text-center">
                No exam results available.
              </p>
            ) : (
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 border">Exam</th>
                    <th className="px-3 py-2 border">Score</th>
                    <th className="px-3 py-2 border">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingStudent.exams.map((exam, i) => (
                    <tr key={i} className="text-center">
                      <td className="px-3 py-2 border">{exam.exam_name}</td>
                      <td className="px-3 py-2 border">
                        {exam.percentage ?? "0"}
                      </td>
                      <td
                        className={`px-3 py-2 border font-semibold ${
                          (exam.percentage ?? 0) >= 33
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(exam.percentage ?? 0) >= 33 ? "Pass" : "Fail"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          allBranches={allBranches}
          onClose={() => setEditingStudent(null)}
          onSave={async (updatedStudent) => {
            const success = await handleSave(updatedStudent);
            if (success) {
              await fetchStudents();
              setEditingStudent(null);
            }
          }}
        />
      )}
    </div>
  );
}
