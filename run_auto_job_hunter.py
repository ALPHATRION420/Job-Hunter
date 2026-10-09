import os
import sys
import argparse
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 75)
print("🚀 JobHunter AI - Autonomous 1-Click Multi-Role & Multi-Location HR Automation")
print("=" * 75)

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
script_path = os.path.join(backend_dir, "scripts", "india_job_scraper.py")

parser = argparse.ArgumentParser(description="Run 1-Click Multi-Role and Multi-Location HR Contact Scraper")
parser.add_argument("positional_role", nargs="?", default=None, help="Target role or keyword (positional)")
parser.add_argument("positional_location", nargs="?", default=None, help="Target location or city (positional)")
parser.add_argument("--roles", "-r", nargs="+", default=None, help="One or more target job roles")
parser.add_argument("--locations", "-l", nargs="+", default=None, help="One or more target locations")
parser.add_argument("--count", "-c", type=int, default=30, help="Number of jobs & HR contacts to extract")
parser.add_argument("--auto-email", action="store_true", help="Enable automatic cold email dispatch to recruiters")

args, unknown = parser.parse_known_args()

target_roles = []
if args.roles:
    target_roles.extend(args.roles)
elif args.positional_role:
    if "," in args.positional_role:
        target_roles.extend([r.strip() for r in args.positional_role.split(",") if r.strip()])
    else:
        target_roles.append(args.positional_role)

target_locations = []
if args.locations:
    target_locations.extend(args.locations)
elif args.positional_location:
    if "," in args.positional_location:
        target_locations.extend([loc.strip() for loc in args.positional_location.split(",") if loc.strip()])
    else:
        target_locations.append(args.positional_location)

cmd = [
    sys.executable,
    script_path,
    "--count", str(args.count)
]

if args.auto_email:
    cmd.append("--auto-email")

if target_roles:
    cmd.append("--roles")
    cmd.extend(target_roles)

if target_locations:
    cmd.append("--locations")
    cmd.extend(target_locations)

print(f"🎯 Target Roles: {', '.join(target_roles) if target_roles else 'Auto-detect from candidate profile'}")
print(f"📍 Target Locations: {', '.join(target_locations) if target_locations else 'Auto-detect from candidate profile'}")
print(f"📊 Target Contact Count: {args.count}")
print("🔄 Running Scraper, HR Contact Miner, Excel Generator, and Outreach Agent...\n")

res = subprocess.run(cmd, cwd=backend_dir)

excel_file = os.path.join(backend_dir, "HR_Contacts_India.xlsx")
if os.path.exists(excel_file):
    print(f"\n📂 Generated Excel spreadsheet ready: {excel_file}")
    try:
        os.startfile(excel_file)
    except Exception:
        print(f"Excel generated at: {excel_file}")

sys.exit(res.returncode)
