import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_confirmation_email(student_email, student_name, course_name, application_id="N/A", submission_date=None):
    if not EMAIL_USER or not EMAIL_PASS:
        print("Error: EMAIL_USER or EMAIL_PASS missing in .env")
        return False

    if not submission_date:
        from datetime import datetime
        submission_date = datetime.now().strftime("%d %b %Y, %I:%M %p")

    try:
        msg = MIMEMultipart()
        msg['From'] = f"MIET Admissions Support <{EMAIL_USER}>"
        msg['To'] = student_email
        msg['Subject'] = f"Application Received: {course_name} (ID: {application_id})"

        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e1e8f0; border-radius: 12px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h2 style="color: #003366; margin-top: 0; border-bottom: 2px solid #003366; padding-bottom: 10px;">Application Received</h2>
                
                <p>Dear <strong>{student_name}</strong>,</p>
                <p>Thank you for choosing <strong>M.I.E.T.Arts & Science College</strong>. Your admission form for <strong>{course_name}</strong> has been successfully submitted.</p>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #edf2f7;">
                    <p style="margin: 5px 0; color: #4a5568;"><strong>Application ID:</strong> #MIET-{application_id}</p>
                    <p style="margin: 5px 0; color: #4a5568;"><strong>Submitted Date:</strong> {submission_date}</p>
                </div>
                
                <p>Our admissions team will review your details and contact you within 2-3 business days regarding the next steps.</p>
                
                <div style="margin-top: 35px; border-top: 1px solid #edf2f7; padding-top: 20px;">
                    <p style="margin: 0; font-size: 0.95em; color: #2d3748;">Best regards,</p>
                    <p style="margin: 5px 0; font-weight: bold; color: #003366;">MIET Admissions Support Team</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #a0aec0;">
                M.I.E.T.Arts & Science College, Trichy - 620007
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
        
        print(f"Professional confirmation email sent to {student_email} (ID: {application_id})")
        return True
    except Exception as e:
        print(f"Email Error: {e}")
        return False
