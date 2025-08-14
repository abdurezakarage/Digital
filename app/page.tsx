"use client";

import Image from "next/image";
import BlogList from "./BlogManagement";
import { useEffect, useState, FormEvent } from "react";
import { 
  MdEmail, 
  MdPhone, 
  MdLocationOn 
} from "react-icons/md";
import { 
  FaTelegramPlane, 
  FaFacebookF, 
  FaWhatsapp 
} from "react-icons/fa";

interface Service {
  id: number;
  title: string;
  description: string;
  image_icon: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  image_icon: string;
}

interface Member {
  id: number;
  full_name: string;
  position: string;
  image_icon: string;
}

interface ContactData {
  full_name: string;
  email: string;
  title: string;
  message: string;
}

export default function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedServices, setExpandedServices] = useState<Set<number>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  const [contactData, setContactData] = useState<ContactData>({
    full_name: "",
    email: "",
    title: "",
    message: "",
  });
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [loading, setLoading] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const toggleServiceDescription = (serviceId: number) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const toggleProjectDescription = (projectId: number) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  // Scroll effect for header - fixed version
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${backendUrl}/media/${path.replace(/^\/?media\/?/, "")}`;
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async <T,>(
      endpoint: string,
      setData: (data: T[]) => void
    ) => {
      try {
        const res = await fetch(`${backendUrl}${endpoint}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setData(data);
        } else if (data.results && Array.isArray(data.results)) {
          setData(data.results);
        } else if (data && typeof data === "object") {
          setData([data]);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
        setData([]);
      }
    };

    fetchData<Service>("/api/services/list/", setServices);
    fetchData<Project>("/api/projects/list/", setProjects);
    fetchData<Member>("/api/staff-members/list/", setMembers);
  }, [backendUrl]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactData.full_name || !contactData.email || !contactData.message) {
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${backendUrl}/api/create_notification/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      if (res.ok) {
        setStatus("success");
        setContactData({ full_name: "", email: "", title: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="header">
        <div className="nav-container">
          <h1 className="logo">
            <Image
              src="/images/logo.png"
              width={80}
              height={60}
              style={{
                borderRadius: "50%",
                verticalAlign: "middle",
                marginRight: "25px",
              }}
              alt="Digital Merkato logo"
            />
            Digital Merkato Technology
          </h1>

          <button
            className="menu-toggle"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Menu"
          >
            <span className={`menu-icon ${isMenuOpen ? "open" : ""}`}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </span>
          </button>

          <nav
            className={`${isMenuOpen ? "open" : ""}`}
            aria-hidden={!isMenuOpen}
          >
            <a href="#services" className="nav-link" onClick={closeMenu}>
              Services
            </a>
            <a href="#projects" className="nav-link" onClick={closeMenu}>
              Projects
            </a>
            <a href="#about" className="nav-link" onClick={closeMenu}>
              Team
            </a>
            <a href="#contact" className="nav-link" onClick={closeMenu}>
              Contact
            </a>
          </nav>
        </div>
      </header>

      <div className="hero">
        <div className="hero-container">
          <div className="hero-text">
            <h2>
              Digital Merkato digitalizes local <span>business </span>
            </h2>
            <p>Digital solutions for modern businesses in Ethiopia.</p>
            <div className="hero-buttons">
              <a href="#services" className="animated-button">
                Our Services
              </a>
              <a href="#" className="animated-button">
                Watch Video
              </a>
            </div>
          </div>
          <div className="hero-image">
            <Image
              src="/images/software.webp"
              alt="Business Software Solutions"
              width={600}
              height={400}
              className="hero-img"
              priority
            />
          </div>
        </div>
      </div>

      <BlogList />

      <section id="services" className="services transparent-bg">
        <h3>Our Services</h3>
        <p>
          We deliver tailored software solutions including ERP, POS, eCommerce,
          and custom business applications.
        </p>
        <div className="service-cards">
          {services.map((s) => (
            <div key={s.id} className="card">
              <div className="image-container">
                <Image
                  src={getImageUrl(s.image_icon)}
                  alt={s.title}
                  width={230}
                  height={200}
                  className="service-image"
                  style={{ objectPosition: "center" }}
                  unoptimized={!s.image_icon.startsWith(backendUrl || "")}
                />
              </div>
              <h4>{s.title}</h4>
              <p style={{ textAlign: 'justify' }}>
                {expandedServices.has(s.id) 
                  ? s.description 
                  : truncateDescription(s.description)
                }
                {s.description.length > 100 && (
                  <button
                    onClick={() => toggleServiceDescription(s.id)}
                    className="see-more-btn"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginLeft: '5px',
                      fontSize: '14px'
                    }}
                  >
                    {expandedServices.has(s.id) ? 'See less' : 'See more'}
                  </button>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="projects" className="projects transparent-bg">
        <h3>Our Projects</h3>
        <p>
          Take a look at some of the innovative solutions we&apos;ve crafted for
          diverse industries.
        </p>
        <div className="project-container">
          {projects.map((p) => (
            <div key={p.id} className="project-card">
              <div className="image-container">
                <Image
                  src={getImageUrl(p.image_icon)}
                  alt={p.title}
                  width={300}
                  height={200}
                  className="project-image"
                  style={{ objectPosition: "center" }}
                  unoptimized={!p.image_icon.startsWith(backendUrl || "")}
                />
              </div>
              <h4>{p.title}</h4>
              <p style={{ textAlign: 'justify' }}>
                {expandedProjects.has(p.id) 
                  ? p.description 
                  : truncateDescription(p.description)
                }
                {p.description.length > 100 && (
                  <button
                    onClick={() => toggleProjectDescription(p.id)}
                    className="see-more-btn"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginLeft: '5px',
                      fontSize: '14px'
                    }}
                  >
                    {expandedProjects.has(p.id) ? 'See less' : 'See more'}
                  </button>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="about-us transparent-bg">
        <h3>Our Team</h3>
        <p>
          Meet the dedicated professionals driving your digital transformation.
        </p>
        <div className="about-container">
          {members.map((m) => (
            <div key={m.id} className="about-card">
              <div className="image-container">
                <Image
                  src={getImageUrl(m.image_icon)}
                  alt={m.full_name}
                  width={150}
                  height={150}
                  className="member-image"
                  style={{ objectPosition: "top center" }}
                  unoptimized={!m.image_icon.startsWith(backendUrl || "")}
                />
              </div>
              <h4>{m.full_name}</h4>
              <p>{m.position}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="contact">
        <h3>Contact Us</h3>
        <p>
          Have a question or want to work with us? We&apos;d love to hear from
          you.
        </p>
        <div className="contact-details">
          <div className="contact-card">
            <div className="contact-item">
              <MdEmail />
              <span>dev@digitalmerkato.com.et</span>
            </div>
            <div className="contact-item">
              <MdPhone />
              <span>+251 929 078 786</span>
            </div>
            <div className="contact-item">
              <FaTelegramPlane />
              <span>@digitalmerkato</span>
            </div>
            <div className="contact-item">
              <MdLocationOn />
              <span>Addis Ababa, Ethiopia</span>
            </div>
          </div>
        </div>

        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="full_name"
              placeholder="Your Full Name"
              value={contactData.full_name}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email Address"
              value={contactData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="title"
              placeholder="Subject"
              value={contactData.title}
              onChange={handleInputChange}
            />
            <textarea
              name="message"
              rows={5}
              placeholder="Your Message..."
              value={contactData.message}
              onChange={handleInputChange}
              required
            ></textarea>
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
            {status === "success" && (
              <div className="form-status success">
                Message sent successfully!
              </div>
            )}
            {status === "error" && (
              <div className="form-status error">
                Failed to send message. Please try again.
              </div>
            )}
          </form>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div>
            <h4>Digital Merkato Technology PLC</h4>
            <p>Addis Ababa, Ethiopia</p>
            <p>
              Delivering cutting-edge ERP, POS, and custom software solutions
              for modern businesses.
            </p>
            <p>Email: digitalmerkato@outlook.com</p>
            <p>Phone: +251 929 078 786</p>
          </div>
          <div className="footer-social">
            <p>Follow Us</p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" aria-label="Telegram">
                <FaTelegramPlane />
              </a>
              <a href="#" aria-label="WhatsApp">
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>
        <p className="copyright">
          © {new Date().getFullYear()} Digital Merkato Technology PLC. All
          rights reserved.
        </p>
      </footer>
    </>
  );
}
