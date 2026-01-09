import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, Mail, Phone, GraduationCap, MapPin,
  CheckCircle, ChevronRight, ChevronLeft,
  School, Award, Book, AlertCircle
} from 'lucide-react';
import './Admission.css';
import confetti from 'canvas-confetti';

const AdmissionForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [options, setOptions] = useState({
    categories: ["Undergraduate (UG)", "Postgraduate (PG)", "Research Programs"],
    courses: {
      "Undergraduate (UG)": [
        "B.A. English", "B.Com", "B.Com (Computer Applications)", "B.B.A",
        "B.Sc Physics", "B.Sc Mathematics", "B.Sc Computer Science",
        "B.Sc Data Science", "B.Sc Biochemistry", "B.Sc Microbiology", "B.C.A"
      ],
      "Postgraduate (PG)": [
        "M.A. English", "M.Com", "M.Sc Computer Science",
        "M.Sc Biochemistry", "M.C.A"
      ],
      "Research Programs": [
        "Ph.D. in Commerce (Full-time)", "Ph.D. in Commerce (Part-time)"
      ]
    }
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    category: '',
    course: '',
    address: '',
    marks: '',
    prevCollege: ''
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.post('http://localhost:8000/admission-options');
        if (response.data && response.data.categories && response.data.courses) {
          setOptions(response.data);
        }
      } catch (error) {
        console.error("Error fetching admission options:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { course: '' } : {})
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const [emailStatus, setEmailStatus] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post('http://localhost:8000/submit-admission', formData);
      if (response.data.status === 'success') {
        setEmailStatus(response.data.email_sent);
        setSubmitted(true);
        triggerConfetti();
      } else {
        alert("Submission error: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Application submission failed. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Validation checks with premium status
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));

  const isFieldValid = (name) => {
    if (!formData[name]) return false;
    if (name === 'email') return validateEmail(formData[name]);
    if (name === 'phone') return validatePhone(formData[name]);
    return formData[name].length > 2;
  };

  const getInputStyle = (name) => {
    if (!touched[name]) return {};
    return isFieldValid(name)
      ? { borderColor: '#28a745', background: '#f8fff9' }
      : { borderColor: '#dc3545', background: '#fff9f8' };
  };

  const isStep1Valid = isFieldValid('fullName') && isFieldValid('email') && isFieldValid('phone') && isFieldValid('address');
  const isStep2Valid = formData.category && formData.course;
  const isStep3Valid = formData.prevCollege && formData.marks;

  if (submitted) {
    return (
      <div className="admission-container">
        <div className="admission-card success-card" style={{ animation: 'cardFloat 3s ease-in-out infinite' }}>
          <div className="success-icon" style={{ background: '#28a745', color: 'white' }}>
            <CheckCircle size={50} />
          </div>
          <h2 style={{ fontSize: '2.5rem', color: '#002347', marginBottom: '15px', fontWeight: '800' }}>You're Registered!</h2>
          <p style={{ color: '#636e72', marginBottom: '30px', fontSize: '1.2rem', lineHeight: '1.6' }}>
            Congratulations <strong>{formData.fullName}</strong>!<br />
            Your application for <strong>{formData.course}</strong> is now in our system.
          </p>
          <div style={{
            background: 'rgba(0, 51, 102, 0.03)',
            padding: '25px',
            borderRadius: '20px',
            textAlign: 'left',
            marginBottom: '30px',
            border: '1px dashed #003366',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '-10px', right: '20px', background: emailStatus ? '#ffcc00' : '#dc3545', color: emailStatus ? 'black' : 'white', padding: '2px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold' }}>
              {emailStatus ? 'NEXT STEP: EMAIL CHECK' : 'ACTION REQUIRED: EMAIL FAILED'}
            </div>
            <p style={{ margin: '5px 0' }}><strong>Submission Reference:</strong> #MIET-{Date.now().toString().slice(-6)}</p>
            <p style={{ margin: '5px 0' }}><strong>Official Email:</strong> {formData.email}</p>
            <p style={{
              margin: '15px 0 0 0',
              fontSize: '0.9rem',
              color: emailStatus ? '#003366' : '#dc3545',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: emailStatus ? 'transparent' : 'rgba(220, 53, 69, 0.05)',
              padding: emailStatus ? '0' : '10px',
              borderRadius: '8px'
            }}>
              {emailStatus ? (
                <><Mail size={16} /> A premium confirmation email has been sent to you.</>
              ) : (
                <><AlertCircle size={16} /> <strong>Email alert:</strong> We couldn't send the confirmation. Registration is complete, but please check your App Password settings in .env.</>
              )}
            </p>
          </div>
          <button className="submit-btn" style={{ width: '100%' }} onClick={() => window.location.href = '/'}>Go Back Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admission-container">
      <div className="admission-card">
        <div className="stepper">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>{step > 1 ? '✓' : '1'}</div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>{step > 2 ? '✓' : '2'}</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>{step === 3 && !submitted ? '3' : '3'}</div>
        </div>

        <div className="admission-header">
          <h1 style={{ background: 'linear-gradient(135deg, #003366, #00509d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MIET Admissions 2026</h1>
          <p>
            {step === 1 && "Start your professional journey with your details."}
            {step === 2 && "Choose your specialization from our departments."}
            {step === 3 && "Complete your academic record for review."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-grid">
              <div className="section-title"><User size={20} /> Identity Details</div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Legal name as per certificates"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={getInputStyle('fullName')}
                />
              </div>
              <div className="form-group">
                <label><Mail size={16} /> Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={getInputStyle('email')}
                />
              </div>
              <div className="form-group">
                <label><Phone size={16} /> Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={getInputStyle('phone')}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label><MapPin size={16} /> Current Address</label>
                <textarea
                  name="address"
                  rows="3"
                  required
                  placeholder="Detailed residential address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={getInputStyle('address')}
                ></textarea>
              </div>
              <div className="btn-container" style={{ gridColumn: '1 / -1' }}>
                <button type="button" className="submit-btn" disabled={!isStep1Valid} onClick={nextStep}>
                  Continue to Course <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-grid">
              <div className="section-title"><Book size={20} /> Specialization</div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label><GraduationCap size={18} /> Grade Level</label>
                <select name="category" required value={formData.category} onChange={handleChange} onBlur={handleBlur} style={getInputStyle('category')}>
                  <option value="">Select Level</option>
                  {(options.categories || []).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {formData.category && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Department & Program</label>
                  <select name="course" required value={formData.course} onChange={handleChange} onBlur={handleBlur} style={getInputStyle('course')}>
                    <option value="">Select your course</option>
                    {(options.courses[formData.category] || []).map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="btn-container" style={{ gridColumn: '1 / -1' }}>
                <button type="button" className="back-btn" onClick={prevStep}><ChevronLeft size={20} /> Back</button>
                <button type="button" className="submit-btn" disabled={!isStep2Valid} onClick={nextStep}>
                  Academic Details <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-grid">
              <div className="section-title"><School size={20} /> Education History</div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Last Attended Institution / {formData.category.includes('PG') ? "University" : "School"}</label>
                <input
                  type="text"
                  name="prevCollege"
                  required
                  placeholder="Full name of previous school/college"
                  value={formData.prevCollege}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={getInputStyle('prevCollege')}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label><Award size={18} /> Aggregate Score (%)</label>
                <input
                  type="number"
                  name="marks"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 92.4"
                  value={formData.marks}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={getInputStyle('marks')}
                />
              </div>

              <div className="btn-container" style={{ gridColumn: '1 / -1' }}>
                <button type="button" className="back-btn" onClick={prevStep}><ChevronLeft size={20} /> Back</button>
                <button type="submit" className="submit-btn" disabled={submitting || !isStep3Valid} style={{ position: 'relative', overflow: 'hidden' }}>
                  {submitting ? 'Finalizing...' : 'Submit Official Application'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdmissionForm;
