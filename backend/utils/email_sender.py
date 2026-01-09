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

def send_confirmation_email(student_email, student_name, course_name):
    if not EMAIL_USER or not EMAIL_PASS:
        print("Error: EMAIL_USER or EMAIL_PASS missing in .env")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = f"MIET Admissions <{EMAIL_USER}>"
        msg['To'] = student_email
        msg['Subject'] = f"Success: {course_name} Registration"

        html = f"""
        <h3>Hello {student_name},</h3>
        <p>Your application for <b>{course_name}</b> has been received.</p>
        <p>We will contact you soon for the next steps.</p>
        <hr>
        <p><small>MIET Arts & Science College, Trichy</small></p>
        """
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
        
        print(f"Email sent to {student_email}")
        return True
    except Exception as e:
        print(f"Email Error: {e}")
        return False
