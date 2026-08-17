import io
import csv
from typing import List, Dict, Any

def generate_csv_bytes(jobs: List[Dict[str, Any]]) -> bytes:
    """
    Generates a UTF-8 encoded CSV file buffer from a list of job/HR dictionary objects.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Write Header
    writer.writerow([
        "ID",
        "Company Name",
        "Job Title",
        "Location",
        "Work Type",
        "Job Type",
        "Salary (LPA / Stipend)",
        "Experience Level",
        "HR Recruiter Name",
        "HR Recruiter Email",
        "HR Verification Status",
        "Match Score (%)",
        "Required Skills",
        "Source Portal",
        "Job Description Snippet",
        "Job Application Link"
    ])

    # Write Data Rows
    for j in jobs:
        skills_str = ", ".join(j.get("required_skills", [])) if isinstance(j.get("required_skills"), list) else str(j.get("required_skills", ""))
        desc_snippet = (j.get("description", "") or "").replace("\n", " ")[:200]
        writer.writerow([
            j.get("id", ""),
            j.get("company", ""),
            j.get("title", ""),
            j.get("location", ""),
            j.get("work_type", ""),
            j.get("job_type", ""),
            j.get("salary", ""),
            j.get("experience_level", ""),
            j.get("recruiter_name", "Hiring Team"),
            j.get("recruiter_email", ""),
            j.get("recruiter_status", "Pending"),
            f"{j.get('match_score', 0)}%",
            skills_str,
            j.get("source_portal", ""),
            desc_snippet,
            j.get("source_url", "")
        ])

    return output.getvalue().encode('utf-8-sig')


def generate_excel_bytes(jobs: List[Dict[str, Any]]) -> bytes:
    """
    Generates a styled native Excel (.xlsx) file buffer from job/HR dictionary objects.
    - HR Recruiter Email cells → active mailto: hyperlinks (blue, underlined)
    - Job Application Link cells → active https:// hyperlinks (blue, underlined)
    - Frozen header row, alternating row fills, auto-width columns.
    Falls back to CSV if openpyxl is not installed.
    """
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.utils import get_column_letter

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "HR Contacts & Jobs India"
        ws.freeze_panes = "A2"            # Freeze header row

        # ── Column definitions ──────────────────────────────────────────────
        headers = [
            "ID", "Company", "Job Title", "Location", "Work Type",
            "Job Type", "Salary / Package", "Experience",
            "HR Recruiter Name", "HR Recruiter Email",
            "HR Status", "Match %",
            "Required Skills", "Source Portal",
            "Job Description", "Job Application Link",
        ]
        COL_EMAIL    = 10   # "HR Recruiter Email"  (1-indexed)
        COL_JOB_LINK = 16   # "Job Application Link" (1-indexed)
        COL_DESC     = 15   # "Job Description"

        # ── Styles ──────────────────────────────────────────────────────────
        hdr_font    = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        hdr_fill    = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")

        alt_fill    = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")  # light stripe

        verified_fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
        verified_font = Font(name="Calibri", size=10, bold=True, color="166534")
        pending_fill  = PatternFill(start_color="FEF9C3", end_color="FEF9C3", fill_type="solid")
        pending_font  = Font(name="Calibri", size=10, color="854D0E")

        link_font  = Font(name="Calibri", size=10, color="1D4ED8", underline="single")
        body_font  = Font(name="Calibri", size=10)

        thin_border = Border(
            left=Side(style="thin", color="CBD5E1"),
            right=Side(style="thin", color="CBD5E1"),
            top=Side(style="thin", color="CBD5E1"),
            bottom=Side(style="thin", color="CBD5E1"),
        )

        # ── Header row ──────────────────────────────────────────────────────
        ws.append(headers)
        for col_num, _ in enumerate(headers, start=1):
            cell = ws.cell(row=1, column=col_num)
            cell.font      = hdr_font
            cell.fill      = hdr_fill
            cell.border    = thin_border
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

        ws.row_dimensions[1].height = 30

        # ── Data rows ───────────────────────────────────────────────────────
        for row_num, j in enumerate(jobs, start=2):
            skills_str  = ", ".join(j.get("required_skills", [])) if isinstance(j.get("required_skills"), list) else str(j.get("required_skills", ""))
            desc_snippet = (j.get("description", "") or "").replace("\n", " ")[:250]
            status       = j.get("recruiter_status", "Pending")
            email        = (j.get("recruiter_email", "") or "").strip()
            job_url      = (j.get("source_url", "") or "").strip()
            is_alt       = (row_num % 2 == 0)

            row_values = [
                j.get("id", ""),
                j.get("company", ""),
                j.get("title", ""),
                j.get("location", ""),
                j.get("work_type", ""),
                j.get("job_type", ""),
                j.get("salary", ""),
                j.get("experience_level", ""),
                j.get("recruiter_name", "Hiring Team"),
                email,                          # col 10 — will get mailto hyperlink
                status,
                f"{j.get('match_score', 0)}%",
                skills_str,
                j.get("source_portal", ""),
                desc_snippet,                   # col 15
                job_url,                        # col 16 — will get https hyperlink
            ]
            ws.append(row_values)

            for col_idx, _ in enumerate(headers, start=1):
                c = ws.cell(row=row_num, column=col_idx)
                c.border    = thin_border
                c.alignment = Alignment(vertical="center", wrap_text=(col_idx == COL_DESC))
                c.font      = body_font

                if is_alt and col_idx not in (COL_EMAIL, COL_JOB_LINK, 11):
                    c.fill = alt_fill

                # ── HR Email → mailto: hyperlink ────────────────────────────
                if col_idx == COL_EMAIL and email:
                    c.value     = email
                    c.hyperlink = f"mailto:{email}"
                    c.font      = link_font

                # ── HR Status badge ─────────────────────────────────────────
                elif col_idx == 11:
                    c.alignment = Alignment(horizontal="center", vertical="center")
                    if "Verified" in status:
                        c.fill = verified_fill
                        c.font = verified_font
                    else:
                        c.fill = pending_fill
                        c.font = pending_font

                # ── Job Link → clickable https:// hyperlink ─────────────────
                elif col_idx == COL_JOB_LINK and job_url:
                    c.value     = "🔗 Apply Here"
                    c.hyperlink = job_url
                    c.font      = link_font
                    c.alignment = Alignment(horizontal="center", vertical="center")

        # ── Column widths ────────────────────────────────────────────────────
        custom_widths = {
            1: 6,    # ID
            2: 22,   # Company
            3: 36,   # Job Title
            4: 22,   # Location
            5: 12,   # Work Type
            6: 12,   # Job Type
            7: 18,   # Salary
            8: 16,   # Experience
            9: 30,   # HR Name
            10: 34,  # HR Email
            11: 18,  # HR Status
            12: 10,  # Match %
            13: 40,  # Skills
            14: 16,  # Source Portal
            15: 45,  # Description
            16: 16,  # Job Link
        }
        for col_letter_idx, width in custom_widths.items():
            ws.column_dimensions[get_column_letter(col_letter_idx)].width = width

        # ── Save ─────────────────────────────────────────────────────────────
        buf = io.BytesIO()
        wb.save(buf)
        return buf.getvalue()

    except ImportError:
        return generate_csv_bytes(jobs)

