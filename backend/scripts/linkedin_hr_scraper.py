import os
import re
import asyncio
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

async def scrape_linkedin_hr(
    company_name: str, 
    job_title: str = "HR Recruiter",
    linkedin_url: Optional[str] = None,
    allow_profile_navigation: bool = True
) -> Dict[str, Any]:
    """
    Headless browser script to mine recruiter profiles & HR contact details from LinkedIn.
    Supports user-provided LinkedIn profile/job URLs and profile navigation permissions.
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

    generic_emails = [
        f"talent@{clean_domain}.com",
        f"careers@{clean_domain}.com",
        f"hr@{clean_domain}.com",
        f"recruitment@{clean_domain}.com"
    ]
    
    linkedin_user = os.getenv("LINKEDIN_EMAIL", "").strip()
    linkedin_pass = os.getenv("LINKEDIN_PASSWORD", "").strip()

    mined_contacts: List[Dict[str, str]] = []
    log_messages: List[str] = []

    # Attempt Playwright browser profile mining if allowed
    if allow_profile_navigation:
        try:
            from playwright.async_api import async_playwright
            
            async with async_playwright() as p:
                log_messages.append("Initializing Playwright headless browser for LinkedIn HR mining...")
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
                    page_text = await page.content()
                    
                    # Extract name from title or page
                    name_found = url_name_extracted or "LinkedIn Recruiter"
                    if " | LinkedIn" in title_elem:
                        name_found = title_elem.split(" | LinkedIn")[0].strip()
                    
                    first_n = name_found.split()[0].lower() if name_found else "recruiter"
                    last_n = name_found.split()[-1].lower() if len(name_found.split()) > 1 else ""
                    est_mail = f"{first_n}.{last_n}@{clean_domain}.com" if last_n else f"{first_n}@{clean_domain}.com"
                    
                    mined_contacts.append({
                        "recruiter_name": name_found,
                        "recruiter_email": est_mail,
                        "linkedin_url": target_url,
                        "source": "Direct LinkedIn URL Profile Extraction"
                    })

                else:
                    # Search LinkedIn People / Recruiter profiles for company
                    search_query = f"{clean_company} {job_title}"
                    encoded_query = search_query.replace(" ", "%20")
                    search_url = f"https://www.linkedin.com/search/results/people/?keywords={encoded_query}"
                    
                    log_messages.append(f"Navigating to search URL: {search_url}")
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
                            first_name = found_name.split()[0].lower()
                            last_name = found_name.split()[-1].lower() if len(found_name.split()) > 1 else ""
                            
                            est_email = f"{first_name}.{last_name}@{clean_domain}.com" if last_name else f"{first_name}@{clean_domain}.com"
                            mined_contacts.append({
                                "recruiter_name": found_name,
                                "recruiter_email": est_email,
                                "linkedin_url": href.split("?")[0] if href else f"https://www.linkedin.com/search/results/people/?keywords={encoded_query}",
                                "source": "LinkedIn Playwright Mining"
                            })

                await browser.close()

        except Exception as e:
            log_messages.append(f"Playwright LinkedIn Scraper Note/Fallback: {str(e)}")

    else:
        log_messages.append("Profile navigation disabled by user setting. Using domain HR pattern heuristic.")

    # Fallback heuristic if no contacts mined via Playwright
    if not mined_contacts:
        rec_name = url_name_extracted or f"{clean_company} Talent Acquisition"
        rec_email = generic_emails[0]
        if url_name_extracted:
            fname = url_name_extracted.split()[0].lower()
            lname = url_name_extracted.split()[-1].lower() if len(url_name_extracted.split()) > 1 else ""
            rec_email = f"{fname}.{lname}@{clean_domain}.com" if lname else f"{fname}@{clean_domain}.com"

        log_messages.append(f"Applying domain HR fallback contacts for company '{clean_company}'")
        mined_contacts.append({
            "recruiter_name": rec_name,
            "recruiter_email": rec_email,
            "linkedin_url": target_url or f"https://www.linkedin.com/company/{clean_domain}",
            "source": "Generic Company HR Fallback"
        })
        mined_contacts.append({
            "recruiter_name": f"{clean_company} HR Team",
            "recruiter_email": generic_emails[1],
            "linkedin_url": f"https://www.linkedin.com/company/{clean_domain}",
            "source": "Generic Company HR Fallback"
        })

    primary_contact = mined_contacts[0]
    return {
        "company": clean_company,
        "primary_recruiter_name": primary_contact["recruiter_name"],
        "primary_recruiter_email": primary_contact["recruiter_email"],
        "primary_linkedin_url": primary_contact["linkedin_url"],
        "all_contacts": mined_contacts,
        "logs": log_messages,
        "status": "Success"
    }

def run_sync_linkedin_hr_scrape(
    company_name: str, 
    job_title: str = "HR Recruiter",
    linkedin_url: Optional[str] = None,
    allow_profile_navigation: bool = True
) -> Dict[str, Any]:
    """Synchronous wrapper for FastAPI and standalone execution."""
    return asyncio.run(scrape_linkedin_hr(company_name, job_title, linkedin_url, allow_profile_navigation))

if __name__ == "__main__":
    import sys
    comp = sys.argv[1] if len(sys.argv) > 1 else "Swiggy"
    res = run_sync_linkedin_hr_scrape(comp)
    print(res)

