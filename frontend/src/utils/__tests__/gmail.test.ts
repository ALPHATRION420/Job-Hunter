import { describe, it, expect } from 'vitest';
import { getGmailComposeUrl, isEmailVerified } from '../gmail';

describe('Gmail Utility Tests', () => {
  describe('getGmailComposeUrl', () => {
    it('creates compose url with to parameter', () => {
      const url = getGmailComposeUrl('recruiter@google.com');
      expect(url).toContain('https://mail.google.com/mail/?');
      expect(url).toContain('view=cm');
      expect(url).toContain('fs=1');
      expect(url).toContain('to=recruiter%40google.com');
    });

    it('creates compose url with subject and body', () => {
      const url = getGmailComposeUrl(
        'recruiter@amazon.com',
        'Job Application: SDE 2',
        'Hello Recruiter, please find my resume.'
      );
      expect(url).toContain('to=recruiter%40amazon.com');
      expect(url).toContain('su=Job+Application%3A+SDE+2');
      expect(url).toContain('body=Hello+Recruiter%2C+please+find+my+resume.');
    });

    it('handles empty email gracefully', () => {
      const url = getGmailComposeUrl('');
      expect(url).toBe('https://mail.google.com/mail/?view=cm&fs=1');
    });
  });

  describe('isEmailVerified', () => {
    it('returns true when is_verified is true', () => {
      expect(isEmailVerified({
        recruiter_email: 'hr@swiggy.in',
        is_verified: true,
        recruiter_status: 'Verified'
      })).toBe(true);
    });

    it('returns true when recruiter_status is Verified', () => {
      expect(isEmailVerified({
        recruiter_email: 'recruiter@flipkart.com',
        recruiter_status: 'Verified'
      })).toBe(true);
    });

    it('returns false when unverified or missing email', () => {
      expect(isEmailVerified({
        recruiter_email: 'unknown@company.com',
        is_verified: false,
        recruiter_status: 'Unverified'
      })).toBe(false);

      expect(isEmailVerified({
        recruiter_email: '',
        recruiter_status: 'Verified'
      })).toBe(false);

      expect(isEmailVerified(null)).toBe(false);
    });
  });
});
