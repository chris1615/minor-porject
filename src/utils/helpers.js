import * as XLSX from "xlsx";

export const getCurrentSubjects = (
  subjects,
  selectedBatch,
  selectedSemester
) => {
  if (!selectedBatch) return [];
  return subjects[selectedBatch]?.[selectedSemester] || [];
};

export const getFilteredAndSortedStudents = (
  students,
  selectedBatch,
  selectedSemester,
  selectedSection,
  searchTerm = "",
  sortConfig = {}
) => {
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

export const analyzeWeakStudents = (
  students,
  selectedBatch,
  selectedSemester,
  selectedSection,
  subjects
) => {
  if (!selectedBatch) return [];

  const currentSubjects = getCurrentSubjects(
    subjects,
    selectedBatch,
    selectedSemester
  );
  const filteredStudents = students.filter(
    (s) =>
      s.batch === selectedBatch &&
      s.semester === selectedSemester &&
      s.section === selectedSection
  );

  if (filteredStudents.length === 0) {
    return [];
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

  return weak;
};

export const analyzeIndividualStudentPerformance = (
  selectedBatchForAnalytics,
  selectedStudentForAnalytics,
  students,
  batches,
  subjects
) => {
  if (!selectedBatchForAnalytics || !selectedStudentForAnalytics) {
    return [];
  }

  const student = students.find(
    (s) => s.id.toString() === selectedStudentForAnalytics
  );
  if (!student) {
    return [];
  }

  const batch = batches.find((b) => b.id === selectedBatchForAnalytics);
  if (!batch) {
    return [];
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

  return performanceData;
};

export const handleFileUpload = (
  e,
  selectedBatch,
  selectedSemester,
  selectedSection,
  subjects,
  setSubjects,
  setStudents
) => {
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
          semester: parseInt(row.Semester || row.semester) || selectedSemester,
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

export const exportToExcel = (
  students,
  selectedBatch,
  selectedSemester,
  selectedSection,
  currentSubjects
) => {
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
