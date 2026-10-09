import os
import re
import asyncio
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

async def scrape_linkedin_hr(
    company_name: str, 
    job_title: str = "HR Recruiter",
    target_location: str = "India",
    linkedin_url: Optional[str] = None,
    allow_profile_navigation: bool = True
) -> Dict[str, Any]:
    """
    Headless browser script to mine recruiter profiles & HR contact details from LinkedIn
    for specific companies, target roles, and Indian/Global locations.
    """
    clean_company = company_name.strip() if company_name else "Tech Employer"
    clean_domain = clean_company.lower().replace(" ", "").replace(".", "").replace(",", "").replace("&", "").replace("-", "")
    
    # Try parsing company name or person name if a LinkedIn URL was passed as company_name or linkedin_url
    target_url = linkedin_url or (company_name if company_name and "linkedin.com" in company_name else "")
    url_name_extracted = ""

    if target_url:
        match_in = re.search(r"linkedin\.com/in/([a-zA-Z0-9\-]+)", target_url)
        match_company = re.search(r"linkedin\.com/company/([a-zA-Z0-9\-]+)", target_url)
        match_job = re.search(r"linkedin\.com/jobs/view/([0-9]+)", target_url)
        
        if match_in:
            slug = match_in.group(1).replace("-", " ").title()
            url_name_extracted = slug
        elif match_company:
            clean_company = match_company.group(1).replace("-", " ").title()
            clean_domain = match_company.group(1).replace("-", "")

    # Determine role-specific email prefixes
    t_low = (job_title or "").lower()
    if "intern" in t_low or "campus" in t_low or "fresher" in t_low:
        role_prefix = "campus"
    elif "genai" in t_low or "llm" in t_low:
        role_prefix = "genai.talent"
    elif "mlops" in t_low:
        role_prefix = "mlops.hiring"
    elif "ai" in t_low or "data" in t_low or "ml" in t_low or "vision" in t_low:
        role_prefix = "ai.hiring"
    elif "security" in t_low or "cyber" in t_low or "soc" in t_low or "appsec" in t_low:
        role_prefix = "sec.hiring"
    elif "devops" in t_low or "cloud" in t_low or "sre" in t_low or "platform" in t_low:
        role_prefix = "devops.hiring"
    elif "product" in t_low or "tpm" in t_low:
        role_prefix = "product.talent"
    elif "design" in t_low or "ui" in t_low or "ux" in t_low:
        role_prefix = "design.talent"
    elif "mobile" in t_low or "android" in t_low or "ios" in t_low:
        role_prefix = "mobile.talent"
    elif "qa" in t_low or "sdet" in t_low:
        role_prefix = "qa.talent"
    elif "architect" in t_low or "staff" in t_low or "principal" in t_low:
        role_prefix = "engineering.leadership"
    else:
        role_prefix = "talent"

    linkedin_user = os.getenv("LINKEDIN_EMAIL", "").strip()
    linkedin_pass = os.getenv("LINKEDIN_PASSWORD", "").strip()

    mined_contacts: List[Dict[str, str]] = []
    log_messages: List[str] = []

    # Attempt Playwright browser profile mining if allowed
    if allow_profile_navigation:
        try:
            from playwright.async_api import async_playwright
            
            async with async_playwright() as p:
                log_messages.append(f"Initializing Playwright headless browser for {clean_company} ({job_title}) HR mining in {target_location}...")
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                )
                page = await context.new_page()

                if linkedin_user and linkedin_pass:
                    log_messages.append(f"Logging in to LinkedIn with user: {linkedin_user[:3]}***@***")
                    await page.goto("https://www.linkedin.com/login", timeout=15000)
                    await page.fill("#username", linkedin_user)
                    await page.fill("#password", linkedin_pass)
                    await page.click('button[type="submit"]')
                    await page.wait_for_timeout(3000)

                # Direct Profile / Job URL extraction if target_url was provided
                if target_url and "linkedin.com" in target_url:
                    log_messages.append(f"Opening provided LinkedIn profile URL: {target_url}")
                    await page.goto(target_url, timeout=15000)
                    await page.wait_for_timeout(2500)
                    
                    title_elem = await page.title()
                    
                    # Extract name from title or page
                    name_found = url_name_extracted or "LinkedIn Recruiter"
                    if " | LinkedIn" in title_elem:
                        name_found = title_elem.split(" | LinkedIn")[0].strip()
                    
                    first_n = name_found.split()[0].lower() if name_found else "recruiter"
                    # Do NOT guess email from domain — only use emails found in actual page content
                    page_text = await page.inner_text("body") or ""
                    import re as _re
                    page_emails = _re.findall(r'[\w.\-+]+@[\w.\-]+\.[a-zA-Z]{2,}', page_text)
                    blocked = ["no-reply", "noreply", "example.com", "sentry.io", "schema.org", "placeholder"]
                    real_emails = [e.lower() for e in page_emails if not any(b in e.lower() for b in blocked)]
                    est_mail = real_emails[0] if real_emails else ""
                    
                    mined_contacts.append({
                        "recruiter_name": name_found,
                        "recruiter_email": est_mail,
                        "verification_status": "Verified" if est_mail else "Unable to Verify",
                        "linkedin_url": target_url,
                        "role_focus": job_title,
                        "location": target_location,
                        "source": "Direct LinkedIn URL Profile Extraction"
                    })

                else:
                    # Search LinkedIn People / Recruiter profiles for company and role
                    search_query = f"{clean_company} recruiter {job_title} {target_location}".strip()
                    encoded_query = search_query.replace(" ", "%20")
                    search_url = f"https://www.linkedin.com/search/results/people/?keywords={encoded_query}"
                    
                    log_messages.append(f"Navigating to LinkedIn search: {search_url}")
                    await page.goto(search_url, timeout=15000)
                    await page.wait_for_timeout(2000)

                    cards = await page.query_selector_all(".reusable-search__result-container")
                    for card in cards[:3]:
                        text_content = await card.inner_text()
                        name_match = re.search(r"^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)", text_content)
                        link_elem = await card.query_selector("a.app-aware-link")
                        href = await link_elem.get_attribute("href") if link_elem else ""

                        if name_match:
                            found_name = name_match.group(1).strip()
                            # Extract real email from card text — do NOT guess from domain
                            import re as _re
                            card_emails = _re.findall(r'[\w.\-+]+@[\w.\-]+\.[a-zA-Z]{2,}', text_content)
                            blocked = ["no-reply", "noreply", "example.com", "sentry.io", "schema.org"]
                            real_card_emails = [e.lower() for e in card_emails if not any(b in e.lower() for b in blocked)]
                            est_email = real_card_emails[0] if real_card_emails else ""
                            mined_contacts.append({
                                "recruiter_name": found_name,
                                "recruiter_email": est_email,
                                "verification_status": "Verified" if est_email else "Unable to Verify",
                                "linkedin_url": href.split("?")[0] if href else f"https://www.linkedin.com/search/results/people/?keywords={encoded_query}",
                                "role_focus": job_title,
                                "location": target_location,
                                "source": "LinkedIn Playwright Mining"
                            })

                await browser.close()

        except Exception as e:
            log_messages.append(f"Playwright LinkedIn Scraper Note/Fallback: {str(e)}")

    else:
        log_messages.append("Profile navigation disabled by user setting. Using domain HR pattern heuristic.")

    # Fallback if no contacts mined via Playwright
    if not mined_contacts:
        rec_name = url_name_extracted or f"{clean_company} Talent Acquisition"
        rec_email = ""  # Do NOT generate or guess synthetic email addresses

        log_messages.append(f"No direct recruiter email address discovered from public sources for '{clean_company}' ({job_title}). Marked as Unable to Verify.")
        mined_contacts.append({
            "recruiter_name": rec_name,
            "recruiter_email": rec_email,
            "verification_status": "Unable to Verify",
            "linkedin_url": target_url or f"https://www.linkedin.com/company/{clean_domain}",
            "role_focus": job_title,
            "location": target_location,
            "source": "LinkedIn Search Discovery"
        })

    primary_contact = mined_contacts[0]
    return {
        "company": clean_company,
        "target_role": job_title,
        "target_location": target_location,
        "primary_recruiter_name": primary_contact["recruiter_name"],
        "primary_recruiter_email": primary_contact["recruiter_email"],
        "primary_linkedin_url": primary_contact["linkedin_url"],
        "verification_status": primary_contact.get("verification_status", "Verified" if primary_contact["recruiter_email"] else "Unable to Verify"),
        "all_contacts": mined_contacts,
        "logs": log_messages,
        "status": "Success"
    }


def run_sync_linkedin_hr_scrape(
    company_name: str, 
    job_title: str = "HR Recruiter",
    target_location: str = "India",
    linkedin_url: Optional[str] = None,
    allow_profile_navigation: bool = True
) -> Dict[str, Any]:
    """Synchronous wrapper for FastAPI and standalone execution."""
    return asyncio.run(scrape_linkedin_hr(company_name, job_title, target_location, linkedin_url, allow_profile_navigation))

if __name__ == "__main__":
    import sys
    comp = sys.argv[1] if len(sys.argv) > 1 else "Swiggy"
    role = sys.argv[2] if len(sys.argv) > 2 else "Software Engineer"
    loc = sys.argv[3] if len(sys.argv) > 3 else "Bangalore"
    res = run_sync_linkedin_hr_scrape(comp, role, loc)
    print(res)
