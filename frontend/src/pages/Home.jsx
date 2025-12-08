import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="home">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <h1>Your Health, On Your Schedule</h1>
          <p>Book your clinic appointments and pre-consultation online.</p>
          <Link to="/login" className="btn btn-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Book an Appointment
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="card step">
              <h3>1. Register</h3>
              <p>Create your secure patient account in just a few minutes.</p>
            </div>
            <div className="card step">
              <h3>2. Book a Slot</h3>
              <p>See real-time availability for all our doctors and pick a time that works for you.</p>
            </div>
            <div className="card step">
              <h3>3. Pre-Consult</h3>
              <p>Fill out our simple screening form so your doctor is ready for your visit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Description */}
      <section className="project">
        <div className="container project-grid">
          <div className="project-image">
            <img src="/assets/project.jpg" alt="Project preview" />
          </div>
          <div className="project-text">
            <h2>Project Description</h2>
            <p>
              A quick health reservation system that allows you to preemptively describe symptoms that can be
              attributed to certain illnesses as well as allowing you to check transcripts of previous
              consultations.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
