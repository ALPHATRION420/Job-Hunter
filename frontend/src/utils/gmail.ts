/**
 * Utilities for Gmail compose linking and verified email status.
 */

/**
 * Generates a direct Gmail compose URL that opens Gmail in compose mode
 * with the recipient pre-filled in the 'To:' field.
 */
export const getGmailComposeUrl = (email: string, subject?: string, body?: string): string => {
  const cleanEmail = (email || '').trim();
  if (!cleanEmail) return 'https://mail.google.com/mail/?view=cm&fs=1';
  
  const params = new URLSearchParams();
  params.set('view', 'cm');
  params.set('fs', '1');
  params.set('to', cleanEmail);
  if (subject && subject.trim()) {
    params.set('su', subject.trim());
  }
  if (body && body.trim()) {
    params.set('body', body.trim());
  }
  return `https://mail.google.com/mail/?${params.toString()}`;
};

/**
 * Determines whether a job contact's email is verified by Hunter.io.
 * Only verified emails should be displayed according to requirements.
 */
export const isEmailVerified = (contact?: { recruiter_email?: string; recruiter_status?: string; is_verified?: boolean } | null): boolean => {
  if (!contact || !contact.recruiter_email) return false;
  const email = contact.recruiter_email.trim();
  if (!email || !email.includes('@')) return false;
  
  return Boolean(contact.is_verified || (contact.recruiter_status || '').toLowerCase() === 'verified');
};
