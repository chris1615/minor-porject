import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const BatchManagement = ({
  batches,
  setBatches,
  subjects,
  setSubjects,
  students,
  setStudents,
  selectedBatch,
  setSelectedBatch,
  sections,
  setSections,
}) => {
  const [newBatch, setNewBatch] = useState("");
  const [newBatchSemesters, setNewBatchSemesters] = useState(6);

  // Function to count unique students in a batch
  const countUniqueStudentsInBatch = (batchId) => {
    const batchStudents = students.filter((s) => s.batch === batchId);
    const uniqueStudents = new Set(batchStudents.map((s) => s.rollNo));
    return uniqueStudents.size;
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
    setNewBatchSemesters(6);
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
      setSelectedBatch(batch.semesters - 1);
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

  return (
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
                    Students: {countUniqueStudentsInBatch(batch.id)}
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
  );
};

export default BatchManagement;
