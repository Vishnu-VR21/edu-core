import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../../../utils/config";

export default function StudentsApproval({refreshPendingCount}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ dateOfJoin: "", fees: "" });
  const [currentStudentId, setCurrentStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${config.baseurl}list_pending_students_approval/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setStudents(res.data);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (studentId) => {
    setCurrentStudentId(studentId);
    setForm({ dateOfJoin: "", fees: "" });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleApproval = async () => {
    if (!form.dateOfJoin || !form.fees) return;

    if (!window.confirm("Are you sure you want to approve this student?"))
      return;

    try {
      setApproving(true);

      const token = localStorage.getItem("token");

      await axios.post(
        `${config.baseurl}approve_student/${currentStudentId}/`,
        {
          date_of_joining: form.dateOfJoin,
          fees: form.fees,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      toast.success("Student approved successfully");
      setModalOpen(false);
      setCurrentStudentId(null);
      fetchStudents();
      refreshPendingCount();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve student");
    }
  };

  const handleRejectClick = async (studentId) => {
    if (!window.confirm("Are you sure you want to reject this student?"))
      return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${config.baseurl}reject_student/${studentId}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      toast.success("Student rejected");
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject student");
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center px-6 py-4">
      <div className="w-full max-w-6xl bg-white p-4 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">
          Student Approval
        </h1>

        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="w-full min-w-4xl text-[13px]">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-2 py-1 text-center font-semibold">Sl No</th>
                <th className="px-2 py-1 text-center font-semibold">Student Name</th>
                <th className="px-2 py-1 text-center font-semibold">Address</th>
                <th className="px-2 py-1 text-center font-semibold">Email</th>
                <th className="px-2 py-1 text-center font-semibold">Phone Number</th>
                <th className="px-2 py-1 text-center font-semibold">Branch Name</th>
                <th className="px-2 py-1 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td className="px-2 py-1 text-center">{index + 1}</td>
                  <td className="px-2 py-1 text-center">{student.full_name}</td>
                  <td className="px-2 py-1 text-center">
                    {student.address || "-"}
                  </td>
                  <td className="px-2 py-1 text-center">{student.email}</td>
                  <td className="px-2 py-1 text-center">
                    {student.phone_number}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {student.branch_name}
                  </td>
                  <td className="px-2 py-1 text-center flex gap-2 justify-center">
                    <button
                      className="px-2 py-0.5 text-green-600 hover:underline"
                      onClick={() => handleApproveClick(student.id)}
                    >
                      Approve
                    </button>

                    <button
                      className="px-2 py-0.5text-red-600 hover:underline"
                      onClick={() => handleRejectClick(student.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Approve Student
              </h3>

              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">
                  Date of Join
                </label>
                <input
                  type="date"
                  name="dateOfJoin"
                  value={form.dateOfJoin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">
                  Fees
                </label>
                <input
                  type="number"
                  name="fees"
                  value={form.fees}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  onClick={() => setModalOpen(false)}
                  disabled={approving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={approving || !form.dateOfJoin || !form.fees}
                  onClick={handleApproval}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white
                  ${
                    approving
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {approving && (
                    <svg
                      className="mr-2 h-5 w-5 animate-spin text-white"
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

                  {approving ? "Saving ..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
