from typing import List, Dict, Any, Tuple

def calculate_job_match(
    candidate_skills: List[str],
    candidate_roles: List[str],
    job_title: str,
    job_description: str,
    required_skills: List[str]
) -> Dict[str, Any]:
    
    cand_skills_lower = set(s.lower() for s in candidate_skills)
    req_skills_lower = set(s.lower() for s in required_skills)
    
    # Also extract skills mentioned in job description
    desc_lower = job_description.lower()
    
    matching_skills = []
    missing_skills = []
    
    for skill in required_skills:
        s_lower = skill.lower()
        if s_lower in cand_skills_lower or any(c in s_lower for c in cand_skills_lower):
            matching_skills.append(skill)
        else:
            missing_skills.append(skill)
            
    # Check general skill overlap
    general_matches = []
    for cand_skill in candidate_skills:
        c_lower = cand_skill.lower()
        if c_lower in desc_lower and cand_skill not in matching_skills:
            general_matches.append(cand_skill)
            
    total_matches = len(matching_skills) + len(general_matches)
    total_required = max(len(required_skills), 1)
    
    # Base match ratio
    skill_score = min((total_matches / total_required) * 70, 70)
    
    # Role relevance boost (up to 20%)
    title_score = 0
    job_title_lower = job_title.lower()
    for role in candidate_roles:
        r_lower = role.lower()
        if r_lower in job_title_lower or any(word in job_title_lower for word in r_lower.split()):
            title_score = 20
            break
        elif "engineer" in job_title_lower or "developer" in job_title_lower or "intern" in job_title_lower:
            title_score = 15
            
    # Bonus for remote / tech alignment (up to 10%)
    bonus = 10 if total_matches >= 3 else (5 if total_matches >= 1 else 0)
    
    final_score = round(min(skill_score + title_score + bonus, 98), 1)
    
    # If final score is somehow lower than 50 but has 2+ matching skills, boost to reasonable match
    if final_score < 60 and total_matches >= 3:
        final_score = 75.0

    return {
        "match_score": final_score,
        "matching_skills": matching_skills + general_matches,
        "missing_skills": missing_skills,
        "is_eligible_auto_apply": final_score >= 70.0
    }
