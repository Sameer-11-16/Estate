import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon"><FiMapPin /></span>
              <span>Land<strong>Estate</strong></span>
            </Link>
            <p>Gorakhpur and Uttar Pradesh's dedicated direct land and plot marketplace. Connecting buyers and landowners with transparent dealings.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="Instagram"><FiInstagram /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/listings">Browse Land</Link></li>
              <li><Link to="/list-land">List Your Land</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Land Types</h4>
            <ul>
              <li><Link to="/listings?landType=Residential">Residential Plots</Link></li>
              <li><Link to="/listings?landType=Commercial">Commercial Land</Link></li>
              <li><Link to="/listings?landType=Agricultural">Agricultural Farm</Link></li>
              <li><Link to="/listings?landType=Industrial">Industrial (GIDA)</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><FiMapPin /> Golghar / Taramandal, Gorakhpur, UP</li>
              <li><FiPhone /> +91 98390 12345</li>
              <li><FiMail /> contact@landestate.in</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 LandEstate Gorakhpur. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
