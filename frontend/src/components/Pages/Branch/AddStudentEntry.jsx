import { useState } from "react";
import { FaUpload } from "react-icons/fa6";
import { ImUserPlus } from "react-icons/im";
import SingleStudentModal from "./SingleStudentModal";
import ExcelUploadModal from "./ExcelUploadModal";

export default function AddStudentEntry() {
  const [singleOpen, setSingleOpen] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);

  return (
    <div className="min-h-[83vh] bg-linear-to-br from-blue-50 to-white flex items-center justify-center py-6 px-4 rounded-2xl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900">Add Students</h2>
          <p className="mt-1 text-gray-600">
            Choose how you want to add student details
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            onClick={() => setSingleOpen(true)}
            className="group cursor-pointer rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-300"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white">
                <ImUserPlus size={22} />
              </div>
              <h3 className="text-xl font-semibold text-blue-900">
                Single Student Entry
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Add a student individually using a detailed form.
            </p>
          </div>

          <div
            onClick={() => setExcelOpen(true)}
            className="group cursor-pointer rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-300"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white">
                <FaUpload size={22} />
              </div>
              <h3 className="text-xl font-semibold text-blue-900">
                Excel Upload
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Upload multiple students at once using an Excel file.
            </p>
            {/* <div className="mt-6 text-sm font-medium text-blue-900 group-hover:underline">
              Upload Excel →
            </div> */}
          </div>
        </div>
      </div>

      {singleOpen && <SingleStudentModal onClose={() => setSingleOpen(false)} />}
      {excelOpen && <ExcelUploadModal onClose={() => setExcelOpen(false)} />}
    </div>
  );
}
