import React, { useState } from "react";
import { Plus, Trash2, Save, Target } from "lucide-react";

const SubjectManagement = ({
  subjects,
  setSubjects,
  students,
  setStudents,
  selectedBatch,
  selectedSemester,
  selectedSection,
  currentSubjects,
}) => {
  const [newSubject, setNewSubject] = useState("");
  const [newSubjectMaxMarks, setNewSubjectMaxMarks] = useState(100);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingMaxMarksValue, setEditingMaxMarksValue] = useState(100);

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

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          Add New Subject for {selectedBatch} - Semester {selectedSemester}
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
          Current Subjects for {selectedBatch} - Semester {selectedSemester} (
          {currentSubjects.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentSubjects.map((subjectObj) => (
            <div
              key={subjectObj.name}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-medium text-lg">{subjectObj.name}</span>
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
                <span className="text-sm text-gray-600">Maximum Marks:</span>
                {editingSubject === subjectObj.name ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={editingMaxMarksValue}
                      onChange={(e) =>
                        setEditingMaxMarksValue(parseInt(e.target.value) || 100)
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
            No subjects added for this semester. Add subjects using the form
            above.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;
