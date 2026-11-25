import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Experience from './components/Experience';
import CaseStudies from './components/CaseStudies';
import Deliverables from './components/Deliverables';
import AnalysisSkills from './components/AnalysisSkills';
import TechnicalSkills from './components/TechnicalSkills';
import Tools from './components/Tools';
import Certifications from './components/Certifications';
import Resume from './components/Resume';
import Contact from './components/Contact';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'experience', 'case-studies', 'deliverables', 
                        'analysis-skills', 'technical-skills', 'tools', 'certifications', 
                        'resume', 'contact'];
      let current = 'home';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="App">
      <Navbar activeSection={activeSection} scrollToSection={scrollToSection} />
      <Home scrollToSection={scrollToSection} />
      <About />
      <Experience />
      <CaseStudies />
      <Deliverables />
      <AnalysisSkills />
      <TechnicalSkills />
      <Tools />
      <Certifications />
      <Resume scrollToSection={scrollToSection} />
      <Contact />
      
      <footer className="footer">
        <div className="footer-container">
          <span>&copy; 2025 Business Analyst Portfolio</span>
          <div className="footer-links">
            {['Home', 'About', 'Experience', 'Case Studies', 'Deliverables', 'Contact'].map((label) => {
              const id = label.toLowerCase().replace(/\s+/g, '-');
              return (
                <a key={id} onClick={() => scrollToSection(id)}>{label}</a>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;