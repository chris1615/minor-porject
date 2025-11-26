import React from "react";

const Insights = ({ weakStudents }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        AI-Powered Weak Student Detection
      </h3>
      <p className="text-gray-600 mb-6">
        Students performing below 50% of maximum marks or scoring below 70% of
        class average
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
                  <h4 className="font-semibold text-lg">{student.name}</h4>
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
  );
};

export default Insights;
