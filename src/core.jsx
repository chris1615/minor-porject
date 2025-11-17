import React, { useState, useEffect } from "react";
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
import {
  Upload,
  Users,
  TrendingDown,
  AlertCircle,
  Download,
  Plus,
  Trash2,
  Save,
  BookOpen,
  Calendar,
  Target,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  User,
  ChevronDown,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";

// Enhanced Database service with proper persistence
const DatabaseService = {
  // Batches
  getBatches: () => {
    try {
      const batches = localStorage.getItem("studentMarks_batches");
      return batches
        ? JSON.parse(batches)
        : [
            {
              id: "2021",
              name: "2021 Batch",
              startYear: 2021,
              active: true,
              semesters: 6,
            },
            {
              id: "2022",
              name: "2022 Batch",
              startYear: 2022,
              active: true,
              semesters: 6,
            },
            {
              id: "2023",
              name: "2023 Batch",
              startYear: 2023,
              active: true,
              semesters: 6,
            },
          ];
    } catch (error) {
      console.error("Error loading batches:", error);
      return [];
    }
  },

  saveBatches: (batches) => {
    try {
      localStorage.setItem("studentMarks_batches", JSON.stringify(batches));
    } catch (error) {
      console.error("Error saving batches:", error);
    }
  },

  // Students
  getStudents: () => {
    try {
      const students = localStorage.getItem("studentMarks_students");
      return students ? JSON.parse(students) : [];
    } catch (error) {
      console.error("Error loading students:", error);
      return [];
    }
  },

  saveStudents: (students) => {
    try {
      localStorage.setItem("studentMarks_students", JSON.stringify(students));
    } catch (error) {
      console.error("Error saving students:", error);
    }
  },

  // Subjects with max marks
  getSubjects: () => {
    try {
      const subjects = localStorage.getItem("studentMarks_subjects");
      if (subjects) {
        return JSON.parse(subjects);
      } else {
        // Default structure with max marks
        const defaultSubjects = {};
        ["2021", "2022", "2023"].forEach((batch) => {
          defaultSubjects[batch] = {};
          [1, 2, 3, 4, 5, 6].forEach((semester) => {
            defaultSubjects[batch][semester] = [
              { name: "Mathematics", maxMarks: 100 },
              { name: "Physics", maxMarks: 100 },
              { name: "Chemistry", maxMarks: 100 },
              { name: "Programming", maxMarks: 100 },
              { name: "English", maxMarks: 100 },
            ];
          });
        });
        return defaultSubjects;
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      return {};
    }
  },

  saveSubjects: (subjects) => {
    try {
      localStorage.setItem("studentMarks_subjects", JSON.stringify(subjects));
    } catch (error) {
      console.error("Error saving subjects:", error);
    }
  },
};

// Custom Select Component with Search
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  searchPlaceholder = "Search...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white cursor-pointer"
        }`}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-700 ${
                    value === option.value
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-900"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StudentMarksSystem = () => {
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
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    batch: "",
    semester: 1,
    section: "1A",
    marks: {},
  });
  const [newSubject, setNewSubject] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [newBatchSemesters, setNewBatchSemesters] = useState(6); // Default set to 6
  const [newSubjectMaxMarks, setNewSubjectMaxMarks] = useState(100);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingMaxMarksValue, setEditingMaxMarksValue] = useState(100);

  // Individual performance analytics states
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] =
    useState("");
  const [selectedBatchForAnalytics, setSelectedBatchForAnalytics] =
    useState("");
  const [studentPerformanceData, setStudentPerformanceData] = useState([]);

  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Analytics pagination
  const [analyticsPage, setAnalyticsPage] = useState(0);
  const studentsPerAnalyticsPage = 10;

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
        setNewStudent((prev) => ({ ...prev, batch: firstBatch }));
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

  // Update newStudent when batch changes
  useEffect(() => {
    if (selectedBatch) {
      setNewStudent((prev) => ({ ...prev, batch: selectedBatch }));
    }
  }, [selectedBatch]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [selectedBatch, selectedSemester, selectedSection]);

  const analyzeWeakStudents = () => {
    if (!selectedBatch) return;

    const currentSubjects = getCurrentSubjects();
    const filteredStudents = students.filter(
      (s) =>
        s.batch === selectedBatch &&
        s.semester === selectedSemester &&
        s.section === selectedSection
    );

    if (filteredStudents.length === 0) {
      setWeakStudents([]);
      return;
    }

    const subjectAverages = {};
    currentSubjects.forEach((subjectObj) => {
      const subjectName = subjectObj.name;
      const marks = filteredStudents
        .map((s) => s.marks[subjectName] || 0)
        .filter((m) => m > 0);
      subjectAverages[subjectName] =
        marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
    });

    const weak = filteredStudents
      .map((student) => {
        const weakSubjects = currentSubjects
          .filter((subjectObj) => {
            const subjectName = subjectObj.name;
            const mark = student.marks[subjectName] || 0;
            const avg = subjectAverages[subjectName];
            const maxMarks = subjectObj.maxMarks || 100;
            const percentage = (mark / maxMarks) * 100;
            return percentage < 50 || mark < avg * 0.7;
          })
          .map((subjectObj) => subjectObj.name);

        const totalMarks = currentSubjects.reduce((sum, subjectObj) => {
          const subjectName = subjectObj.name;
          return sum + (student.marks[subjectName] || 0);
        }, 0);

        const totalMaxMarks = currentSubjects.reduce(
          (sum, subjectObj) => sum + (subjectObj.maxMarks || 100),
          0
        );
        const avgPercentage =
          totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

        return {
          ...student,
          weakSubjects,
          avgMarks: avgPercentage.toFixed(2),
          riskLevel:
            avgPercentage < 40 ? "high" : avgPercentage < 50 ? "medium" : "low",
        };
      })
      .filter((s) => s.weakSubjects.length > 0)
      .sort((a, b) => b.weakSubjects.length - a.weakSubjects.length);

    setWeakStudents(weak);
  };

  // Analyze individual student performance
  const analyzeIndividualStudentPerformance = () => {
    if (!selectedBatchForAnalytics || !selectedStudentForAnalytics) {
      setStudentPerformanceData([]);
      return;
    }

    const student = students.find(
      (s) => s.id.toString() === selectedStudentForAnalytics
    );
    if (!student) {
      setStudentPerformanceData([]);
      return;
    }

    const batch = batches.find((b) => b.id === selectedBatchForAnalytics);
    if (!batch) {
      setStudentPerformanceData([]);
      return;
    }

    const performanceData = [];

    // Get performance for each semester
    for (let semester = 1; semester <= batch.semesters; semester++) {
      const semesterStudents = students.filter(
        (s) =>
          s.batch === selectedBatchForAnalytics &&
          s.semester === semester &&
          s.rollNo === student.rollNo
      );

      if (semesterStudents.length > 0) {
        const semesterStudent = semesterStudents[0];
        const currentSubjects =
          subjects[selectedBatchForAnalytics]?.[semester] || [];

        if (currentSubjects.length > 0) {
          const totalMarks = currentSubjects.reduce(
            (sum, subjectObj) =>
              sum + (semesterStudent.marks[subjectObj.name] || 0),
            0
          );
          const totalMaxMarks = currentSubjects.reduce(
            (sum, subjectObj) => sum + (subjectObj.maxMarks || 100),
            0
          );
          const avgPercentage =
            totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

          performanceData.push({
            semester: `Sem ${semester}`,
            average: parseFloat(avgPercentage.toFixed(2)),
            totalMarks,
            totalMaxMarks,
          });
        } else {
          // If no subjects but student exists for this semester
          performanceData.push({
            semester: `Sem ${semester}`,
            average: 0,
            totalMarks: 0,
            totalMaxMarks: 0,
          });
        }
      } else {
        // If no student data for this semester
        performanceData.push({
          semester: `Sem ${semester}`,
          average: 0,
          totalMarks: 0,
          totalMaxMarks: 0,
        });
      }
    }

    setStudentPerformanceData(performanceData);
  };

  useEffect(() => {
    analyzeWeakStudents();
  }, [students, selectedBatch, selectedSemester, selectedSection, subjects]);

  useEffect(() => {
    analyzeIndividualStudentPerformance();
  }, [
    selectedBatchForAnalytics,
    selectedStudentForAnalytics,
    students,
    batches,
    subjects,
  ]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData.length) {
          alert("No data found in the file");
          return;
        }

        // Detect subjects from Excel columns (exclude standard columns)
        const standardColumns = [
          "Name",
          "name",
          "Roll No",
          "rollNo",
          "RollNo",
          "rollno",
          "Batch",
          "batch",
          "Semester",
          "semester",
          "Section",
          "section",
        ];
        const detectedSubjects = Object.keys(jsonData[0] || {})
          .filter((col) => !standardColumns.includes(col))
          .map((col) => col.trim());

        // Update subjects for the current batch and semester
        const currentBatchSubjects = subjects[selectedBatch] || {};
        const currentSemesterSubjects =
          currentBatchSubjects[selectedSemester] || [];
        const currentSubjectNames = currentSemesterSubjects.map((s) => s.name);

        const newSubjects = detectedSubjects
          .filter((subject) => !currentSubjectNames.includes(subject))
          .map((subject) => ({ name: subject, maxMarks: 100 }));

        if (newSubjects.length > 0) {
          setSubjects((prev) => ({
            ...prev,
            [selectedBatch]: {
              ...prev[selectedBatch],
              [selectedSemester]: [...currentSemesterSubjects, ...newSubjects],
            },
          }));
        }

        const newStudents = jsonData.map((row, idx) => {
          const marks = {};
          [...currentSemesterSubjects, ...newSubjects].forEach((subjectObj) => {
            const subjectName = subjectObj.name;
            // Handle different column name variations
            const markValue =
              row[subjectName] || row[subjectName.toLowerCase()] || 0;
            marks[subjectName] = parseInt(markValue) || 0;
          });

          return {
            id: Date.now() + idx,
            name: row.Name || row.name || `Student ${idx + 1}`,
            rollNo:
              row["Roll No"] ||
              row.rollNo ||
              row.RollNo ||
              row.rollno ||
              `R${idx + 1}`,
            batch: row.Batch || row.batch || selectedBatch,
            semester:
              parseInt(row.Semester || row.semester) || selectedSemester,
            section: row.Section || row.section || selectedSection,
            marks,
          };
        });

        setStudents((prev) => [...prev, ...newStudents]);
        alert(`Successfully imported ${newStudents.length} students!`);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading file. Please ensure it has the correct format.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const exportToExcel = () => {
    if (!selectedBatch) {
      alert("Please select a batch first");
      return;
    }

    const filteredStudents = students.filter(
      (s) =>
        s.batch === selectedBatch &&
        s.semester === selectedSemester &&
        s.section === selectedSection
    );

    if (filteredStudents.length === 0) {
      alert("No students found to export");
      return;
    }

    const exportData = filteredStudents.map((s) => {
      const studentData = {
        Name: s.name,
        "Roll No": s.rollNo,
        Batch: s.batch,
        Semester: s.semester,
        Section: s.section,
      };

      // Add marks for each subject
      const currentSubjects = getCurrentSubjects();
      currentSubjects.forEach((subjectObj) => {
        studentData[subjectObj.name] = s.marks[subjectObj.name] || 0;
      });

      return studentData;
    });

    try {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(
        wb,
        `Students_${selectedBatch}_Sem${selectedSemester}_${selectedSection}.xlsx`
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error exporting data to Excel");
    }
  };

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
    const currentSubjects = getCurrentSubjects();
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

  const addSubject = () => {
    if (!newSubject.trim()) {
      alert("Please enter a subject name");
      return;
    }

    if (!selectedBatch) {
      alert("Please select a batch first");
      return;
    }

    const currentBatchSubjects = subjects[selectedBatch] || {};
    const currentSemesterSubjects =
      currentBatchSubjects[selectedSemester] || [];
    const currentSubjectNames = currentSemesterSubjects.map((s) => s.name);

    if (currentSubjectNames.includes(newSubject.trim())) {
      alert("Subject already exists for this semester");
      return;
    }

    const newSubjectObj = {
      name: newSubject.trim(),
      maxMarks: newSubjectMaxMarks,
    };

    setSubjects((prev) => ({
      ...prev,
      [selectedBatch]: {
        ...prev[selectedBatch],
        [selectedSemester]: [...currentSemesterSubjects, newSubjectObj],
      },
    }));

    // Initialize marks for existing students in this batch/semester/section for the new subject
    setStudents((prev) =>
      prev.map((student) => {
        if (
          student.batch === selectedBatch &&
          student.semester === selectedSemester &&
          student.section === selectedSection
        ) {
          return {
            ...student,
            marks: {
              ...student.marks,
              [newSubject.trim()]: 0,
            },
          };
        }
        return student;
      })
    );

    setNewSubject("");
    setNewSubjectMaxMarks(100);
  };

  const removeSubject = (subjectToRemove) => {
    if (!selectedBatch) return;

    if (
      !confirm(
        `Are you sure you want to remove ${subjectToRemove} from ${selectedBatch} Semester ${selectedSemester}? This will delete all marks for this subject.`
      )
    ) {
      return;
    }

    const currentBatchSubjects = subjects[selectedBatch] || {};
    const currentSemesterSubjects =
      currentBatchSubjects[selectedSemester] || [];

    setSubjects((prev) => ({
      ...prev,
      [selectedBatch]: {
        ...prev[selectedBatch],
        [selectedSemester]: currentSemesterSubjects.filter(
          (subject) => subject.name !== subjectToRemove
        ),
      },
    }));

    // Remove the subject from all students in this batch and semester
    setStudents((prev) =>
      prev.map((student) => {
        if (
          student.batch === selectedBatch &&
          student.semester === selectedSemester
        ) {
          const newMarks = { ...student.marks };
          delete newMarks[subjectToRemove];
          return {
            ...student,
            marks: newMarks,
          };
        }
        return student;
      })
    );
  };

  const startEditingMaxMarks = (subjectName, currentMaxMarks) => {
    setEditingSubject(subjectName);
    setEditingMaxMarksValue(currentMaxMarks);
  };

  const saveMaxMarks = (subjectName) => {
    if (!selectedBatch) return;

    const currentBatchSubjects = subjects[selectedBatch] || {};
    const currentSemesterSubjects =
      currentBatchSubjects[selectedSemester] || [];

    const updatedSubjects = currentSemesterSubjects.map((subject) =>
      subject.name === subjectName
        ? { ...subject, maxMarks: parseInt(editingMaxMarksValue) || 100 }
        : subject
    );

    setSubjects((prev) => ({
      ...prev,
      [selectedBatch]: {
        ...prev[selectedBatch],
        [selectedSemester]: updatedSubjects,
      },
    }));

    setEditingSubject(null);
    setEditingMaxMarksValue(100);
  };

  const cancelEditingMaxMarks = () => {
    setEditingSubject(null);
    setEditingMaxMarksValue(100);
  };

  const addBatch = () => {
    if (!newBatch.trim() || isNaN(newBatch)) {
      alert("Please enter a valid batch year (e.g., 2024)");
      return;
    }

    const batchId = newBatch.trim();
    if (batches.find((b) => b.id === batchId)) {
      alert("Batch already exists");
      return;
    }

    if (newBatchSemesters < 1 || newBatchSemesters > 12) {
      alert("Please enter a valid number of semesters (1-12)");
      return;
    }

    const newBatchObj = {
      id: batchId,
      name: `${batchId} Batch`,
      startYear: parseInt(batchId),
      active: true,
      semesters: newBatchSemesters,
    };

    setBatches((prev) => [...prev, newBatchObj]);

    // Initialize subjects for the new batch with max marks
    const newBatchSubjects = {};
    for (let semester = 1; semester <= newBatchSemesters; semester++) {
      newBatchSubjects[semester] = [
        { name: "Mathematics", maxMarks: 100 },
        { name: "Physics", maxMarks: 100 },
        { name: "Chemistry", maxMarks: 100 },
        { name: "Programming", maxMarks: 100 },
        { name: "English", maxMarks: 100 },
      ];
    }

    setSubjects((prev) => ({
      ...prev,
      [batchId]: newBatchSubjects,
    }));

    setNewBatch("");
    setNewBatchSemesters(6); // Reset to default 6 semesters
  };

  const addSemesterToBatch = (batchId) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    if (batch.semesters >= 12) {
      alert("Maximum 12 semesters allowed");
      return;
    }

    const updatedBatches = batches.map((b) =>
      b.id === batchId ? { ...b, semesters: b.semesters + 1 } : b
    );

    setBatches(updatedBatches);

    // Add empty subjects for the new semester
    const newSemester = batch.semesters + 1;
    setSubjects((prev) => ({
      ...prev,
      [batchId]: {
        ...prev[batchId],
        [newSemester]: [
          { name: "Mathematics", maxMarks: 100 },
          { name: "Physics", maxMarks: 100 },
          { name: "Chemistry", maxMarks: 100 },
          { name: "Programming", maxMarks: 100 },
          { name: "English", maxMarks: 100 },
        ],
      },
    }));

    // Update sections
    setSections((prev) => ({
      ...prev,
      [newSemester]: [`${newSemester}A`, `${newSemester}B`, `${newSemester}C`],
    }));
  };

  const removeSemesterFromBatch = (batchId) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch || batch.semesters <= 1) {
      alert("Cannot remove the only semester");
      return;
    }

    // Check if there are students in the last semester
    const studentsInLastSemester = students.filter(
      (s) => s.batch === batchId && s.semester === batch.semesters
    );

    if (studentsInLastSemester.length > 0) {
      if (
        !confirm(
          `There are ${studentsInLastSemester.length} students in semester ${batch.semesters}. Removing this semester will delete these students. Continue?`
        )
      ) {
        return;
      }
      // Remove students from the last semester
      setStudents((prev) =>
        prev.filter(
          (s) => !(s.batch === batchId && s.semester === batch.semesters)
        )
      );
    }

    const updatedBatches = batches.map((b) =>
      b.id === batchId ? { ...b, semesters: b.semesters - 1 } : b
    );

    setBatches(updatedBatches);

    // Remove the last semester from subjects
    setSubjects((prev) => {
      const updatedSubjects = { ...prev };
      if (updatedSubjects[batchId]) {
        delete updatedSubjects[batchId][batch.semesters];
      }
      return updatedSubjects;
    });

    // If current selected semester is the removed one, select the previous semester
    if (selectedBatch === batchId && selectedSemester === batch.semesters) {
      setSelectedSemester(batch.semesters - 1);
    }
  };

  const removeBatch = (batchId) => {
    if (batches.length <= 1) {
      alert("Cannot remove the only batch");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to remove ${batchId} batch? This will delete all students and subjects for this batch.`
      )
    ) {
      return;
    }

    setBatches((prev) => prev.filter((b) => b.id !== batchId));

    // Remove students from this batch
    setStudents((prev) => prev.filter((s) => s.batch !== batchId));

    // Remove subjects for this batch
    setSubjects((prev) => {
      const newSubjects = { ...prev };
      delete newSubjects[batchId];
      return newSubjects;
    });

    // Select another batch if current batch is removed
    if (selectedBatch === batchId) {
      const remainingBatches = batches.filter((b) => b.id !== batchId);
      if (remainingBatches.length > 0) {
        setSelectedBatch(remainingBatches[0].id);
      } else {
        setSelectedBatch("");
      }
    }
  };

  const getCurrentSubjects = () => {
    if (!selectedBatch) return [];
    return subjects[selectedBatch]?.[selectedSemester] || [];
  };

  const getChartData = () => {
    if (!selectedBatch) return [];

    const currentSubjects = getCurrentSubjects();
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

  // Sorting function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get filtered and sorted students
  const getFilteredAndSortedStudents = () => {
    let filtered = students.filter(
      (s) =>
        selectedBatch &&
        s.batch === selectedBatch &&
        s.semester === selectedSemester &&
        s.section === selectedSection
    );

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.rollNo.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.key === "name") {
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
        } else if (sortConfig.key === "rollNo") {
          aVal = a.rollNo.toLowerCase();
          bVal = b.rollNo.toLowerCase();
        } else if (sortConfig.key === "average") {
          const currentSubjects = getCurrentSubjects();
          const calcAvg = (student) => {
            const totalMarks = currentSubjects.reduce(
              (sum, sub) => sum + (student.marks[sub.name] || 0),
              0
            );
            const totalMaxMarks = currentSubjects.reduce(
              (sum, sub) => sum + (sub.maxMarks || 100),
              0
            );
            return totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
          };
          aVal = calcAvg(a);
          bVal = calcAvg(b);
        } else {
          return 0;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const filteredStudents = getFilteredAndSortedStudents();

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

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

  const chartData = getChartData();
  const performanceData = getStudentPerformance();
  const currentSubjects = getCurrentSubjects();
  const studentOptions = getStudentOptions();

  // Get current batch for semester dropdown
  const currentBatch = batches.find((b) => b.id === selectedBatch);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Student Marks Management System
          </h1>
          <p className="text-gray-600">
            AI-Powered Academic Performance Tracking
          </p>
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
                  setNewStudent((prev) => ({
                    ...prev,
                    semester: sem,
                    section: sections[sem]?.[0] || "1A",
                  }));
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
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setNewStudent((prev) => ({
                    ...prev,
                    section: e.target.value,
                  }));
                }}
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
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Download size={20} />
              Export
            </button>
          </div>
        </div>

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
                  {tab === "manage" && (
                    <Users size={20} className="inline mr-2" />
                  )}
                  {tab === "subjects" && (
                    <BookOpen size={20} className="inline mr-2" />
                  )}
                  {tab === "batches" && (
                    <Calendar size={20} className="inline mr-2" />
                  )}
                  {tab === "analytics" && (
                    <TrendingDown size={20} className="inline mr-2" />
                  )}
                  {tab === "insights" && (
                    <AlertCircle size={20} className="inline mr-2" />
                  )}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>

          <div className="p-6">
            {activeTab === "manage" && (
              <div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Add New Student
                  </h3>
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
                      No subjects available. Please add subjects in the Subjects
                      tab.
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
                          <th
                            key={subjectObj.name}
                            className="px-4 py-2 text-left"
                          >
                            <div>{subjectObj.name}</div>
                            <div className="text-xs font-normal text-gray-500">
                              Max: {subjectObj.maxMarks || 100}
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-2 text-left">
                          <button
                            onClick={() => handleSort("average")}
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            Avg %
                            <ArrowUpDown size={14} />
                          </button>
                        </th>
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
                          (sum, subjectObj) =>
                            sum + (subjectObj.maxMarks || 100),
                          0
                        );
                        const avgPercentage =
                          totalMaxMarks > 0
                            ? ((totalMarks / totalMaxMarks) * 100).toFixed(1)
                            : 0;

                        return (
                          <tr
                            key={student.id}
                            className="border-b hover:bg-gray-50"
                          >
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
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
            )}

            {activeTab === "subjects" && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Add New Subject for {selectedBatch} - Semester{" "}
                    {selectedSemester}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Enter subject name"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Maximum Marks"
                      min="1"
                      max="1000"
                      value={newSubjectMaxMarks}
                      onChange={(e) =>
                        setNewSubjectMaxMarks(parseInt(e.target.value) || 100)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={addSubject}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Add Subject
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Current Subjects for {selectedBatch} - Semester{" "}
                    {selectedSemester} ({currentSubjects.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentSubjects.map((subjectObj) => (
                      <div
                        key={subjectObj.name}
                        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-medium text-lg">
                            {subjectObj.name}
                          </span>
                          <button
                            onClick={() => removeSubject(subjectObj.name)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            disabled={currentSubjects.length <= 1}
                            title={
                              currentSubjects.length <= 1
                                ? "Cannot remove the only subject"
                                : "Remove subject"
                            }
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Maximum Marks:
                          </span>
                          {editingSubject === subjectObj.name ? (
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                value={editingMaxMarksValue}
                                onChange={(e) =>
                                  setEditingMaxMarksValue(
                                    parseInt(e.target.value) || 100
                                  )
                                }
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={() => saveMaxMarks(subjectObj.name)}
                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                title="Save"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={cancelEditingMaxMarks}
                                className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100"
                                title="Cancel"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {subjectObj.maxMarks || 100}
                              </span>
                              <button
                                onClick={() =>
                                  startEditingMaxMarks(
                                    subjectObj.name,
                                    subjectObj.maxMarks || 100
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                title="Edit maximum marks"
                              >
                                <Target size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {currentSubjects.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No subjects added for this semester. Add subjects using
                      the form above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "batches" && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Add New Batch</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Enter batch year (e.g., 2024)"
                      value={newBatch}
                      onChange={(e) => setNewBatch(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Number of Semesters"
                      min="1"
                      max="12"
                      value={newBatchSemesters}
                      onChange={(e) =>
                        setNewBatchSemesters(parseInt(e.target.value) || 6)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={addBatch}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add Batch
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Manage Batches ({batches.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-medium block text-lg">
                              {batch.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              Students:{" "}
                              {
                                students.filter((s) => s.batch === batch.id)
                                  .length
                              }
                            </span>
                            <div className="text-sm text-gray-600 mt-1">
                              Semesters: {batch.semesters}
                            </div>
                          </div>
                          <button
                            onClick={() => removeBatch(batch.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            disabled={batches.length <= 1}
                            title={
                              batches.length <= 1
                                ? "Cannot remove the only batch"
                                : "Remove batch"
                            }
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => addSemesterToBatch(batch.id)}
                            disabled={batch.semesters >= 12}
                            className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            title={
                              batch.semesters >= 12
                                ? "Maximum 12 semesters allowed"
                                : "Add semester"
                            }
                          >
                            <Plus size={14} />
                            Add Semester
                          </button>
                          <button
                            onClick={() => removeSemesterFromBatch(batch.id)}
                            disabled={batch.semesters <= 1}
                            className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            title={
                              batch.semesters <= 1
                                ? "Cannot remove the only semester"
                                : "Remove last semester"
                            }
                          >
                            <Trash2 size={14} />
                            Remove Semester
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-8">
                {/* Subject-wise Performance */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Subject-wise Performance
                  </h3>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="average"
                          fill="#3b82f6"
                          name="Average Marks"
                        />
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
                        onChange={(e) =>
                          setSelectedBatchForAnalytics(e.target.value)
                        }
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
                      {studentOptions.length === 0 &&
                        selectedBatchForAnalytics && (
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
                            (s) =>
                              s.id.toString() === selectedStudentForAnalytics
                          )?.name
                        }{" "}
                        (
                        {
                          students.find(
                            (s) =>
                              s.id.toString() === selectedStudentForAnalytics
                          )?.rollNo
                        }
                        )
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={studentPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="semester" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [`${value}%`, "Average"]}
                          />
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
                                <th className="px-4 py-2 text-left">
                                  Semester
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Average %
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Total Marks
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Max Marks
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentPerformanceData.map((data, index) => (
                                <tr
                                  key={index}
                                  className="border-b hover:bg-gray-50"
                                >
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
                                  <td className="px-4 py-2">
                                    {data.totalMarks}
                                  </td>
                                  <td className="px-4 py-2">
                                    {data.totalMaxMarks}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : selectedBatchForAnalytics &&
                    selectedStudentForAnalytics ? (
                    <div className="text-center py-8 text-gray-500">
                      No performance data available for the selected student
                      across semesters
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Please select a batch and student to view individual
                      performance
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
                            Students{" "}
                            {analyticsPage * studentsPerAnalyticsPage + 1}-
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
                              [
                                "#3b82f6",
                                "#10b981",
                                "#f59e0b",
                                "#ef4444",
                                "#8b5cf6",
                              ][idx % 5]
                            }
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {activeTab === "insights" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  AI-Powered Weak Student Detection
                </h3>
                <p className="text-gray-600 mb-6">
                  Students performing below 50% of maximum marks or scoring
                  below 70% of class average
                </p>

                {weakStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No students identified as weak in this section
                  </div>
                ) : (
                  <div className="space-y-4">
                    {weakStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          student.riskLevel === "high"
                            ? "bg-red-50 border-red-500"
                            : student.riskLevel === "medium"
                            ? "bg-yellow-50 border-yellow-500"
                            : "bg-blue-50 border-blue-500"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {student.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Roll No: {student.rollNo} | Batch: {student.batch}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-700">
                              Average: {student.avgMarks}%
                            </div>
                            <div
                              className={`text-xs font-semibold ${
                                student.riskLevel === "high"
                                  ? "text-red-600"
                                  : student.riskLevel === "medium"
                                  ? "text-yellow-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {student.riskLevel.toUpperCase()} RISK
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Weak Subjects:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {student.weakSubjects.map((subject) => (
                              <span
                                key={subject}
                                className="px-3 py-1 bg-white rounded-full text-sm font-medium"
                              >
                                {subject}: {student.marks[subject] || 0}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600">
              {filteredStudents.length}
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
              {filteredStudents.length > 0 && currentSubjects.length > 0
                ? (
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
                    }, 0) / filteredStudents.length
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMarksSystem;
