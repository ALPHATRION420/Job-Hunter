@echo off
title JobHunter AI - Autonomous Multi-Target Job Scraper & HR Hunter
color 0A
echo ======================================================================
echo          JobHunter AI - Autonomous Multi-Target HR Contact Hunter
echo ======================================================================
echo.
echo [1/3] Scraping Indian & Global Job Portals (Naukri, LinkedIn, Instahyre)...
echo [2/3] Extracting Verified Recruiter Direct Emails & Generating Excel...
echo [3/3] Preparing Auto Cold Outreach with Resume Document Attached...
echo.

cd /d "%~dp0"
python run_auto_job_hunter.py %*

echo.
echo ======================================================================
echo   Done! Target HR Contacts scraped and Excel/CSV spreadsheets generated.
echo ======================================================================
pause
