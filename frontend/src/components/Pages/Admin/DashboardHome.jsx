import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../../utils/config";
import { toast } from "react-toastify";
import TimetableRequestModal from "../Teacher/TimetableRequestModal";
import AttendanceSection from "../Student/AttendanceSection";
import StudentAttendance from "../Principal/StudentAttendance";

export default function DashboardHome() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isAdmin = user?.role === "ADMIN";
  const isBranch = user?.role === "BRANCH";
  const isStudent = user?.role === "STUDENT";
  const isTeacher = user?.role === "TEACHER";
  const isPrincipal = user?.role === "PRINCIPAL";
  const isParent = user?.role === "PARENT";

  const canViewMeetings =
    isAdmin || isBranch || isStudent || isTeacher || isPrincipal;

  const [meetings, setMeetings] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [loadingTimetables, setLoadingTimetables] = useState(false);

  const token = localStorage.getItem("token");

  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    if (!canViewMeetings) return;

    const fetchMeetings = async () => {
      try {
        setLoadingMeetings(true);
        const res = await axios.get(
          `${config.baseurl}list_upcoming_meetings/`,
          { headers: { Authorization: `Token ${token}` } },
        );
        setMeetings(res.data);
      } catch (err) {
        console.error("Failed to load meetings", err);
      } finally {
        setLoadingMeetings(false);
      }
    };

    fetchMeetings();
  }, [canViewMeetings, token]);

  const fetchPrincipalTimetables = async () => {
    try {
      setLoadingTimetables(true);
      const res = await axios.get(`${config.baseurl}principal/timetables/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setTimetables(res.data);
    } catch (err) {
      console.error("Failed to load timetables", err);
    } finally {
      setLoadingTimetables(false);
    }
  };
  useEffect(() => {
    if (!isPrincipal) return;

    fetchPrincipalTimetables();
  }, [isPrincipal, token]);

  useEffect(() => {
    if (!isTeacher) return;

    const fetchTimetables = async () => {
      try {
        setLoadingTimetables(true);
        const res = await axios.get(`${config.baseurl}teacher/timetables/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setTimetables(res.data);
      } catch (err) {
        console.error("Failed to load timetables", err);
      } finally {
        setLoadingTimetables(false);
      }
    };

    fetchTimetables();
  }, [isTeacher, token]);

  useEffect(() => {
    if (!isStudent) return;

    const fetchMaterial = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${config.baseurl}list_all_materials/`, {
          params: { branch_id: user.branch_id },
          headers: { Authorization: `Token ${token}` },
        });
        setMaterials(res.data);
      } catch (err) {
        toast.error("Failed to load materials");
        console.error(err);
      }
    };

    fetchMaterial();
  }, [isStudent, user.branch_id, token]);

  useEffect(() => {
    if (!isStudent && !isParent && !isTeacher && !isPrincipal) return;

    const loadAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${config.baseurl}list_attendance/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setAttendance(res.data);
      } catch (err) {
        toast.error("Failed to load attendance");
        console.error(err);
      }
    };

    loadAttendance();
  }, [isStudent, isParent, isTeacher, isPrincipal]);

  console.log("Attendance Data:", attendance);

  const [monthlyPayment, setMonthlyPayment] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const studentId = user?.student_id;

  useEffect(() => {
    if (!studentId) return;

    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const response = await axios.get(
          `${config.baseurl}get_current_month_payments/${studentId}/`,
          {
            headers: { Authorization: `Token ${token}` },
          },
        );

        setMonthlyPayment(response.data);
      } catch (err) {
        console.error("Error fetching monthly payment:", err);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPayments();
  }, [studentId]);

  const [childMark, setChildMark] = useState([]);
  const [loadingChildMark, setLoadingChildMark] = useState(false);

  useEffect(() => {
    if (!isParent || !studentId) return;

    const fetchChildMark = async () => {
      setLoadingChildMark(true);
      try {
        const response = await axios.get(
          `${config.baseurl}get_student_exams/${studentId}/`,
          { headers: { Authorization: `Token ${token}` } },
        );
        setChildMark(response.data);
      } catch (err) {
        console.error("Error fetching child mark:", err);
      } finally {
        setLoadingChildMark(false);
      }
    };

    fetchChildMark();
  }, [studentId, isParent]);

  console.log("Child Mark:", childMark);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const canJoinMeeting = (meeting) => {
    const now = new Date();
    const meetingDate = new Date(meeting.date);
    const [hours, minutes] = meeting.time.split(":");
    meetingDate.setHours(hours, minutes, 0, 0);

    return now >= meetingDate;
  };

  const openPrincipalRequestModal = (timetableId) => {
    const timetable = timetables.find((t) => t.id === timetableId);
    if (!timetable || !timetable.pending_request) return;

    setSelectedTimetable(timetable);
    setSelectedRequest(timetable.pending_request);
    setModalMode("VIEW");
    setRequestModalVisible(true);
  };

  const openTeacherRequestModal = (timetableId) => {
    const timetable = timetables.find((t) => t.id === timetableId);
    if (!timetable) return;

    if (timetable.teacher_request?.status === "PENDING") {
      toast.info("Request already pending");
      return;
    }

    setSelectedTimetable(timetable);
    setSelectedRequest(null);
    setModalMode("CREATE");
    setRequestModalVisible(true);
  };

  const closeRequestModal = () => {
    setSelectedRequest(null);
    setRequestModalVisible(false);
  };

  const handleApprove = async (requestId) => {
    try {
      console.log("Approving request", requestId);
      await axios.post(
        `${config.baseurl}approve_request/${requestId}/`,
        {},
        { headers: { Authorization: `Token ${token}` } },
      );
      toast.success("Request approved");
      setRequestModalVisible(false);
      fetchPrincipalTimetables();
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId) => {
    console.log("reject request", requestId);
    try {
      await axios.delete(`${config.baseurl}reject_request/${requestId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Request rejected");
      setRequestModalVisible(false);
      fetchPrincipalTimetables();
    } catch {
      toast.error("Failed to reject request");
    }
  };

  const handleCreateRequest = async (payload) => {
    try {
      console.log("Submitting request", payload);
      await axios.post(
        `${config.baseurl}create_timetable_change_request/`,
        payload,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      toast.success("Request submitted");
      setRequestModalVisible(false);
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "object") {
          const messages = Object.values(data).flat().join("\n");
          toast.error(messages);
        } else {
          toast.error(data.message || "Failed to submit request");
        }
      } else {
        toast.error("Failed to submit request");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this timetable?"))
      return;

    try {
      console.log("delete request", id);
      await axios.delete(`${config.baseurl}delete_timetable/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setTimetables((prev) => prev.filter((t) => t.id !== id));
      toast.success("Timetable deleted successfully");
      fetchPrincipalTimetables();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete timetable");
    }
  };

  return (
    <div className="min-h-[83vh] bg-linear-to-br from-blue-50 to-white py-6 px-4 rounded-2xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Welcome Back!</h1>
        <p className="text-gray-700 text-lg">Dashboard overview</p>
      </div>

      {(isStudent || isParent) && <AttendanceSection attendance={attendance} />}

      {(isTeacher || isPrincipal) && (
        <StudentAttendance attendanceData={attendance} />
      )}

      {(isStudent || isParent) && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Monthly Payments
          </h2>

          {loadingPayments ? (
            <p className="text-gray-600">Loading payments...</p>
          ) : monthlyPayment.length === 0 ? (
            <p className="text-gray-600">No Monthly payment scheduled.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-4xl border border-gray-200 text-md">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-2 py-1 text-center">Month</th>
                    <th className="px-2 py-1 text-center">Amount</th>
                    <th className="px-2 py-1 text-center">Status</th>
                    <th className="px-2 py-1 text-center">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyPayment.map((payment, index) => {
                    const monthNames = [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ];

                    return (
                      <tr
                        key={payment.id}
                        className={
                          index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                        }
                      >
                        <td className="px-2 py-1 text-center font-semibold">
                          {monthNames[payment.month - 1]} {payment.year}
                        </td>
                        <td className="px-2 py-1 text-center font-semibold">
                          ₹{Number(payment.monthly_amount).toFixed(2)}
                        </td>
                        <td className="px-2 py-1 text-center">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                              payment.status === "UNPAID"
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-green-100 text-green-800 border border-green-300"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-center font-semibold">
                          {payment.paid_date ? (
                            new Date(payment.paid_date).toLocaleDateString(
                              "en-GB",
                            ) 
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isParent && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Exam Results
          </h2>

          {loadingChildMark ? (
            <p className="text-gray-600">Loading results...</p>
          ) : childMark.length === 0 ? (
            <p className="text-gray-600">No result found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-4xl border border-gray-200 text-md">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-2 py-1 text-center">Exam</th>
                    <th className="px-2 py-1 text-center">Date</th>
                    <th className="px-2 py-1 text-center">Score</th>
                    <th className="px-2 py-1 text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {childMark.map((exam, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
                    >
                      <td className="px-2 py-1 text-center">
                        {exam.exam_name}
                      </td>
                      <td className="px-2 py-1 text-center">
                        {exam.exam_date}
                      </td>
                      <td className="px-2 py-1 text-center">
                        {exam.percentage ?? "0"}
                      </td>
                      <td
                        className={`px-2 py-1 text-center font-semibold ${
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
            </div>
          )}
        </div>
      )}

      {canViewMeetings && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Scheduled Meetings
          </h2>

          {loadingMeetings ? (
            <p className="text-gray-600">Loading meetings...</p>
          ) : meetings.length === 0 ? (
            <p className="text-gray-600">No upcoming meetings.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-4xl border border-gray-200 text-md">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-2 py-1 text-center">Date</th>
                    <th className="px-2 py-1 text-center">Time</th>
                    <th className="px-2 py-1 text-center">Topic</th>
                    <th className="px-2 py-1 text-center">Description</th>
                    {!isTeacher && (
                      <th className="px-2 py-1 text-center">Teacher</th>
                    )}
                    <th className="px-2 py-1 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m, index) => (
                    <tr
                      key={m.id}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
                    >
                      <td className="px-2 py-1 text-center">
                        {formatDate(m.date)}
                      </td>
                      <td className="px-2 py-1 text-center">
                        {formatTime(m.time)}
                      </td>
                      <td className="px-2 py-1 text-center font-medium">
                        {m.topic}
                      </td>
                      <td className="px-2 py-1 text-center">
                        {m.description || "-"}
                      </td>
                      {!isTeacher && (
                        <td className="px-2 py-1 text-center">
                          {m.teacher_name}
                        </td>
                      )}

                      <td className="px-2 py-1 text-center">
                        <a
                          href={canJoinMeeting(m) ? m.meet_url : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1 rounded-2xl text-white font-bold text-sm ${
                            canJoinMeeting(m)
                              ? "bg-blue-800 hover:bg-blue-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            canJoinMeeting(m)
                              ? "Join Meeting"
                              : "You can't join now"
                          }
                          onClick={(e) => {
                            if (!canJoinMeeting(m)) e.preventDefault();
                          }}
                        >
                          Join
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isPrincipal && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Timetables
          </h2>

          {loadingTimetables ? (
            <p className="text-gray-600">Loading timetables...</p>
          ) : timetables.length === 0 ? (
            <p className="text-gray-600">No timetables available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-4xl border border-gray-200 text-md">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-2 py-1 text-center">Date</th>
                    <th className="px-2 py-1 text-center">Time</th>
                    <th className="px-2 py-1 text-center">Topic</th>
                    <th className="px-2 py-1 text-center">Teacher</th>
                    <th className="px-2 py-1 text-center">Description</th>
                    <th className="px-2 py-1 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {timetables.map((t, index) => {
                    const pendingRequest = t.pending_request;

                    return (
                      <tr
                        key={t.id}
                        className={
                          index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                        }
                      >
                        <td className="px-2 py-1 text-center">
                          {formatDate(t.from_date)} - {formatDate(t.to_date)}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {formatTime(t.start_time)} - {formatTime(t.end_time)}
                        </td>
                        <td className="px-2 py-1 text-center font-medium">
                          {t.topic}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {t.teacher_name}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {t.description || "-"}
                        </td>
                        <td className="px-2 py-1 text-center">
                          <div className="flex flex-wrap justify-center gap-2">
                            {pendingRequest &&
                              pendingRequest.status === "PENDING" && (
                                <button
                                  className="px-4 py-1 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                  onClick={() =>
                                    openPrincipalRequestModal(t.id)
                                  }
                                >
                                  Request
                                </button>
                              )}

                            <button
                              className="px-4 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700"
                              onClick={() => handleDelete(t.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isTeacher && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Timetables
          </h2>

          {loadingTimetables ? (
            <p className="text-gray-600">Loading timetables...</p>
          ) : timetables.length === 0 ? (
            <p className="text-gray-600">No timetables available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-4xl border border-gray-200 text-md">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-2 py-1 text-center">Date</th>
                    <th className="px-2 py-1 text-center">Time</th>
                    <th className="px-2 py-1 text-center">Topic</th>
                    <th className="px-2 py-1 text-center">Description</th>
                    <th className="px-2 py-1 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {timetables.map((t, index) => {
                    return (
                      <tr
                        key={t.id}
                        className={
                          index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                        }
                      >
                        <td className="px-2 py-1 text-center">
                          {formatDate(t.from_date)} - {formatDate(t.to_date)}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {formatTime(t.start_time)} - {formatTime(t.end_time)}
                        </td>
                        <td className="px-2 py-1 text-center font-medium">
                          {t.topic}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {t.description || "-"}
                        </td>
                        <td className="px-2 py-1 text-center space-x-2">
                          <button
                            className="px-2 py-.5 bg-green-600 text-white rounded-xl hover:bg-green-700"
                            onClick={() => openTeacherRequestModal(t.id)}
                          >
                            Request
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isStudent && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Learning Materials
          </h2>

          {loadingMaterials ? (
            <p className="text-gray-600">Loading Materials...</p>
          ) : materials.length === 0 ? (
            <p className="text-gray-600">No Materials available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-4xl border border-gray-200 text-md">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-2 py-1 text-center">Type</th>
                    <th className="px-2 py-1 text-center">Topic</th>
                    <th className="px-2 py-1 text-center">Description</th>
                    <th className="px-2 py-1 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, index) => (
                    <tr
                      key={m.id}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
                    >
                      <td className="px-2 py-1 text-center font-semibold">
                        {m.material_type}
                      </td>
                      <td className="px-2 py-1 text-center">{m.topic}</td>
                      <td className="px-2 py-1 text-center">
                        {m.description || "-"}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <a
                          href={`${config.imgurl}${m.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <TimetableRequestModal
        visible={requestModalVisible}
        mode={modalMode}
        timetable={selectedTimetable}
        request={selectedRequest}
        onClose={() => setRequestModalVisible(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
}
