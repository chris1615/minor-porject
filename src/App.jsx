import React, { useState, useEffect } from "react";
import { DatabaseService } from "./services/database";
import {
  getCurrentSubjects,
  getFilteredAndSortedStudents,
  analyzeWeakStudents,
  analyzeIndividualStudentPerformance,
} from "./utils/helpers";
import Header from "./components/Header";
import BatchManagement from "./components/BatchManagement";
import SubjectManagement from "./components/SubjectManagement";
import StudentManagement from "./components/StudentManagement";
import Analytics from "./components/Analytics";
import Insights from "./components/Insights";

const App = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedSection, setSelectedSection] = useState("1A");
  const [sections, setSections] = useState({
    1: ["1A", "1B", "1C"],
    2: ["2A", "2B", "2C"],
    3: ["3A", "3B", "3C"],
    4: ["4A", "4B", "4C"],
    5: ["5A", "5B", "5C"],
    6: ["6A", "6B", "6C"],
  });
  const [subjects, setSubjects] = useState({});
  const [weakStudents, setWeakStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("manage");

  // Individual performance analytics states
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] =
    useState("");
  const [selectedBatchForAnalytics, setSelectedBatchForAnalytics] =
    useState("");
  const [studentPerformanceData, setStudentPerformanceData] = useState([]);

  // Load data from database on component mount
  useEffect(() => {
    const loadData = () => {
      const loadedBatches = DatabaseService.getBatches();
      const loadedStudents = DatabaseService.getStudents();
      const loadedSubjects = DatabaseService.getSubjects();

      setBatches(loadedBatches);
      setStudents(loadedStudents);
      setSubjects(loadedSubjects);

      if (loadedBatches.length > 0) {
        const firstBatch = loadedBatches[0].id;
        setSelectedBatch(firstBatch);
        setSelectedBatchForAnalytics(firstBatch);
      }
    };

    loadData();
  }, []);

  // Save data to database whenever it changes
  useEffect(() => {
    if (batches.length > 0) {
      DatabaseService.saveBatches(batches);
    }
  }, [batches]);

  useEffect(() => {
    DatabaseService.saveStudents(students);
  }, [students]);

  useEffect(() => {
    if (Object.keys(subjects).length > 0) {
      DatabaseService.saveSubjects(subjects);
    }
  }, [subjects]);

  // Update weak students analysis when dependencies change
  useEffect(() => {
    const weakStudents = analyzeWeakStudents(
      students,
      selectedBatch,
      selectedSemester,
      selectedSection,
      subjects
    );
    setWeakStudents(weakStudents);
  }, [students, selectedBatch, selectedSemester, selectedSection, subjects]);

  // Update individual student performance analysis
  useEffect(() => {
    const performanceData = analyzeIndividualStudentPerformance(
      selectedBatchForAnalytics,
      selectedStudentForAnalytics,
      students,
      batches,
      subjects
    );
    setStudentPerformanceData(performanceData);
  }, [
    selectedBatchForAnalytics,
    selectedStudentForAnalytics,
    students,
    batches,
    subjects,
  ]);

  const currentSubjects = getCurrentSubjects(
    subjects,
    selectedBatch,
    selectedSemester
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Header
          batches={batches}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          sections={sections}
          students={students}
          setStudents={setStudents}
          subjects={subjects}
          setSubjects={setSubjects}
          currentSubjects={currentSubjects}
        />

        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            {["manage", "subjects", "batches", "analytics", "insights"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-3 font-medium transition ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>

          <div className="p-6">
            {activeTab === "manage" && (
              <StudentManagement
                students={students}
                setStudents={setStudents}
                batches={batches}
                selectedBatch={selectedBatch}
                selectedSemester={selectedSemester}
                selectedSection={selectedSection}
                currentSubjects={currentSubjects}
              />
            )}

            {activeTab === "subjects" && (
              <SubjectManagement
                subjects={subjects}
                setSubjects={setSubjects}
                students={students}
                setStudents={setStudents}
                selectedBatch={selectedBatch}
                selectedSemester={selectedSemester}
                selectedSection={selectedSection}
                currentSubjects={currentSubjects}
              />
            )}

            {activeTab === "batches" && (
              <BatchManagement
                batches={batches}
                setBatches={setBatches}
                subjects={subjects}
                setSubjects={setSubjects}
                students={students}
                setStudents={setStudents}
                selectedBatch={selectedBatch}
                setSelectedBatch={setSelectedBatch}
                sections={sections}
                setSections={setSections}
              />
            )}

            {activeTab === "analytics" && (
              <Analytics
                batches={batches}
                students={students}
                selectedBatch={selectedBatch}
                selectedSemester={selectedSemester}
                selectedSection={selectedSection}
                subjects={subjects}
                selectedBatchForAnalytics={selectedBatchForAnalytics}
                setSelectedBatchForAnalytics={setSelectedBatchForAnalytics}
                selectedStudentForAnalytics={selectedStudentForAnalytics}
                setSelectedStudentForAnalytics={setSelectedStudentForAnalytics}
                studentPerformanceData={studentPerformanceData}
                currentSubjects={currentSubjects}
              />
            )}

            {activeTab === "insights" && (
              <Insights weakStudents={weakStudents} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600">
              {
                getFilteredAndSortedStudents(
                  students,
                  selectedBatch,
                  selectedSemester,
                  selectedSection,
                  "",
                  {}
                ).length
              }
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">At Risk Students</h3>
            <p className="text-3xl font-bold text-red-600">
              {weakStudents.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Average Performance</h3>
            <p className="text-3xl font-bold text-green-600">
              {(() => {
                const filteredStudents = getFilteredAndSortedStudents(
                  students,
                  selectedBatch,
                  selectedSemester,
                  selectedSection,
                  "",
                  {}
                );
                if (filteredStudents.length > 0 && currentSubjects.length > 0) {
                  const avg =
                    filteredStudents.reduce((sum, s) => {
                      const totalMarks = currentSubjects.reduce(
                        (t, sub) => t + (s.marks[sub.name] || 0),
                        0
                      );
                      const totalMaxMarks = currentSubjects.reduce(
                        (t, sub) => t + (sub.maxMarks || 100),
                        0
                      );
                      return sum + (totalMarks / totalMaxMarks) * 100;
                    }, 0) / filteredStudents.length;
                  return avg.toFixed(1);
                }
                return 0;
              })()}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
