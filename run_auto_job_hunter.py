import os
import sys
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 70)
print("🚀 JobHunter AI - Autonomous 1-Click Job & HR Contact Automation")
print("=" * 70)

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
script_path = os.path.join(backend_dir, "scripts", "india_job_scraper.py")

# Default settings (can be overridden via CLI args)
keyword = sys.argv[1] if len(sys.argv) > 1 else "Full Stack Developer"
location = sys.argv[2] if len(sys.argv) > 2 else "Bangalore"

cmd = [
    sys.executable,
    script_path,
    "--keyword", keyword,
    "--location", location,
    "--count", "15",
    "--auto-email"
]

print(f"📍 Target Role: {keyword} | City: {location}")
print("🔄 Running Scraper, Excel Generator, and HR Auto-Emailer...\n")

res = subprocess.run(cmd, cwd=backend_dir)

excel_file = os.path.join(backend_dir, "HR_Contacts_India.xlsx")
if os.path.exists(excel_file):
    print(f"\n📂 Opening generated Excel spreadsheet: {excel_file}")
    try:
        os.startfile(excel_file)
    except Exception as e:
        print(f"Excel generated at: {excel_file}")

sys.exit(res.returncode)
