# 🚀 JobHunter AI — Work & Setup Plan for Tomorrow

> **Summary**: This document outlines everything completed in the JobHunter AI codebase, how to connect your Gmail account for live email outreach tomorrow, and how to execute 1-click automated job hunting.

---

## 📌 Tomorrow's 1-Minute Gmail Setup Checklist

To allow the autonomous agent to send real application emails directly from your personal Gmail inbox:

1. **Get 16-Character Gmail App Password**:
   - Open [Google Security Settings](https://myaccount.google.com/security).
   - Ensure **2-Step Verification** is enabled.
   - Search for **App passwords**, type `JobHunter AI`, and copy the 16-character code (e.g. `abcd efgh ijkl mnop`).

2. **Add Credentials to `backend/.env`**:
   - Open or create `d:\Job Finder\backend\.env` and paste:
     ```env
     GMAIL_USER=your_email@gmail.com
     GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
     ```

---

## ⚡ How to Run 1-Click Automation Tomorrow

### Option A: Double-Click Batch Launcher (Windows)
Double-click `run_auto_job_hunter.bat` in the root folder:
- [run_auto_job_hunter.bat](file:///d:/Job%20Finder/run_auto_job_hunter.bat)

### Option B: Terminal Command (Python)
Run from terminal in `d:\Job Finder\`:
```bash
python run_auto_job_hunter.py "Full Stack Developer" "Bangalore"
```
> *Tip: You can pass any desired target role (e.g. `"Software Engineer"`, `"Python Developer"`) and any Indian city (`"Bangalore"`, `"Remote"`, `"Gurgaon"`).*

---

## ✅ Completed System Architecture & Work Summary

1. **Autonomous Indian Job Scraper (`india_job_scraper.py`)**:
   - Crawles Indian tech job feeds across **Bangalore**, **Gurgaon/NCR**, **Mumbai**, **Hyderabad**, **Pune**, **Chennai**, and **Remote India**.
   - Extracts real company listings, LPA salary packages, required skills, and job descriptions.

2. **HR Recruiter Contact Extraction (`hr_finder.py`)**:
   - Dynamic regex extraction parses recruiter contacts directly from job descriptions or resolves official company talent gateways (`careers@{domain}`).

3. **Excel & CSV Spreadsheet Exporter (`excel_exporter.py`)**:
   - Generates styled native Excel file [HR_Contacts_India.xlsx](file:///d:/Job%20Finder/backend/HR_Contacts_India.xlsx) and CSV file [HR_Contacts_India.csv](file:///d:/Job%20Finder/backend/HR_Contacts_India.csv).
   - Automatically opens Excel upon completion.

4. **Resume Attachment & Desired Role Email Customizer (`email_generator.py`)**:
   - Uploaded PDF/DOCX resumes are stored in `uploads/resumes/` and attached automatically to every outgoing HR email.
   - Candidate desired target role is explicitly embedded into the **Email Subject** (`Application for Backend Developer role at Cred - Alex Morgan`) and **Email Body**.

5. **Ultra-Minimalist 3-Tab Web Dashboard**:
   - Streamlined UI with 3 essential tabs: 🔍 **Find Jobs & HRs**, 📄 **My Resume & Profile**, ✉️ **Sent Outreach Emails**.
   - Minimum salary expectation selector supporting **Per Month (₹/mo)** and **Per Year (LPA)** in Indian Rupees.
   - 100% dynamic analytics with zero fake hardcoded numbers or layout overlaps.

---

## 🎯 Action Items — Status

- [x] Add Gmail App Password to `backend/.env` (configured for `saxenad3000@gmail.com`).
- [x] Review sent application statuses in the **Sent Outreach Emails** tab.
- [x] Deploy frontend to Vercel, backend to Render.com.
- [x] Set `VITE_API_URL` to Render URL in Vercel dashboard environment variables.

---

## 📌 Planned Feature & Architecture Tasks for Tomorrow

- [x] **1. Headless LinkedIn HR Scraper Script**: Build a new dedicated scraper script using a headless browser framework (e.g., Playwright / Selenium) to navigate and mine recruiter profiles & HR contact details directly from LinkedIn.
- [x] **2. LinkedIn Auth & Generic HR Fallback**: Implement headless browser authentication using user-provided LinkedIn credentials to extract recruiter names and direct emails, falling back to generic company HR contacts (`hr@company.com`, `careers@company.com`).
- [x] **3. Automatic Resume Attachment**: Ensure 100% of outgoing cold application emails automatically attach the candidate's uploaded PDF/DOCX resume document (`uploads/resumes/`).
- [x] **4. Document-Centric "My Resume & Profile" Tab**: Streamline the "My Resume & Profile" view to focus strictly on document attachment management (uploading, replacing, and attaching the candidate resume file used for email dispatch).
- [x] **5. Essential-Only User Profile Data**: Simplify stored user profile fields to maintain only basic essential candidate details (Name, Email, Phone, Preferred Target Roles, Target Locations) without unnecessary metadata.
- [x] **6. Custom Job Post Selection for Outreach**: Allow the user to select specific job posts to be referenced and embedded into outgoing application emails.
- [x] **7. Ultra-Simplified Essential UI Design**: Streamline the site layout and interface so only essential features are displayed, creating a minimalist, clutter-free experience.
- [x] **8. Chronological Email Review & Edit Workflow**: Build a sequential step-by-step email review flow where the user can view pre-generated emails, edit content or write custom emails, and review/confirm each email in chronological order prior to dispatch.


