import React, { useState, useEffect } from "react";

export default function TimetableRequestModal({
  visible,
  mode,
  timetable,
  request,
  onClose,
  onSubmit,
  onApprove,
  onReject,
}) {
  const [form, setForm] = useState({
    from_date: "",
    to_date: "",
    start_time: "",
    end_time: "",
    reason: "",
  });

  useEffect(() => {
    if (mode === "CREATE" && timetable) {
      setForm({
        from_date: timetable.from_date || "",
        to_date: timetable.to_date || "",
        start_time: timetable.start_time || "",
        end_time: timetable.end_time || "",
        reason: "",
      });
    }
  }, [mode, timetable]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.reason.trim()) {
      alert("Reason is required");
      return;
    }

    onSubmit({
      timetable: timetable.id,
      ...form,
    });
  };

  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-105 overflow-hidden shadow-xl">
        <div className="bg-blue-900 text-white px-6 py-4">
          <h2 className="text-lg font-semibold text-center">
            {mode === "CREATE"
              ? "Request Timetable Change"
              : "Teacher Change Request"}
          </h2>
        </div>

        <div className="p-6 space-y-4 text-sm text-gray-800">
          {mode === "CREATE" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    name="from_date"
                    value={form.from_date}
                    onChange={handleChange}
                    className="border rounded-lg p-2"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    name="to_date"
                    value={form.to_date}
                    onChange={handleChange}
                    className="border rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    className="border rounded-lg p-2"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    className="border rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Reason for Change
                </label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full h-24 resize-none"
                />
              </div>
            </div>
          )}

          {mode === "VIEW" && request && (
            <div className="p-4 bg-white space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-gray-700 font-semibold mb-1">
                    From Date
                  </span>
                  <div className="border rounded p-2 bg-gray-50 text-gray-900">
                    {request.from_date}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-700 font-semibold mb-1">
                    To Date
                  </span>
                  <div className="border rounded p-2 bg-gray-50 text-gray-900">
                    {request.to_date}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-gray-700 font-semibold mb-1">
                    Start Time
                  </span>
                  <div className="border rounded p-2 bg-gray-50 text-gray-900">
                    {request.start_time}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-700 font-semibold mb-1">
                    End Time
                  </span>
                  <div className="border rounded p-2 bg-gray-50 text-gray-900">
                    {request.end_time}
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700 font-semibold mb-1">Reason</span>
                <div className="border rounded p-2 bg-gray-50 text-gray-900">
                  {request.reason}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex justify-between border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-300 text-gray-800 hover:bg-gray-400"
          >
            Close
          </button>

          <div className="space-x-2">
            {mode === "CREATE" && (
              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-blue-900 text-white hover:bg-blue-800"
              >
                Submit Request
              </button>
            )}

            {mode === "VIEW" && (
              <>
                <button
                  onClick={() => onApprove(request.id)}
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white hover:bg-blue-800"
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(request.id)}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
