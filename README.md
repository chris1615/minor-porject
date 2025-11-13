Student Marks Management System
A comprehensive, AI-powered web application for managing student marks, tracking academic performance, and identifying at-risk students across multiple batches and semesters.

🌟 Features
🎯 Core Functionality

  Batch Management: Organize students by academic years (2021, 2022, 2023, etc.)

  Multi-Semester Support: Manage 6 semesters per batch with customizable sections

  Subject Management: Add/remove subjects with customizable maximum marks

  Student Management: Add, edit, and delete student records with marks

  Data Persistence: All data stored locally using browser storage

📊 Analytics & Insights

  Subject-wise Performance: Visualize average marks, pass/fail rates

  Individual Student Tracking: Monitor performance across all subjects

  AI-Powered Risk Detection: Automatically identify weak students

  Real-time Analytics: Dynamic charts and performance metrics

🔄 Data Management

  Excel/CSV Import: Bulk import student data from spreadsheets

  Excel Export: Download data for external analysis

  Batch Operations: Manage multiple batches simultaneously

🚀 Quick Start
Prerequisites

  Node.js (v14 or higher)

  npm or yarn

Installation

Clone the repository

bash

    git clone <repository-url>
    cd student-marks-system

Install dependencies

bash

    npm install

Start the development server

bash

    npm run dev

Open your browser

text

Navigate to http://localhost:3000

🛠 Technology Stack

  Frontend: React 18.2.0

  Charts: Recharts

  Icons: Lucide React

  Spreadsheets: SheetJS (xlsx)

  Styling: Tailwind CSS

  Build Tool: Vite

📁 Project Structure
text

Student Marks System/
├──index.html               # HTML template
├──package.json                 # Dependencies and scripts
├──vite.config.js              # Vite configuration
├──src/
    ├── StudentMarksSystem.jsx    # Main application component
    ├── main.jsx                  # React entry point

🎮 How to Use
1. Batch Management

    Navigate to the Batches tab

    Add new batches by entering the year (e.g., 2024)

    Remove existing batches (minimum one batch required)

2. Subject Configuration

    Go to the Subjects tab

    Add new subjects with custom maximum marks

    Edit maximum marks for existing subjects

    Remove subjects when needed

3. Student Management

    Use the Manage tab to add individual students

    Enter marks for each subject (respects maximum marks limits)

    Edit student marks directly in the table

    Delete students when necessary

4. Data Import/Export

    Import: Click "Import Excel/CSV" to bulk upload student data

    Export: Use "Export" to download current data as Excel file

5. Analytics & Insights

    Analytics Tab: View subject-wise performance charts

    Insights Tab: Identify at-risk students with AI-powered detection

🔧 Configuration
Default Setup

The system comes pre-configured with:

  Default Batches: 2021, 2022, 2023

  Default Subjects per Semester: Mathematics, Physics, Chemistry, Programming, English

  Default Maximum Marks: 100 per subject

  Sections: 1A, 1B, 1C for each semester

Customization

  Modify default subjects in DatabaseService.getSubjects()

  Adjust risk thresholds in analyzeWeakStudents() function

  Customize sections in the sections state

🎨 Features in Detail
AI-Powered Weak Student Detection

  Identifies students scoring below 50% of maximum marks

  Flags students performing below 70% of class average

  Categorizes risk levels: High, Medium, Low

  Highlights weak subjects for each at-risk student

Smart Data Import

  Automatically detects new subjects from Excel files

  Maps spreadsheet columns to existing subject structure

  Handles various file formats (.xlsx, .xls, .csv)

Responsive Design

  Mobile-friendly interface

  Adaptive charts and tables

  Optimized for different screen sizes

📈 Analytics Features
Subject-wise Analytics

  Average marks per subject

  Pass/fail statistics

  Visual comparison across subjects

Student Performance

  Individual progress tracking

  Multi-subject performance trends

  Comparative analysis

🔒 Data Security & Privacy

  All data stored locally in browser

  No external data transmission

  Complete user control over data

🐛 Troubleshooting
Common Issues

  Data not persisting

   Ensure localStorage is enabled in browser

   Check browser storage limits

  Import errors

   Verify Excel file format matches expected columns

   Ensure subject names match existing structure

  Charts not loading

   Check browser console for errors

   Verify Recharts dependency is installed

Browser Support

  Chrome 90+

  Firefox 88+

  Safari 14+

  Edge 90+

📞 Support

For support and questions:

  Check the troubleshooting section above

  Review the code comments for implementation details

  Create an issue in the project repository
