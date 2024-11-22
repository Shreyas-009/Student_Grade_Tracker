require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const StudentSchema = new mongoose.Schema({
  name: String,
  subjects: [
    {
      name: String,
      marks: Number,
    },
  ],
});

const Student = mongoose.model("Student", StudentSchema);

// Route to add student with multiple subject marks
app.post("/student", async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route for aggregate operations
app.get("/aggregate", async (req, res) => {
  try {
    // Aggregate across all students
    const allStudents = await Student.find();

    // Calculate overall performance
    const overallRankings = allStudents
      .map((student) => ({
        name: student.name,
        averageMarks:
          student.subjects.reduce((sum, subject) => sum + subject.marks, 0) /
          student.subjects.length,
      }))
      .sort((a, b) => b.averageMarks - a.averageMarks);

    // Subject-wise top performers
    const subjectToppers = {};
    const subjects = ["Math", "Science", "English"];

    subjects.forEach((subject) => {
      const subjectToppers = allStudents
        .map((student) => {
          const subjectMarks = student.subjects.find(
            (s) => s.name.toLowerCase() === subject.toLowerCase()
          );
          return subjectMarks
            ? {
                name: student.name,
                marks: subjectMarks.marks,
              }
            : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.marks - a.marks);

      subjectToppers.sort = (a, b) => b.marks - a.marks;
    });

    res.json({
      overallRankings: overallRankings.slice(0, 3),
      studentData: allStudents,
      subjects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});