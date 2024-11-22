import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [formData, setFormData] = useState({
    name: "",
    subjects: [
      { name: "Math", marks: "" },
      { name: "Science", marks: "" },
      { name: "English", marks: "" },
    ],
  });
  const [aggregateResults, setAggregateResults] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("Math");

  const handleInputChange = (e, subjectIndex) => {
    const { value } = e.target;
    const newSubjects = [...formData.subjects];
    newSubjects[subjectIndex].marks = value;

    setFormData((prev) => ({
      ...prev,
      subjects: newSubjects,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/student", {
        name: formData.name,
        subjects: formData.subjects.map((subject) => ({
          name: subject.name,
          marks: Number(subject.marks),
        })),
      });

      setFormData({
        name: "",
        subjects: [
          { name: "Math", marks: "" },
          { name: "Science", marks: "" },
          { name: "English", marks: "" },
        ],
      });

      fetchAggregateData();
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const fetchAggregateData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/aggregate");
      setAggregateResults(response.data);
    } catch (error) {
      console.error("Error fetching aggregate data:", error);
    }
  };

  useEffect(() => {
    fetchAggregateData();
  }, []);

  return (
    <div className="bg-zinc-900 text-white min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-600 mb-6">
          Student Performance Dashboard
        </h1>

        {/* Top 3 Rankings */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-purple-600 mb-4">
            Top 3 Overall Rankings {" "}
            <span>
              (Average)
            </span>
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => {
              const ranking = aggregateResults?.overallRankings[index];
              return (
                <div
                  key={index}
                  className="bg-zinc-700 rounded-lg p-3 text-center"
                  style={{
                    background:
                      index === 0
                        ? "linear-gradient(to bottom, #854d0e, #a16207)"
                        : "bg-zinc-700",
                  }}
                >
                  <div className="text-lg font-bold text-yellow-400">
                    {index + 1}
                  </div>
                  <div className="text-white">
                    {ranking
                      ? `${ranking.name}\n(${ranking.averageMarks.toFixed(2)})`
                      : "- - -"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student Input Form */}
        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Student Name"
              className="w-full p-3 mb-4 bg-zinc-700 text-white rounded border-none focus:ring-2 focus:ring-purple-600"
              required
            />
            {formData.subjects.map((subject, index) => (
              <div key={subject.name} className="mb-4">
                <label className="block text-purple-600 mb-2">
                  {subject.name}
                </label>
                <input
                  type="number"
                  value={subject.marks}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder={`${subject.name} Marks`}
                  className="w-full p-3 bg-zinc-700 text-white rounded border-none focus:ring-2 focus:ring-purple-600"
                  min="0"
                  max="100"
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full p-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Add Student Marks
            </button>
          </form>
        </div>

        {/* Subject Selector and Table */}
        {aggregateResults && (
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 mb-4 bg-zinc-800 text-white rounded"
            >
              {aggregateResults.subjects.map((subject) => (
                <option key={subject} value={subject} className="bg-zinc-900">
                  {subject}
                </option>
              ))}
            </select>

            <div className="bg-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-700">
                    <th className="p-3 text-left text-purple-600">Name</th>
                    <th className="p-3 text-right text-purple-600">
                      {selectedSubject} Marks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aggregateResults.studentData
                    .filter((student) =>
                      student.subjects.some(
                        (s) =>
                          s.name.toLowerCase() === selectedSubject.toLowerCase()
                      )
                    )
                    .map((student, index) => {
                      const subjectMarks = student.subjects.find(
                        (s) =>
                          s.name.toLowerCase() === selectedSubject.toLowerCase()
                      );
                      return (
                        <tr
                          key={index}
                          className="border-t border-zinc-700 hover:bg-zinc-700"
                        >
                          <td className="p-3">{student.name}</td>
                          <td className="p-3 text-right">
                            {subjectMarks ? subjectMarks.marks : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
