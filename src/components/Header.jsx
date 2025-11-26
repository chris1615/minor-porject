import React from "react";
import {
  Upload,
  Download,
  Users,
  BookOpen,
  Calendar,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { handleFileUpload, exportToExcel } from "../utils/helpers";

const Header = ({
  batches,
  selectedBatch,
  setSelectedBatch,
  selectedSemester,
  setSelectedSemester,
  selectedSection,
  setSelectedSection,
  sections,
  students,
  setStudents,
  subjects,
  setSubjects,
  currentSubjects,
}) => {
  const currentBatch = batches.find((b) => b.id === selectedBatch);

  return (
    <>
      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Student Marks Management System
        </h1>
        <p className="text-gray-600">Academic Performance Tracking</p>
      </div>

      {/* Batch Management */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                const sem = parseInt(e.target.value);
                setSelectedSemester(sem);
                setSelectedSection(sections[sem]?.[0] || "1A");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {currentBatch &&
                Array.from(
                  { length: currentBatch.semesters },
                  (_, i) => i + 1
                ).map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {(sections[selectedSemester] || []).map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1"></div>

          <label className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition flex items-center gap-2">
            <Upload size={20} />
            Import Excel/CSV
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) =>
                handleFileUpload(
                  e,
                  selectedBatch,
                  selectedSemester,
                  selectedSection,
                  subjects,
                  setSubjects,
                  setStudents
                )
              }
              className="hidden"
            />
          </label>

          <button
            onClick={() =>
              exportToExcel(
                students,
                selectedBatch,
                selectedSemester,
                selectedSection,
                currentSubjects
              )
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
