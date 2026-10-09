import io
import csv
from typing import List, Dict, Any

def generate_csv_bytes(jobs: List[Dict[str, Any]]) -> bytes:
    """
    Generates a UTF-8 encoded CSV file buffer from a list of job/HR dictionary objects.
    Includes recruiter email and recruiter phone numbers for outreach.
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
        "HR Recruiter Phone / WhatsApp",
        "HR Verification Status",
        "Match Score (%)",
        "Required Skills",
        "Source Portal",
        "Job Description Snippet",
        "Job Application Link"
    ])

    # Write Data Rows — Hunter.io contacts bubble to the top
    def _sort_key(j):
        src = (j.get("source_portal") or j.get("source") or "").lower()
        status = (j.get("recruiter_status") or "").lower()
        if "hunter" in src:
            return 0
        if "verified" in status:
            return 1
        if j.get("recruiter_email"):
            return 2
        return 3

    for j in sorted(jobs, key=_sort_key):
        skills_str = ", ".join(j.get("required_skills", [])) if isinstance(j.get("required_skills"), list) else str(j.get("required_skills", ""))
        desc_snippet = (j.get("description", "") or "").replace("\n", " ")[:200]
        src = (j.get("source_portal") or j.get("source") or "").lower()
        status_label = "via Hunter.io" if "hunter" in src else j.get("recruiter_status", "Verified")
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
            j.get("recruiter_phone", ""),
            status_label,
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
    - HR Recruiter Phone cells → clean formatted phone / tel link
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
            "HR Recruiter Name", "HR Recruiter Email", "HR Recruiter Phone",
            "HR Status", "Match %",
            "Required Skills", "Source Portal",
            "Job Description", "Job Application Link",
        ]
        COL_EMAIL    = 10   # "HR Recruiter Email"  (1-indexed)
        COL_PHONE    = 11   # "HR Recruiter Phone"  (1-indexed)
        COL_STATUS   = 12   # "HR Status"           (1-indexed)
        COL_DESC     = 16   # "Job Description"
        COL_JOB_LINK = 17   # "Job Application Link" (1-indexed)

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

        # ── Style additions for Hunter.io rows ──────────────────────────────
        hunter_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")  # gold tint
        hunter_font = Font(name="Calibri", size=10, bold=True, color="92400E")                   # amber text
        hunter_status_fill = PatternFill(start_color="F59E0B", end_color="F59E0B", fill_type="solid")  # amber badge
        hunter_status_font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")             # white text on amber

        # ── Sort: Hunter.io contacts float to top, then Verified, then rest ──
        def _sort_key(j):
            src = (j.get("source_portal") or j.get("source") or "").lower()
            status = (j.get("recruiter_status") or "").lower()
            if "hunter" in src:
                return 0
            if "verified" in status:
                return 1
            if j.get("recruiter_email"):
                return 2
            return 3

        sorted_jobs = sorted(jobs, key=_sort_key)

        # ── Data rows ───────────────────────────────────────────────────────
        for row_num, j in enumerate(sorted_jobs, start=2):
            skills_str  = ", ".join(j.get("required_skills", [])) if isinstance(j.get("required_skills"), list) else str(j.get("required_skills", ""))
            desc_snippet = (j.get("description", "") or "").replace("\n", " ")[:250]
            status       = j.get("recruiter_status", "Verified")
            email        = (j.get("recruiter_email", "") or "").strip()
            phone        = (j.get("recruiter_phone", "") or "").strip()
            job_url      = (j.get("source_url", "") or "").strip()
            is_alt       = (row_num % 2 == 0)

            src = (j.get("source_portal") or j.get("source") or "").lower()
            is_hunter = "hunter" in src
            status_label = "via Hunter.io" if is_hunter else j.get("recruiter_status", "Verified")

            def _s(val):
                if isinstance(val, list):
                    return ", ".join(str(x) for x in val)
                return str(val) if val is not None else ""

            row_values = [
                j.get("id", ""),
                _s(j.get("company", "")),
                _s(j.get("title", "")),
                _s(j.get("location", "")),
                _s(j.get("work_type", "")),
                _s(j.get("job_type", "")),
                _s(j.get("salary", "")),
                _s(j.get("experience_level", "")),
                _s(j.get("recruiter_name", "Hiring Team")),
                email,
                phone,
                status_label,
                f"{j.get('match_score', 0)}%",
                skills_str,
                _s(j.get("source_portal", "")),
                desc_snippet,
                job_url,
            ]
            ws.append(row_values)

            for col_idx, _ in enumerate(headers, start=1):
                c = ws.cell(row=row_num, column=col_idx)
                c.border    = thin_border
                c.alignment = Alignment(vertical="center", wrap_text=(col_idx == COL_DESC))
                c.font      = body_font

                # ── Hunter.io row: full gold row tint ───────────────────────
                if is_hunter and col_idx not in (COL_EMAIL, COL_JOB_LINK, COL_STATUS):
                    c.fill = hunter_fill
                elif is_alt and col_idx not in (COL_EMAIL, COL_JOB_LINK, COL_STATUS):
                    c.fill = alt_fill

                # ── HR Email → mailto: hyperlink ────────────────────────────
                if col_idx == COL_EMAIL and email:
                    c.value     = email
                    c.hyperlink = f"mailto:{email}"
                    c.font      = link_font
                    if is_hunter:
                        c.fill = hunter_fill

                # ── HR Status badge ─────────────────────────────────────────
                elif col_idx == COL_STATUS:
                    c.alignment = Alignment(horizontal="center", vertical="center")
                    if is_hunter:
                        c.fill = hunter_status_fill
                        c.font = hunter_status_font
                    elif "Verified" in status_label:
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
            9: 28,   # HR Name
            10: 34,  # HR Email
            11: 20,  # HR Phone
            12: 16,  # HR Status
            13: 10,  # Match %
            14: 40,  # Skills
            15: 16,  # Source Portal
            16: 45,  # Description
            17: 16,  # Job Link
        }
        for col_letter_idx, width in custom_widths.items():
            ws.column_dimensions[get_column_letter(col_letter_idx)].width = width

        # ── Save ─────────────────────────────────────────────────────────────
        buf = io.BytesIO()
        wb.save(buf)
        return buf.getvalue()

    except ImportError:
        return generate_csv_bytes(jobs)
