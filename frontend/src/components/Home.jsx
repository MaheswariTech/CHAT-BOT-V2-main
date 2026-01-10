import React from 'react';
import { GraduationCap, BookOpen, Users, Phone, CheckCircle, Bot } from 'lucide-react';

const Home = () => {
    return (
        <div className="home">
            <nav className="navbar" style={{
                padding: '20px 0',
                background: 'var(--white)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: 'var(--primary)',
                        fontWeight: '800',
                        fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
                        letterSpacing: '-0.5px'
                    }}>
                        <GraduationCap size={32} style={{ flexShrink: 0 }} />
                        <span>M.I.E.T.Arts & Science College</span>
                    </div>
                    <div style={{ display: 'flex', gap: '30px', fontWeight: '500', alignItems: 'center' }}>
                        <a href="#home">Home</a>
                        <a href="#about">About</a>
                        <a href="#courses">Courses</a>
                        <a href="/apply" style={{
                            padding: '8px 20px',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '20px',
                            textDecoration: 'none'
                        }}>Apply Now</a>
                    </div>
                </div>
            </nav>

            <section className="hero" style={{
                padding: '100px 0',
                background: 'linear-gradient(135deg, var(--primary) 0%, #0055aa 100%)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container animate">
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px' }}>Excellence in Education</h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 40px', opacity: 0.9 }}>
                        Join MIET Arts and Science College and shape your future with our world-class facilities and expert faculty.
                    </p>
                    <button
                        onClick={() => window.location.href = '/apply'}
                        style={{
                            padding: '15px 40px',
                            fontSize: '1.1rem',
                            background: 'var(--secondary)',
                            color: 'var(--primary)',
                            border: 'none',
                            borderRadius: '30px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Apply for Admission 2026
                    </button>
                </div>
            </section>

            <section className="live-support" style={{
                padding: '60px 0',
                background: '#f0f7ff',
                borderBottom: '1px solid #e1e8f0'
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '50px', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '400px' }}>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '15px' }}>Instant AI Support</h2>
                        <p style={{ color: '#445566', lineHeight: '1.6', marginBottom: '20px' }}>
                            Our intelligent helpdesk is live 24/7 to answer your questions about courses, fees, and admissions instantly.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#003366', fontWeight: '500' }}>
                                <CheckCircle size={18} color="#28a745" /> 2-Minute Smart Session Reset
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#003366', fontWeight: '500' }}>
                                <CheckCircle size={18} color="#28a745" /> Live Enrollment Assistance
                            </li>
                        </ul>
                    </div>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '25px',
                        boxShadow: '0 20px 40px rgba(0,51,102,0.08)',
                        border: '1px solid #edf2f7',
                        textAlign: 'center'
                    }}>
                        <Bot size={48} color="var(--primary)" style={{ marginBottom: '15px' }} />
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00cc44' }}>● Live Now</div>
                        <p style={{ fontSize: '13px', color: '#667788', marginTop: '5px' }}>Average response: &lt; 2s</p>
                    </div>
                </div>
            </section>

            <section id="features" style={{ padding: '80px 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                        <div className="feature-card" style={{ padding: '40px', background: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <BookOpen size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                            <h3>Quality Courses</h3>
                            <p>A wide range of undergraduate and postgraduate programs.</p>
                        </div>
                        <div className="feature-card" style={{ padding: '40px', background: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <Users size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                            <h3>Expert Faculty</h3>
                            <p>Experienced professors dedicated to student success.</p>
                        </div>
                        <div className="feature-card" style={{ padding: '40px', background: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <Phone size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                            <h3>24/7 Support</h3>
                            <p>Get your queries answered by our AI Helpdesk instantly.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    );
};

export default Home;
