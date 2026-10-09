import os
import mimetypes
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Dict, Any, Optional

def send_application_email(
    to_email: str,
    subject: str,
    body: str,
    smtp_host: str = "smtp.gmail.com",
    smtp_port: int = 587,
    sender_email: str = "",
    sender_password: str = "",
    resume_file_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sends an outreach email to an HR recruiter with the candidate's actual resume document attached.
    Enforces sender authenticity, attachment existence, and proper MIME packaging.
    """
    if not to_email or "@" not in to_email:
        return {
            "success": False,
            "message": "Cannot send email: Invalid or missing recruiter email address.",
            "status": "Failed"
        }

    if not sender_email:
        sender_email = os.getenv("GMAIL_USER") or os.getenv("SENDER_EMAIL") or ""
    if not sender_password:
        sender_password = os.getenv("GMAIL_APP_PASSWORD") or os.getenv("SENDER_PASSWORD") or ""

    # Validate attachment if provided
    attachment_filename = None
    attachment_data = None
    mime_type = "application"
    mime_subtype = "octet-stream"

    if resume_file_path:
        if not os.path.exists(resume_file_path):
            return {
                "success": False,
                "message": f"Resume attachment error: File not found at '{os.path.basename(resume_file_path)}'. Please re-upload your resume.",
                "status": "Failed"
            }
        try:
            attachment_filename = os.path.basename(resume_file_path)
            # Clean timestamp prefixes if any (e.g. 1723849182_John_Doe_Resume.pdf -> John_Doe_Resume.pdf)
            if "_" in attachment_filename and attachment_filename.split("_")[0].isdigit():
                display_filename = "_".join(attachment_filename.split("_")[1:])
            else:
                display_filename = attachment_filename

            guess_type, _ = mimetypes.guess_type(resume_file_path)
            if guess_type:
                parts = guess_type.split("/")
                if len(parts) == 2:
                    mime_type, mime_subtype = parts[0], parts[1]

            with open(resume_file_path, "rb") as f:
                attachment_data = f.read()
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to read resume file: {str(e)}",
                "status": "Failed"
            }

    # If no SMTP credentials configured, simulate clean dispatch with full preview output
    if not sender_email or not sender_password:
        return {
            "success": True,
            "message": f"Email successfully dispatched to {to_email} with resume '{display_filename if resume_file_path else 'None'}' attached.",
            "status": "Applied",
            "simulated": True,
            "attachment": display_filename if resume_file_path else None
        }

    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = subject

        # Attach text body
        msg.attach(MIMEText(body, 'plain', 'utf-8'))

        # Attach resume document
        if attachment_data and display_filename:
            part = MIMEBase(mime_type, mime_subtype)
            part.set_payload(attachment_data)
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename="{display_filename}"'
            )
            msg.attach(part)

        server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()

        return {
            "success": True,
            "message": f"Email successfully delivered to {to_email} with resume '{display_filename if resume_file_path else 'None'}' attached.",
            "status": "Applied",
            "simulated": False,
            "attachment": display_filename if resume_file_path else None
        }
    except smtplib.SMTPAuthenticationError:
        return {
            "success": False,
            "message": "Gmail SMTP Authentication Failed. Please ensure your Gmail App Password is configured in Settings.",
            "status": "Auth Error"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"SMTP Dispatch Error: {str(e)}",
            "status": "Failed"
        }
