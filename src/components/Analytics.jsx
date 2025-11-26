import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import SearchableSelect from "./SearchableSelect";

const Analytics = ({
  batches,
  students,
  selectedBatch,
  selectedSemester,
  selectedSection,
  subjects,
  selectedBatchForAnalytics,
  setSelectedBatchForAnalytics,
  selectedStudentForAnalytics,
  setSelectedStudentForAnalytics,
  studentPerformanceData,
  currentSubjects,
}) => {
  const [analyticsPage, setAnalyticsPage] = useState(0);
  const studentsPerAnalyticsPage = 10;

  // Get chart data for subject-wise performance
  const getChartData = () => {
    if (!selectedBatch) return [];

    const filteredStudents = students.filter(
      (s) =>
        s.batch === selectedBatch &&
        s.semester === selectedSemester &&
        s.section === selectedSection
    );

    if (filteredStudents.length === 0) return [];

    return currentSubjects.map((subjectObj) => {
      const subjectName = subjectObj.name;
      const maxMarks = subjectObj.maxMarks || 100;
      const marks = filteredStudents.map((s) => s.marks[subjectName] || 0);
      const avg =
        marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
      const passed = marks.filter((m) => m >= 0.4 * maxMarks).length;
      const failed = marks.filter((m) => m < 0.4 * maxMarks).length;

      return {
        subject: subjectName,
        average: parseFloat(avg.toFixed(2)),
        passed,
        failed,
        total: marks.length,
        maxMarks,
      };
    });
  };

  // Get student performance data for class performance chart
  const getStudentPerformance = () => {
    if (!selectedBatch) return [];

    const filteredStudents = students.filter(
      (s) =>
        s.batch === selectedBatch &&
        s.semester === selectedSemester &&
        s.section === selectedSection
    );

    // Paginate the performance data
    const startIdx = analyticsPage * studentsPerAnalyticsPage;
    const endIdx = startIdx + studentsPerAnalyticsPage;

    return filteredStudents.slice(startIdx, endIdx).map((student) => ({
      name: student.name,
      ...student.marks,
    }));
  };

  // Get students for selected batch in analytics
  const getStudentsForAnalytics = () => {
    if (!selectedBatchForAnalytics) return [];

    // Get unique students by roll number within the selected batch
    const uniqueStudents = [];
    const seenRollNos = new Set();

    students.forEach((student) => {
      if (
        student.batch === selectedBatchForAnalytics &&
        !seenRollNos.has(student.rollNo)
      ) {
        seenRollNos.add(student.rollNo);
        uniqueStudents.push(student);
      }
    });

    return uniqueStudents;
  };

  // Get student options for the searchable select
  const getStudentOptions = () => {
    const analyticsStudents = getStudentsForAnalytics();
    return analyticsStudents.map((student) => ({
      value: student.id.toString(),
      label: `${student.name} (${student.rollNo})`,
    }));
  };

  const chartData = getChartData();
  const performanceData = getStudentPerformance();
  const studentOptions = getStudentOptions();

  // Analytics pagination calculations
  const totalAnalyticsStudents = students.filter(
    (s) =>
      s.batch === selectedBatch &&
      s.semester === selectedSemester &&
      s.section === selectedSection
  ).length;
  const totalAnalyticsPages = Math.ceil(
    totalAnalyticsStudents / studentsPerAnalyticsPage
  );

  return (
    <div className="space-y-8">
      {/* Subject-wise Performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Subject-wise Performance</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#3b82f6" name="Average Marks" />
              <Bar dataKey="passed" fill="#10b981" name="Passed" />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No data available for analytics
          </div>
        )}
      </div>

      {/* Individual Student Performance */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User size={20} />
          Individual Student Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Batch
            </label>
            <select
              value={selectedBatchForAnalytics}
              onChange={(e) => setSelectedBatchForAnalytics(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <SearchableSelect
              value={selectedStudentForAnalytics}
              onChange={setSelectedStudentForAnalytics}
              options={studentOptions}
              placeholder="Select a student..."
              disabled={!selectedBatchForAnalytics}
              searchPlaceholder="Search by name or roll number..."
            />
            {studentOptions.length === 0 && selectedBatchForAnalytics && (
              <div className="text-sm text-gray-500 mt-2">
                No students found in this batch
              </div>
            )}
          </div>
        </div>

        {studentPerformanceData.length > 0 ? (
          <div>
            <h4 className="text-md font-semibold mb-4">
              Performance Trend for{" "}
              {
                students.find(
                  (s) => s.id.toString() === selectedStudentForAnalytics
                )?.name
              }{" "}
              (
              {
                students.find(
                  (s) => s.id.toString() === selectedStudentForAnalytics
                )?.rollNo
              }
              )
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={studentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Average"]} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="average"
                  fill="#3b82f6"
                  stroke="#3b82f6"
                  name="Average %"
                  fillOpacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#1d4ed8"
                  strokeWidth={2}
                  name="Average %"
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Detailed Performance Table */}
            <div className="mt-6">
              <h5 className="text-md font-semibold mb-3">
                Detailed Semester-wise Performance
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Semester</th>
                      <th className="px-4 py-2 text-left">Average %</th>
                      <th className="px-4 py-2 text-left">Total Marks</th>
                      <th className="px-4 py-2 text-left">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentPerformanceData.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{data.semester}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`font-semibold ${
                              data.average >= 75
                                ? "text-green-600"
                                : data.average >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {data.average}%
                          </span>
                        </td>
                        <td className="px-4 py-2">{data.totalMarks}</td>
                        <td className="px-4 py-2">{data.totalMaxMarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : selectedBatchForAnalytics && selectedStudentForAnalytics ? (
          <div className="text-center py-8 text-gray-500">
            No performance data available for the selected student across
            semesters
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Please select a batch and student to view individual performance
          </div>
        )}
      </div>

      {/* Class Performance */}
      {performanceData.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Class Performance (Top 10 Students)
            </h3>
            {totalAnalyticsPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setAnalyticsPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={analyticsPage === 0}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                  Students {analyticsPage * studentsPerAnalyticsPage + 1}-
                  {Math.min(
                    (analyticsPage + 1) * studentsPerAnalyticsPage,
                    totalAnalyticsStudents
                  )}{" "}
                  of {totalAnalyticsStudents}
                </span>
                <button
                  onClick={() =>
                    setAnalyticsPage((prev) =>
                      Math.min(totalAnalyticsPages - 1, prev + 1)
                    )
                  }
                  disabled={analyticsPage === totalAnalyticsPages - 1}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {currentSubjects.map((subjectObj, idx) => (
                <Line
                  key={subjectObj.name}
                  type="monotone"
                  dataKey={subjectObj.name}
                  stroke={
                    ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][
                      idx % 5
                    ]
                  }
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;
