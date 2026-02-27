// CV Data types
export interface PersonalInfo {
    name: string;
    title: string;
    email: string;
    phone: string;
    phoneSecondary: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
}

export interface Experience {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    duration: string;
    description: string;
    achievements: string[];
    skills: string[];
    videoUrl?: string | null;
    images?: string[];
}

export interface Project {
    id: number;
    title: string;
    year: string;
    type: string;
    description: string;
    achievements: string[];
    skills: string[];
    videoUrl?: string | null;
    images?: string[];
    awards?: string[];
    hackaday?: string;
}

export interface Award {
    title: string;
    issuer: string;
    date: string;
    description: string;
}

export interface Education {
    id: number;
    degree: string;
    institution: string;
    location?: string;
    duration: string;
    grade?: string;
    highlights: string[];
    type: string; // "Degree", "Certificate", "Course"
    description?: string;
    skills?: string[];
    images?: string[];
}

export interface Skills {
    programming: string[];
    embedded: string[];
    protocols: string[];
    tools: string[];
    specialized: string[];
}

export interface CVData {
    personalInfo: PersonalInfo;
    summary: string;
    experience: Experience[];
    projects: Project[];
    awards: Award[];
    education: Education[];
    skills: Skills;
}

// CV Data extracted from source materials
export const cvData: CVData = {
    personalInfo: {
        name: "Shoaib Mustafa",
        title: "Junior Embedded Hardware/Software Developer",
        email: "shoaib.mustafa7@hotmail.com",
        phone: "+971508726178",
        phoneSecondary: "+971 503 194 719",
        location: "Ajman, UAE",
        website: "www.capistor.com",
        linkedin: "https://linkedin.com/in/shoaib-mustafa-794a0215a",
        github: "https://github.com/manhoosbilli1",
    },

    summary:
        "Junior Embedded Hardware/Software Developer with hands-on experience in STM32 microcontroller programming, PCB design, and real-time systems. Proven track record developing precision control systems with quantifiable results: microsecond-level timing accuracy, power optimization up to 40%, and sub-centimeter positioning precision. Skilled in C/C++, Python, and MATLAB with practical experience in sensor integration, communication protocols (UART, I2C, SPI), and embedded Linux systems. Successfully delivered projects from prototype to production, including award-winning laser control systems and IoT sensor networks.",

    experience: [
        {
            id: 1,
            title: "Junior Research Assistant",
            company: "Quantum Communications",
            location: "Islamabad, Pakistan",
            type: "Contract",
            duration: "Jan 2025 - Apr 2025 (4 months)",
            description:
                "Focused on Quantum Cryptography, Circuit Simulation and Algorithm Design",
            achievements: [
                "Conducted hands-on research on Grover's algorithm for password cracking and pre-image resistance in hash functions",
                "Designed and implemented quantum circuits using IBM Qiskit, simulating up to 16 qubits for real-world encryption protocols like SHA, Mini AES and MD5",
                "Investigated quantum vulnerabilities in hashing and AES, exploring quantum-safe alternatives and their feasibility",
                "Applied Shor's algorithm and brute-force attack simulations to evaluate classical vs quantum cracking methods",
                "Read, annotated, and cross-referenced over 100+ research papers, developing critical thinking and first-principles reasoning",
                "Simulated and tested 8-qubit implementations of Grover's algorithm across multiple test cases with successful outcomes",
            ],
            skills: [
                "Python",
                "Qiskit",
                "Quantum Computing",
                "Cryptography",
                "Research",
            ],
            videoUrl: null,
            images: [],
        },
        {
            id: 2,
            title: "Embedded Developer",
            company: "Freelance",
            location: "Remote",
            type: "Full-time",
            duration: "Jan 2019 - Jan 2025 (6 years 1 month)",
            description:
                "Delivering end-to-end hardware/software solutions for 400+ global and local clients",
            achievements: [
                "Translated client ideas into full product development pipelines—ideation to prototype to delivery",
                "Built production-grade systems using embedded C, Python, JavaScript, Java, and web technologies",
                "Designed, programmed, and deployed custom firmware, PCBs, IoT systems, and physical enclosures",
                "Worked across domains: automation, tracking, bots, interfaces, RF devices, smart sensors, and more",
                "Created documentation-first approach with structured records of design decisions and milestones",
                "Collaborated with top-tier Fiverr freelancers; delivered under tight deadlines with high urgency",
            ],
            skills: [
                "Embedded C",
                "Python",
                "JavaScript",
                "PCB Design",
                "IoT",
                "Firmware Development",
            ],
            videoUrl: null,
            images: [
                "/cv_assets/clock_pomodorino_embedded_project_while_freelancing_pcb_picture.jpg",
                "/cv_assets/incubator_PCB_Product_pcb_i_made_while_freelancing.png"
            ],
        },
        {
            id: 3,
            title: "Embedded Developer",
            company: "FAMBZZHH",
            location: "Islamabad, Pakistan",
            type: "Internship",
            duration: "Sep 2021 - Jun 2023 (1 year 10 months)",
            description:
                "Collaborated on investor-backed R&D projects in dedicated university lab setting",
            achievements: [
                "Contributed to diverse developments including GPS trackers, ventilators, and agricultural drones",
                "Conducted deep research into non-invasive blood glucose monitoring technologies",
                "Took on both leadership and technical execution roles across projects",
                "Engaged in regular brainstorming and technical reviews with engineers during and after class hours",
                "Worked on Plant Disease Diagnosis system that won 3rd prize in National AI-Driven Hackathon",
            ],
            skills: [
                "Embedded Devices",
                "Python",
                "Research",
                "GPS Systems",
                "Medical Devices",
            ],
            videoUrl: null,
            images: [
                "/cv_assets/GPS_tracker_I_helpedmake_at_fambzzhh.png"
            ],
        },
        {
            id: 4,
            title: "Junior Developer",
            company: "MECTEC",
            location: "Islamabad, Pakistan",
            type: "Full-time",
            duration: "Jun 2019 - Jul 2021 (2 years 2 months)",
            description:
                "Building real-world automation and research-driven prototypes for clients and university collaborations",
            achievements: [
                "Handled diverse client requests for automation projects—automatic curtains, motor control, home automation",
                "Collaborated with research teams from NUST, FAST, QAU, and COMSATS on high-impact national-level R&D projects",
                "Contributed to AI-enabled agricultural drone—winner of two nationwide competitions—featuring aerial image capture and disease diagnosis",
                "Developed seed-throwing mechanism inspired by cricket ball feeders using biodegradable seed pods",
                "Built web-based admin panels for project control and user interfacing",
                "Contributed to assistive technology projects like smart canes for the blind, automated wheelchairs, and indoor guidance robots",
            ],
            skills: [
                "C++",
                "Python",
                "Embedded C",
                "RF Communication",
                "Web Development",
                "Automation",
            ],
            videoUrl: null,
            images: [],
        },
    ],

    projects: [
        {
            id: 1,
            title: "Design and Development of Laser Projector",
            year: "2024",
            type: "Final Year Project",
            description:
                "STM32-based laser raster scanning system for high-resolution image projection using RGB lasers",
            achievements: [
                "Developed laser-based raster scanning system for high-resolution image projection using RGB lasers",
                "Employed galvanometer mirrors for beam deflection and scanning with intensity control via PWM",
                "Managed beam positioning through DAC outputs with STM32 microcontroller implementation",
                "Processed bitmap images into control signals enabling synchronized raster scanning",
                "Demonstrated high brightness, uniformity, and minimal artifacts in experimental validation",
                "Successfully projected test patterns including white dot, square, and circle with precision",
            ],
            skills: [
                "STM32",
                "PWM Control",
                "DAC",
                "Laser Physics",
                "Galvanometer Control",
                "Image Processing",
            ],
            videoUrl: null,
            images: [
                "/cv_assets/receiving_award_picture_comsats_final_year_project_exhibition.png"
            ],
            awards: [
                "1st Position - COMSATS University Final Year Project Exhibition",
            ],
            hackaday:
                "https://hackaday.com/2024/11/22/lasers-galvos-action-a-quest-for-laser-mastery",
        },
        {
            id: 2,
            title: "Agricultural Drone with AI Disease Diagnosis",
            year: "2020",
            type: "Industry Collaboration Project",
            description:
                "AI-enabled agricultural drone featuring aerial image capture, server-based disease diagnosis, and remote owner alerts",
            achievements: [
                "Winner of two nationwide competitions through Pak-China Friendship Centre",
                "Developed seed-throwing mechanism inspired by cricket ball feeders using biodegradable seed pods",
                "Integrated aerial image capture system with server-based disease diagnosis capabilities",
                "Implemented remote owner alert system for real-time notifications",
                "Built web-based admin panels for project control and user interfacing",
                "Collaborated with research teams from NUST, FAST, QAU, and COMSATS on national-level R&D",
            ],
            skills: [
                "Embedded Systems",
                "AI/ML",
                "Web Development",
                "RF Communication",
                "Agricultural Technology",
            ],
            videoUrl: null,
            images: [
                "/cv_assets/pak_china_drone_competition_1.png",
                "/cv_assets/seed_shooter_pak_china_drone_competition.png"
            ],
            awards: ["Winner - Pak-China Friendship Centre"],
        },
        {
            id: 3,
            title: "Plant Disease Diagnosis Platform",
            year: "2023",
            type: "AI/ML Project",
            description:
                "API integration and admin panel system for remote plant disease diagnosis",
            achievements: [
                "3rd Prize in National AI-Driven Hackathon at COMSATS WAH",
                "Integrated Plant Disease Diagnosis model with API routes",
                "Created admin panel for remote diagnosis system access",
                "Developed user interface for remote diagnostic capabilities",
                "Worked under FAMBZZHH supervision for technical implementation",
            ],
            skills: [
                "Python",
                "API Development",
                "Machine Learning Integration",
                "Web Development",
            ],
            videoUrl: null,
            images: [],
            awards: ["3rd Prize - National AI-Driven Hackathon"],
        },
    ],

    awards: [
        {
            title: "1st Position Final Year Project Exhibition",
            issuer: "COMSATS Islamabad",
            date: "Dec 2024",
            description:
                "All university competition with research accuracy and impact evaluation",
        },
        {
            title: "Published in Hackaday",
            issuer: "Hackaday",
            date: "Nov 2024",
            description:
                '"Lasers, Galvos, Action: A Quest for Laser Mastery" - Technical article featuring advanced software-hardware integration',
        },
        {
            title: "3rd Prize In National AI Driven Hackathon",
            issuer: "COMSATS WAH",
            date: "Aug 2023",
            description:
                "Plant Disease Diagnosis system with API integration and admin panel",
        },
        {
            title: "First Position BSc. Physics First Semester",
            issuer: "COMSATS Islamabad",
            date: "Sep 2021",
            description: "3.88/4.0 CGPA achievement",
        },
        {
            title: "Winner in Pak China Friendship Centre",
            issuer: "Pak China center",
            date: "Mar 2020",
            description:
                "Bio-degradable seed shooting mechanism for agricultural drone",
        },
        {
            title: "IELTS Academic Certification",
            issuer: "British Council",
            date: "2024",
            description: "International English Language Testing System certification for academic purposes"
        },
        {
            title: "Hi-Tech Robotics Competition Certificate",
            issuer: "Robotics Competition Authority",
            date: "2023",
            description: "Certificate of participation in advanced robotics competition"
        },
    ],

    education: [
        {
            id: 1,
            degree: "Bachelor of Science in Physics",
            institution: "COMSATS University Islamabad",
            location: "Islamabad, Pakistan",
            duration: "Feb 2021 - Jan 2025",
            grade: "Grade: B",
            type: "Degree",
            description: "I found COMSATS to be an interesting experience with tons of learning and practical hands on experience.",
            highlights: [
                "Specialized in electronics, optoelectronics, and electromagnetic theory",
                "Strong foundation in mathematical modeling and signal processing",
                "Laboratory experience with precision instrumentation and measurement systems",
                "Activities: Electronics, Programming, Tinkering, Radio, HAM"
            ],
            skills: [
                "Sensors", "Programming Languages", "Linux", "C", "Electronics Hardware Design",
                "Mechatronics", "Laser Physics", "Circuit Design", "Embedded Linux", "Electrical Design",
                "Optoelectronics", "Hardware Development", "Programming", "Debugging", "Physics",
                "Research and Development", "Optics", "C++", "Electronics", "Quantum Communication",
                "Python", "Embedded C"
            ]
        },
        {
            id: 2,
            degree: "MIT Open Courseware - Fundamentals of Laser Physics",
            institution: "Massachusetts Institute of Technology",
            duration: "Jan 2024 - Sep 2025",
            grade: "Ungraded",
            type: "Course",
            description: "Read Historical literature starting from the very first torch light to gradual improved versions of light emanating objects (artificial), read and understood about the need for the rate equations from Einstein from a historical perspective and how it relates to the photoelectric effect. Read this again from philosophical texts to see how science emanates from philosophical thought.",
            highlights: [
                "Actively followed the complete MIT series on lasers",
                "Built foundational notes on laser construction, optical pumping, and gain media",
                "Studied historical articles and scientific magazines detailing early laser experiments",
                "Explored the engineering aspects of gas lasers, including He-Ne and CO₂ systems",
                "Learned about glassblowing techniques and lab construction used in early laser builds",
                "Investigated color generation through nonlinear optics and tunable semiconductor devices",
                "Maintained a personal knowledge base linking theory with practical laser applications in sensing, medicine, and communication",
                "Engaged with physics forums to validate and question concepts for deeper understanding"
            ],
            skills: ["Laser Physics", "Optics", "Optoelectronics", "Physics"]
        },
        {
            id: 3,
            degree: "MIT Open Courseware - Introduction to Oscillations and Waves | Physics",
            institution: "Massachusetts Institute of Technology",
            duration: "Jan 2024 - Sep 2024",
            grade: "Ungraded",
            type: "Course",
            description: "An intensive course exploring the mathematics and physical principles behind wave phenomena.",
            highlights: [
                "Studied the mathematics of wave motion using differential equations to understand the universal structure of oscillatory systems",
                "Learned to generalize wave behavior across mechanical, electromagnetic, and quantum systems",
                "Explored the deep parallels between mechanical oscillations and energy transfer mechanisms",
                "Developed a strong appreciation for the elegance and unifying nature of physical laws",
                "Reinforced passion for physics through rigorous, conceptual, and applied learning",
                "Completed the course independently with a focus on real-world applications and theoretical mastery",
                "Explored supplementary resources including MIT OpenCourseWare lectures and Feynman's Lectures on Physics Vol. I",
                "Used Python and simulation tools to visualize wave interference, harmonics, and resonance in various systems"
            ],
            skills: ["Radio Frequency (RF)", "Physics", "Laser Physics", "Optics", "WiFi"]
        },
        {
            id: 4,
            degree: "Certificate Program - Quantum Learning",
            institution: "IBM",
            duration: "Jan 2025 - Apr 2025",
            grade: "Ungraded",
            type: "Certificate",
            description: "Completed IBM's structured learning track on quantum computing via Qiskit. Gained hands-on experience building and simulating quantum circuits, learning key concepts like qubits, entanglement, superposition, and quantum gates.",
            highlights: [
                "Built and simulated quantum circuits using Qiskit",
                "Explored qubits, gates, entanglement, and real-world quantum applications",
                "Ran code on IBM's quantum hardware",
                "Studied algorithms like Grover's and Shor's",
                "Gained exposure to quantum machine learning, error mitigation, and theoretical foundations through hands-on labs and quizzes",
                "Explored real-world use cases in optimization, cryptography, and quantum machine learning",
                "Used actual IBM quantum computers to run small circuits",
                "Learned noise models, error mitigation, and basic quantum algorithms",
                "Developed a strong foundation in quantum theory, linear algebra, and Python-based quantum programming"
            ],
            skills: ["Qiskit", "Quantum Computing", "Physics", "Grover's Algorithm", "Shor's Algorithm"]
        }
    ],

    skills: {
        programming: [
            "C/C++",
            "Python",
            "JavaScript",
            "Java",
            "Embedded C",
            "Assembly",
        ],
        embedded: ["STM32", "ESP32", "AVR", "PIC", "Raspberry Pi", "Arduino"],
        protocols: [
            "UART",
            "SPI",
            "I2C",
            "Modbus",
            "MQTT",
            "LoRa",
            "WiFi",
            "Bluetooth",
        ],
        tools: ["STM32CubeIDE", "VS Code", "Git", "KiCad", "Altium", "MATLAB"],
        specialized: [
            "Quantum Computing (Qiskit)",
            "Laser Physics",
            "IoT Systems",
            "PCB Design",
        ],
    },
};
