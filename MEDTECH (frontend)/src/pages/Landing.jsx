// src/pages/Landing.jsx
import React, { useState, useEffect } from "react";
import {
  MapPin,
  Brain,
  Users,
  Menu,
  X,
  Calendar,
  CheckCircle,
  HelpCircle,
  Star,
  ArrowRight,
  Phone,
  Shield,
  Clock,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Landing.css";
import AmbulanceHelp from "../components/AmbulanceHelp"; // 👈 Import the new widget

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <h1 className="logo">
            <Heart size={28} className="logo-icon" />
            HealthEase
          </h1>
          <nav className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
            <a href="#features" onClick={() => setIsMenuOpen(false)}>
              Features
            </a>
            <a href="#how" onClick={() => setIsMenuOpen(false)}>
              How It Works
            </a>
            <a href="#testimonials" onClick={() => setIsMenuOpen(false)}>
              Testimonials
            </a>
            <a href="#faq" onClick={() => setIsMenuOpen(false)}>
              FAQ
            </a>
          </nav>
          <div className="nav-buttons">
            <Link to="/login" className="btn secondary">
              Log In
            </Link>
            <Link to="/signup" className="btn primary">
              Sign Up
            </Link>
          </div>
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="badge">
              <Shield size={16} />
              Trusted by 50,000+ patients
            </div>
            <h1>Smarter Healthcare. For Everyone.</h1>
            <p>
              Book appointments near you, get AI suggestions for the right
              specialist, or simply call our number. Accessible healthcare made
              simple.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn primary large">
                <Calendar size={18} /> Book Appointment
                <ArrowRight size={16} className="btn-arrow" />
              </Link>
              <Link to="/login" className="btn secondary large">
                <Brain size={18} /> Ask AI
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <strong>500+</strong>
                <span>Verified Doctors</span>
              </div>
              <div className="stat">
                <strong>24/7</strong>
                <span>Support Available</span>
              </div>
              <div className="stat">
                <strong>98%</strong>
                <span>Patient Satisfaction</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://static.vecteezy.com/system/resources/previews/002/127/142/original/medicine-and-healthcare-concept-illustration-health-examination-patient-consultation-can-use-for-web-homepage-mobile-apps-web-banner-character-cartoon-illustration-flat-style-free-vector.jpg"
              alt="Healthcare illustration"
              className="hero-img"
            />
            <div className="floating-card appointment-card">
              <Calendar size={20} />
              <div>
                <span>Next Available</span>
                <strong>Today, 4:30 PM</strong>
              </div>
            </div>
            <div className="floating-card doctor-card">
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&auto=format&fit=crop&q=60"
                alt="Doctor"
              />
              <div>
                <span>Dr. Sarah Miller</span>
                <div className="rating">
                  <Star size={14} fill="currentColor" />
                  <span>4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Why Choose HealthEase</h2>
          <p>Experience healthcare that puts you first</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Clock size={32} />
            </div>
            <h4>Quick Appointments</h4>
            <p>Book same-day appointments with top specialists in your area.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Brain size={32} />
            </div>
            <h4>AI-Powered Guidance</h4>
            <p>
              Our intelligent system helps you find the right doctor for your
              needs.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Phone size={32} />
            </div>
            <h4>Phone Support</h4>
            <p>Easy phone booking for those who prefer talking to a person.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={32} />
            </div>
            <h4>Secure & Private</h4>
            <p>Your health data is protected with enterprise-grade security.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="how">
        <div className="section-header">
          <h2>How HealthEase Works</h2>
          <p>3 simple steps to get the healthcare you need</p>
        </div>
        <div className="how-grid">
          <div className="how-card">
            <div className="step-number">1</div>
            <CheckCircle size={32} className="how-icon" />
            <h4>Step 1: Sign Up</h4>
            <p>Create your account with just a few clicks.</p>
          </div>
          <div className="how-card">
            <div className="step-number">2</div>
            <MapPin size={32} className="how-icon" />
            <h4>Step 2: Find a Doctor</h4>
            <p>Search nearby doctors or ask AI to guide you.</p>
          </div>
          <div className="how-card">
            <div className="step-number">3</div>
            <Calendar size={32} className="how-icon" />
            <h4>Step 3: Book & Visit</h4>
            <p>Book your slot and get timely healthcare service.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="section-header">
          <h2>Trusted by People Like You</h2>
          <p>See how HealthEase is making lives better</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <p>
              "Booking via phone was so easy for my father. A real blessing!"
            </p>
            <div className="testimonial-author">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60"
                alt="Reena"
              />
              <div>
                <strong>Reena</strong>
                <span>Daughter of patient</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <p>"The AI guided me to the right specialist in seconds."</p>
            <div className="testimonial-author">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60"
                alt="Ramesh"
              />
              <div>
                <strong>Ramesh</strong>
                <span>Software Engineer</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <p>"Finally, healthcare that feels modern, yet inclusive."</p>
            <div className="testimonial-author">
              <img
                src="https://i1.rgstatic.net/ii/profile.image/1109462827970561-1641527959165_Q128/Shanthi-Devi.jpg"
                alt="Shanthi Devi"
              />
              <div>
                <strong>Shanthi Devi</strong>
                <span>Retired Teacher</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know</p>
        </div>
        <div className="faq-list">
          {[
            {
              q: "Is HealthEase free to use?",
              a: "Yes, signing up and booking appointments is completely free. You only pay for the medical services you receive.",
            },
            {
              q: "How does the AI recommendation work?",
              a: "Our AI uses your symptoms and preferences to suggest the most relevant specialist. It analyzes thousands of data points to match you with the right doctor.",
            },
            {
              q: "Can elderly people use this easily?",
              a: "Yes! They can simply call our toll-free number and our friendly staff will assist them with booking appointments.",
            },
            {
              q: "How quickly can I get an appointment?",
              a: "Most users can book same-day or next-day appointments depending on availability in their area.",
            },
            {
              q: "Is my health information secure?",
              a: "Absolutely. We use industry-standard encryption and comply with all healthcare privacy regulations to keep your data safe.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`faq-item ${activeFAQ === index ? "active" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <HelpCircle size={20} />
                <span>{item.q}</span>
                <div className="faq-toggle">
                  {activeFAQ === index ? <X size={18} /> : <Menu size={18} />}
                </div>
              </div>
              <div className="faq-answer">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to take control of your healthcare?</h2>
          <p>Join thousands of satisfied patients today</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn primary large">
              Get Started Now
            </Link>
            <Link to="/login" className="btn secondary large">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">
              <Heart size={24} />
              HealthEase
            </h3>
            <p>Making healthcare accessible and convenient for everyone.</p>
            <div className="footer-contact">
              <p>
                <Phone size={16} /> 1-800-HEALTHY
              </p>
              <p>📧 contact@healthease.com</p>
            </div>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">Blog</a>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="#">Help Center</a>
            <a href="#">For Doctors</a>
            <a href="#">For Patients</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div className="footer-section">
            <h4>Download Our App</h4>
            <p>Book appointments on the go</p>
            <div className="app-badges">
              <button className="app-badge">App Store</button>
              <button className="app-badge">Google Play</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 HealthEase. All rights reserved.</p>
        </div>
      </footer>

      {/* 🚑 Floating Ambulance Help Widget */}
      <AmbulanceHelp />
    </div>
  );
};

export default Landing;
