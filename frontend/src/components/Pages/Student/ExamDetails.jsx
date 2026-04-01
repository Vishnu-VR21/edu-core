import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../../../utils/config";
import { MdClose } from "react-icons/md";

export default function ExamDetails() {
  const [exams, setExams] = useState([]);
  const [resultModal, setResultModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    const fetchExams = () => {
      axios
        .get(`${config.baseurl}student_exams/`, {
          headers: { Authorization: `Token ${token}` },
        })
        .then((res) => {
          const formatted = res.data.map((item) => ({
            id: item.exam.id,
            title: item.exam.title,
            startTime: new Date(item.exam.startTime),
            endTime: new Date(item.exam.endTime),
            resultAvailable: item.is_completed,
            score: item.score ?? 0,
            percentage: item.percentage,
            correct: item.exam.correct_answers ?? 0,
            wrong: item.exam.wrong_answers ?? 0,
          }));

          setExams(formatted);
        })
        .catch(() => toast.error("Failed to load exams"));
    };

    fetchExams();

    const interval = setInterval(fetchExams, 30000);

    return () => clearInterval(interval);
  }, []);

  console.log("exam details", exams);

  const formatDate = (date) =>
    date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getDurationMinutes = (start, end) => Math.round((end - start) / 60000);

  const handleStart = async (exam) => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `${config.baseurl}exam/start/${exam.id}/`,
        {},
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      console.log(res.data);

      navigate(`/student_dashboard/exam/${exam.id}/start`);
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to start exam";
      toast.error(msg);
    }
  };

  const handleViewResult = (exam) => {
    setResultModal(exam);
  };

  return (
    <div className="min-h-[83vh] bg-linear-to-br from-blue-50 to-white px-4 py-4 rounded-2xl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-blue-900">My Exams</h2>
          <p className="text-sm text-gray-600">
            Start active exams or view completed results
          </p>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-blue-400 text-lg">No exams assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const now = new Date();
              const isActive = now >= exam.startTime && now <= exam.endTime;
              const isMissed = now > exam.endTime && !exam.resultAvailable;
              const canStart = now >= exam.startTime && now <= exam.endTime;

              return (
                <div
                  key={exam.id}
                  className="relative rounded-xl border border-blue-200 bg-white p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute top-6 right-6">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        exam.resultAvailable
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : isActive
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : isMissed
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-blue-100 text-blue-600 border border-blue-200"
                      }`}
                    >
                      {exam.resultAvailable
                        ? "✓ Completed"
                        : isActive
                          ? "● Active"
                          : isMissed
                            ? "✕ Missed"
                            : "○ Scheduled"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-blue-900 mb-6 pr-32">
                    {exam.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs font-medium text-blue-500 uppercase mb-1">
                        Date
                      </p>
                      <p className="text-sm font-semibold">
                        {formatDate(exam.startTime)}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs font-medium text-blue-500 uppercase mb-1">
                        Duration
                      </p>
                      <p className="text-sm font-semibold">
                        {getDurationMinutes(exam.startTime, exam.endTime)} mins
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs font-medium text-blue-500 uppercase mb-1">
                        Start Time
                      </p>
                      <p className="text-sm font-semibold">
                        {formatTime(exam.startTime)}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs font-medium text-blue-500 uppercase mb-1">
                        End Time
                      </p>
                      <p className="text-sm font-semibold">
                        {formatTime(exam.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    {exam.resultAvailable === false && isActive && (
                      <button
                        onClick={() => handleStart(exam)}
                        disabled={!canStart}
                        className="flex-1 px-5 py-3 bg-blue-900 text-white hover:bg-blue-800 rounded-lg font-semibold"
                      >
                        Start Exam
                      </button>
                    )}

                    {(exam.resultAvailable || isMissed) && (
                      <button
                        onClick={() => handleViewResult(exam)}
                        className="flex-1 px-5 py-3 bg-white border-2 border-blue-900 text-blue-900 rounded-lg font-semibold"
                      >
                        View Result
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {resultModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setResultModal(null)}
              className="absolute top-3 right-4 text-blue-500"
            >
              <MdClose size={25} />
            </button>

            <h3 className="text-xl font-bold text-center mb-4">
              {resultModal.title}
            </h3>

            <p className="text-center text-5xl font-extrabold mb-6">
              {resultModal.percentage || 0}
              {"%"}
            </p>

            <div className="flex justify-between text-sm font-semibold">
              <span className="text-green-600">
                Correct: {resultModal.correct}
              </span>
              <span className="text-red-600">Wrong: {resultModal.wrong}</span>
            </div>

            {!resultModal.resultAvailable && (
              <p className="mt-4 text-center text-red-600 font-medium">
                You missed this exam
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
