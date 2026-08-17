from typing import Dict, Any, List

def generate_personalized_email(
    candidate_name: str,
    candidate_skills: List[str],
    candidate_projects: List[Dict[str, Any]],
    candidate_experience: List[Dict[str, Any]],
    company_name: str,
    job_title: str,
    recruiter_name: str = "Hiring Manager",
    desired_role: str = None,
    tone: str = "Professional"
) -> Dict[str, str]:
    
    # Use explicit candidate desired target role if specified, fallback to job_title
    target_role = desired_role.strip() if (desired_role and desired_role.strip()) else job_title
    
    top_skills = ", ".join(candidate_skills[:4]) if candidate_skills else "Python, React, and Software Engineering"
    
    project_highlight = ""
    if candidate_projects:
        p = candidate_projects[0]
        project_highlight = f"In particular, my work on '{p.get('title', 'Full Stack Automation')}' ({', '.join(p.get('tech_stack', []))}) directly mirrors the core responsibilities for this position."
    else:
        project_highlight = "I have developed multiple full-stack scalable web applications utilizing automated API pipelines and modern component architecture."

    experience_highlight = ""
    if candidate_experience:
        exp = candidate_experience[0]
        experience_highlight = f"During my time at {exp.get('company', 'TechNova')}, {exp.get('description', 'I developed microservices and responsive user interfaces.')}"
    else:
        experience_highlight = "My hands-on technical background includes designing modular REST APIs and responsive user interfaces."

    salutation = f"Dear {recruiter_name}," if recruiter_name and recruiter_name != "Hiring Team" else "Dear Hiring Manager,"

    # Subject line with explicit desired role
    subject = f"Application for {target_role} role at {company_name} - {candidate_name}"

    # Body with explicit desired role
    body = f"""{salutation}

I am writing to express my strong enthusiasm for joining {company_name} in the position of {target_role}. With solid technical expertise in {top_skills}, I am confident in my ability to make an immediate, impactful contribution to your engineering team.

{project_highlight} {experience_highlight}

What excites me about {company_name} is your commitment to innovative software solutions. I thrive in collaborative environments, write clean, testable code, and enjoy taking complex technical challenges from concept to production.

I have attached my resume for your review and would welcome the opportunity to discuss how my background aligns with your goals for the {target_role} position.

Thank you for your time and consideration.

Warm regards,

{candidate_name}
"""


    # Custom Cover Letter
    cover_letter = f"""{candidate_name}
{candidate_name.lower().replace(' ', '.')}@email.com | +1 (555) 234-5678

{company_name} Hiring Team
Re: Application for {job_title}

Dear Selection Committee,

I am applying for the position of {job_title} at {company_name}. Having closely followed {company_name}'s recent projects, I am eager to apply my technical background in {top_skills} to assist your team in building robust, performant systems.

Key Technical Highlights:
• Demonstrated proficiency in {top_skills} with a focus on scalable software engineering.
• Hands-on project experience: {project_highlight}
• Proven track record: {experience_highlight}

I am excited about the prospect of bringing my dedication and technical problem-solving abilities to {company_name}. Thank you for reviewing my application.

Sincerely,

{candidate_name}
"""

    return {
        "subject": subject,
        "body": body.strip(),
        "cover_letter": cover_letter.strip()
    }
