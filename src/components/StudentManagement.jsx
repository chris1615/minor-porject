import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getFilteredAndSortedStudents } from "../utils/helpers";

const StudentManagement = ({
  students,
  setStudents,
  batches,
  selectedBatch,
  selectedSemester,
  selectedSection,
  currentSubjects,
}) => {
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    batch: selectedBatch,
    semester: selectedSemester,
    section: selectedSection,
    marks: {},
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const addStudent = () => {
    if (!newStudent.name || !newStudent.rollNo) {
      alert("Please enter student name and roll number");
      return;
    }

    if (!selectedBatch) {
      alert("Please select a batch first");
      return;
    }

    // Check if roll number already exists in the same batch
    const existingStudent = students.find(
      (s) => s.rollNo === newStudent.rollNo && s.batch === selectedBatch
    );

    if (existingStudent) {
      alert("Student with this roll number already exists in this batch");
      return;
    }

    const student = {
      ...newStudent,
      id: Date.now(),
      batch: selectedBatch,
      semester: selectedSemester,
      section: selectedSection,
      marks: { ...newStudent.marks },
    };

    setStudents((prev) => [...prev, student]);
    setNewStudent({
      name: "",
      rollNo: "",
      batch: selectedBatch,
      semester: selectedSemester,
      section: selectedSection,
      marks: {},
    });
  };

  const deleteStudent = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const updateStudentMarks = (id, subject, value) => {
    const subjectObj = currentSubjects.find((s) => s.name === subject);
    const maxMarks = subjectObj ? subjectObj.maxMarks : 100;
    const markValue = Math.min(parseInt(value) || 0, maxMarks);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            marks: { ...s.marks, [subject]: markValue },
          };
        }
        return s;
      })
    );
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredStudents = getFilteredAndSortedStudents(
    students,
    selectedBatch,
    selectedSemester,
    selectedSection,
    searchTerm,
    sortConfig
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  return (
    <div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Student Name"
            value={newStudent.name}
            onChange={(e) =>
              setNewStudent({ ...newStudent, name: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Roll Number"
            value={newStudent.rollNo}
            onChange={(e) =>
              setNewStudent({ ...newStudent, rollNo: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div>
            <select
              value={newStudent.batch}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  batch: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addStudent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Student
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {currentSubjects.map((subjectObj) => (
            <div key={subjectObj.name} className="relative">
              <input
                type="number"
                placeholder={subjectObj.name}
                min="0"
                max={subjectObj.maxMarks || 100}
                value={newStudent.marks[subjectObj.name] || ""}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    marks: {
                      ...newStudent.marks,
                      [subjectObj.name]: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                Max: {subjectObj.maxMarks || 100}
              </div>
            </div>
          ))}
        </div>
        {currentSubjects.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No subjects available. Please add subjects in the Subjects tab.
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredStudents.length)} of{" "}
            {filteredStudents.length} students
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  Name
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button
                  onClick={() => handleSort("rollNo")}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  Roll No
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-4 py-2 text-left">Batch</th>
              {currentSubjects.map((subjectObj) => (
                <th key={subjectObj.name} className="px-4 py-2 text-left">
                  <div>{subjectObj.name}</div>
                  <div className="text-xs font-normal text-gray-500">
                    Max: {subjectObj.maxMarks || 100}
                  </div>
                </th>
              ))}
              <th className="px-4 py-2 text-left">Avg %</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student) => {
              const totalMarks = currentSubjects.reduce(
                (sum, subjectObj) =>
                  sum + (student.marks[subjectObj.name] || 0),
                0
              );
              const totalMaxMarks = currentSubjects.reduce(
                (sum, subjectObj) => sum + (subjectObj.maxMarks || 100),
                0
              );
              const avgPercentage =
                totalMaxMarks > 0
                  ? ((totalMarks / totalMaxMarks) * 100).toFixed(1)
                  : 0;

              return (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.rollNo}</td>
                  <td className="px-4 py-2">{student.batch}</td>
                  {currentSubjects.map((subjectObj) => (
                    <td key={subjectObj.name} className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        max={subjectObj.maxMarks || 100}
                        value={student.marks[subjectObj.name] || ""}
                        onChange={(e) =>
                          updateStudentMarks(
                            student.id,
                            subjectObj.name,
                            e.target.value
                          )
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <span
                      className={`font-semibold ${
                        avgPercentage >= 75
                          ? "text-green-600"
                          : avgPercentage >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {avgPercentage}%
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      title="Delete student"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "No students found matching your search"
              : "No students found for this batch, semester and section"}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
