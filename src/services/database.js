// Enhanced Database service with proper persistence
export const DatabaseService = {
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
