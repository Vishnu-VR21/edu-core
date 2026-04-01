import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaArrowRight,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaTrophy,
  FaUsers,
  FaBook,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaGraduationCap,
  FaAward,
  FaLightbulb,
} from "react-icons/fa";
import HomeNavbar from "./HomeNavbar";

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleSections, setVisibleSections] = useState(new Set());

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("scrollTo");

    if (section) {
      setTimeout(() => {
        document
          .getElementById(section)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  const carouselItems = [
    {
      title: "Excellence in PSC Coaching",
      subtitle: "Join Kerala's Premier Coaching Institute",
      description:
        "Expert faculty, proven results, and comprehensive study materials",
      image: "/pic1.jpg",
    },
    {
      title: "Your Success is Our Mission",
      subtitle: "500+ Selections in Last 3 Years",
      description: "Structured approach with personalized mentorship",
      image: "/pic2.jpg",
    },
    {
      title: "Learn from the Best",
      subtitle: "Experienced Faculty & Modern Teaching",
      description: "Updated curriculum aligned with latest exam patterns",
      image: "/pic3.jpg",
    },
  ];

  const galleryImages = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&h=400&fit=crop",
      title: "Modern Classrooms",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&h=400&fit=crop",
      title: "Library Facilities",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&h=400&fit=crop",
      title: "Study Environment",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=400&fit=crop",
      title: "Success Celebrations",
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=400&fit=crop",
      title: "Digital Learning",
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&h=400&fit=crop",
      title: "Classroom Activities",
    },
    {
      id: 7,
      url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=500&h=400&fit=crop",
      title: "Student Achievements",
    },
    {
      id: 8,
      url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=500&h=400&fit=crop",
      title: "Mock Test Sessions",
    },
  ];

  const faculties = [
    {
      name: "Dr. Rajesh Kumar",
      designation: "Head of Department",
      specialization: "History & Indian Polity",
      experience: "18 Years",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      achievements: [
        "PhD in Indian History",
        "500+ Successful Students",
        "Former UPSC Examiner",
      ],
    },
    {
      name: "Prof. Sunitha Menon",
      designation: "Senior Faculty",
      specialization: "General Science & Environment",
      experience: "15 Years",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      achievements: [
        "M.Sc in Environmental Science",
        "Author of 3 Books",
        "Kerala PSC Expert",
      ],
    },
    {
      name: "Adv. Arun Krishnan",
      designation: "Legal Expert",
      specialization: "Constitution & Law",
      experience: "12 Years",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      achievements: [
        "LLM in Constitutional Law",
        "Supreme Court Advocate",
        "Guest Lecturer",
      ],
    },
    {
      name: "Dr. Priya Nair",
      designation: "Economics Faculty",
      specialization: "Economics & Current Affairs",
      experience: "14 Years",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
      achievements: [
        "PhD in Economics",
        "RBI Research Fellow",
        "Published Researcher",
      ],
    },
  ];

  const courses = [
    {
      name: "Kerala PSC Prelims",
      exam: "Kerala PSC",
      duration: "6 Months",
      mode: "Offline / Online",
      for: "Beginners & Repeaters",
      features: [
        "Daily Classes",
        "Mock Tests",
        "Study Materials",
        "Current Affairs Updates",
      ],
    },
    {
      name: "Kerala PSC Mains",
      exam: "Kerala PSC",
      duration: "4 Months",
      mode: "Offline / Online",
      for: "Prelims Qualified",
      features: [
        "Answer Writing",
        "Current Affairs",
        "Personal Guidance",
        "Interview Preparation",
      ],
    },
    {
      name: "UPSC Foundation",
      exam: "UPSC Civil Services",
      duration: "12 Months",
      mode: "Hybrid",
      for: "Graduates",
      features: [
        "NCERT Coverage",
        "Optional Subjects",
        "Interview Prep",
        "Test Series",
      ],
    },
  ];

  const whyUs = [
    {
      title: "Expert Faculty",
      description:
        "Learn from experienced educators with 15+ years of proven track record in competitive exam coaching",
      icon: FaGraduationCap,
    },
    {
      title: "Comprehensive Study Materials",
      description:
        "Updated curriculum and study materials aligned with latest exam patterns and UPSC/PSC trends",
      icon: FaBook,
    },
    {
      title: "Regular Mock Tests",
      description:
        "Weekly tests and monthly evaluations with detailed performance analysis and personalized feedback",
      icon: FaCheckCircle,
    },
    {
      title: "Small Batch Size",
      description:
        "Maximum 30 students per batch ensuring individual attention and doubt clearing sessions",
      icon: FaUsers,
    },
    {
      title: "Proven Results",
      description:
        "500+ successful selections in the last 3 years with 95% success rate in competitive exams",
      icon: FaTrophy,
    },
    {
      title: "Modern Infrastructure",
      description:
        "State-of-the-art classrooms with digital learning tools and well-stocked library facilities",
      icon: FaLightbulb,
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="bg-linear-to-b from-slate-900 to-slate-800 font-sans overflow-hidden scroll-smooth">
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        .section-fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .section-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
      `}</style>

      <HomeNavbar />

      {/* Carousel Section */}
      <section
        id="home"
        className="relative h-screen min-h-175 overflow-hidden"
      >
        {carouselItems.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-linear-to-r from-slate-900/95 via-slate-900/70 to-transparent z-10"></div>
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-6 md:px-20 lg:px-24">
                <div className="max-w-2xl space-y-6 animate-fade-in">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                    {item.title}
                  </h1>
                  <p className="text-2xl md:text-3xl text-blue-300 font-semibold">
                    {item.subtitle}
                  </p>
                  <p className="text-lg md:text-xl text-gray-300">
                    {item.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => navigate("/auth")}
                      className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transform hover:scale-105 transition-all shadow-xl"
                    >
                      Enroll Now <FaArrowRight />
                    </button>
                    <a
                      href="#courses"
                      className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold border border-white/20 transition-all flex items-center justify-center"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white p-3 md:p-4 rounded-full transition-all shadow-xl"
        >
          <FaChevronLeft size={20} className="md:w-6 md:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white p-3 md:p-4 rounded-full transition-all shadow-xl"
        >
          <FaChevronRight size={20} className="md:w-6 md:h-6" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-blue-500 w-8" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Image Gallery */}
      <section
        id="gallery"
        data-section
        className={`py-24 bg-slate-900 min-h-screen flex items-center section-fade-in ${
          visibleSections.has("gallery") ? "section-visible" : ""
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">Gallery</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Glimpses of our success stories, modern facilities, and vibrant
              learning environment
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className="relative group overflow-hidden rounded-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white font-semibold text-lg p-4">
                    {image.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-blue-400 transition-colors"
            >
              <FaTimes size={32} />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <p className="text-white text-center text-xl font-semibold mt-4">
              {selectedImage.title}
            </p>
          </div>
        </div>
      )}

      {/* Courses Section */}
      <section
        id="courses"
        data-section
        className={`py-24 bg-linear-to-b from-slate-800 to-slate-900 min-h-screen flex items-center section-fade-in ${
          visibleSections.has("courses") ? "section-visible" : ""
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">Our Courses</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comprehensive programs designed to ensure your success in
              competitive exams
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  {course.name}
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <FaBook className="text-blue-400 text-xl" />
                    <span className="text-base">{course.exam}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FaClock className="text-blue-400 text-xl" />
                    <span className="text-base">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FaUsers className="text-blue-400 text-xl" />
                    <span className="text-base">{course.mode}</span>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-6 mb-6">
                  <p className="text-sm text-gray-400 mb-4 font-semibold">
                    Perfect for: {course.for}
                  </p>
                  <ul className="space-y-3">
                    {course.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-gray-300 text-sm"
                      >
                        <FaCheckCircle className="text-blue-400 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-full font-semibold transition-all transform hover:scale-105"
                >
                  Enroll Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section
        id="faculty"
        data-section
        className={`py-24 bg-slate-900 min-h-screen flex items-center section-fade-in ${
          visibleSections.has("faculty") ? "section-visible" : ""
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              Meet Our Faculty
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Learn from the best minds in competitive exam preparation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {faculties.map((faculty, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={faculty.image}
                    alt={faculty.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {faculty.name}
                  </h3>
                  <p className="text-blue-400 text-sm font-semibold mb-3">
                    {faculty.designation}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <FaBook className="text-blue-400" />
                      <span>{faculty.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <FaClock className="text-blue-400" />
                      <span>{faculty.experience}</span>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-xs text-gray-400 mb-2 font-semibold">
                      Key Achievements:
                    </p>
                    <ul className="space-y-1">
                      {faculty.achievements.map((achievement, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-gray-300 text-xs"
                        >
                          <FaAward className="text-blue-400 shrink-0 mt-0.5" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        id="why-us"
        data-section
        className={`py-24 bg-linear-to-b from-slate-800 to-slate-900 min-h-screen flex items-center section-fade-in ${
          visibleSections.has("why-us") ? "section-visible" : ""
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              What sets us apart from other coaching institutes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyUs.map((item, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-6">
                  <item.icon className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contact"
        className="py-20 bg-linear-to-r from-blue-600 to-blue-800"
      >
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of successful students who achieved their dreams with
            us
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="bg-white text-blue-700 px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-100 transform hover:scale-105 transition-all shadow-xl"
            >
              Enroll Now <FaArrowRight />
            </button>
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:bg-white/20 transition-all"
            >
              <FaWhatsapp /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <FaBook className="text-white" />
                </div>
                <span className="text-xl font-bold">Excellence Coaching</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Leading coaching institute for PSC and competitive exams with
                proven track record of success.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  "Home",
                  "Gallery",
                  "Courses",
                  "Faculty",
                  "Why Us",
                  "Contact",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <FaArrowRight className="text-xs" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-400 text-sm">
                  <FaMapMarkerAlt className="text-blue-400 mt-1 shrink-0" />
                  <span>Kerala, India</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <FaPhone className="text-blue-400" />
                  <span>+91 1234 567 890</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <FaEnvelope className="text-blue-400" />
                  <span>info@excellence.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Connect With Us</h4>
              <div className="flex gap-4 mb-6">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"
                >
                  <FaFacebook />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"
                >
                  <FaInstagram />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"
                >
                  <FaTwitter />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-600 transition-all"
                >
                  <FaWhatsapp />
                </a>
              </div>
              <div className="text-sm text-gray-400">
                <p className="font-semibold text-white mb-2">Working Hours:</p>
                <p>Mon - Fri: 9:00 AM - 8:00 PM</p>
                <p>Sat: 10:00 AM - 6:00 PM</p>
                <p>Sun: Closed</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 Role-Based Education ERP System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
