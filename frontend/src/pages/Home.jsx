import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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
          <a href="#" className="btn btn-primary btn-lg">Book an Appointment</a>
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
