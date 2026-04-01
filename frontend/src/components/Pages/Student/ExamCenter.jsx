import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../../../utils/config";

export default function ExamCenter() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  const [submitted, setSubmitted] = useState(false);

  const answersRef = useRef({});
  const submittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers; // always keep latest answers
  }, [answers]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      navigate("/login");
      return;
    }

    axios
      .get(`${config.baseurl}exam/start/${examId}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        const examData = res.data.exam;
        setExam(examData);
        setAnswers(res.data.previous_answers || {});

        setTimeLeft(res.data.time_left_seconds);

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load exam");
        navigate("/student_dashboard/exam_details");
      });
  }, [examId, navigate]);

  console.log("exam details", exam);

  useEffect(() => {
    window.history.pushState(null, document.title, window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, document.title, window.location.href);
      toast.info("You cannot go back during the exam!");
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleAnswerChange = (questionId, key) => {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  };

  const handleSubmit = async (currentAnswers) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    const answersToSend = currentAnswers ?? answersRef.current;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${config.baseurl}exam/submit/${examId}/`,
        { answers: answersToSend },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success("Exam submitted successfully!");
      navigate("/student_dashboard/exam_details");
    } catch (err) {
      submittedRef.current = false;
      setSubmitted(false);
      console.error(err);
      toast.error("Failed to submit exam");
    }
  };

  useEffect(() => {
    if (!exam || submittedRef.current) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [exam]);

  const handleReset = () => {
    setAnswers({});
    toast.info("All answers have been reset");
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "0:00";

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m}:${s.toString().padStart(2, "0")}`;
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = exam?.questions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );
  const totalPages = exam
    ? Math.ceil(exam.questions.length / questionsPerPage)
    : 0;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) return <div className="p-10 text-center">Loading exam...</div>;

  return (
    <div className="min-h-screen bg-blue-50 px-6 py-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl p-6 shadow-lg">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <h3 className="font-bold text-yellow-800 mb-2">Instructions:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              • If the timer runs out, your exam will be submitted
              automatically.
            </li>
            <li>• Make sure to click "Submit" before the time expires.</li>
            <li>
              • You can use the "Reset" button to clear all your answers if
              needed.
            </li>
          </ul>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="text-xl font-mono text-red-600 font-bold">
            Time Left: {formatTime(timeLeft)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Reset
            </button>
            <button
              onClick={() => handleSubmit(answers)}
              className={`px-6 py-2 rounded-lg transition ${
                submitted
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 text-white hover:bg-blue-700"
              }`}
            >
              Submit
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-blue-900 mb-6">{exam.title}</h2>

        <div className="space-y-6">
          {currentQuestions.map((q, index) => {
            const questionNumber = indexOfFirstQuestion + index + 1;
            return (
              <div
                key={q.id}
                className="p-5 border rounded-lg bg-gray-50 shadow-sm"
              >
                <p className="font-bold text-lg mb-3 text-gray-800">
                  {questionNumber}. {q.question_text}
                </p>

                {q.type === "statement" && q.statements?.length > 0 && (
                  <ol className="mb-4 ml-6 list-decimal space-y-2">
                    {q.statements.map((st, i) => (
                      <li key={i} className="font-semibold text-gray-700">
                        {st}
                      </li>
                    ))}
                  </ol>
                )}

                {["A", "B", "C", "D"].map((key, idx) => {
                  const optText = q.options[idx];
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer p-3 border rounded hover:bg-blue-50 transition"
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={key}
                        checked={answers[q.id] === key}
                        onChange={() => handleAnswerChange(q.id, key)}
                        className="accent-blue-900"
                      />
                      <span className="text-gray-700">{optText}</span>
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-6 py-2 rounded-lg transition ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-900 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>

          <div className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-6 py-2 rounded-lg transition ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-900 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
