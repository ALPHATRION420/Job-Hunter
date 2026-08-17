@echo off
title JobHunter AI - Autonomous Job Scraper & HR Auto-Mailer
color 0A
echo ======================================================================
echo          JobHunter AI - Autonomous Indian HR Contact Hunter
echo ======================================================================
echo.
echo [1/3] Scraping Indian Job Portals (Naukri, LinkedIn India, Instahyre)...
echo [2/3] Extracting HR Recruiter Contacts & Generating Excel...
echo [3/3] Dispatching Cold Outreach Application Emails with Resume Attached...
echo.

cd /d "%~dp0backend"
python scripts\india_job_scraper.py --keyword "Full Stack Developer" --location "Bangalore" --count 15 --auto-email

echo.
echo ======================================================================
echo   SUCCESS! Excel File Generated: HR_Contacts_India.xlsx
echo ======================================================================
echo Opening HR_Contacts_India.xlsx...
start HR_Contacts_India.xlsx

pause
