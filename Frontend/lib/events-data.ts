export type EventCategory = "Hackathon" | "Workshop" | "Fest" | "Seminar" | "Competition";

export interface CollegeEvent {
  id: string;
  title: string;
  college: string;
  logo: string;
  date: string;
  category: EventCategory;
  description: string;
  attendees: number;
  location: string;
}

export const colleges = [
  "IIT Bombay",
  "MIT Pune",
  "BITS Pilani",
  "NIT Trichy",
  "VIT Vellore",
  "DTU Delhi",
] as const;

export const categories: EventCategory[] = [
  "Hackathon",
  "Workshop",
  "Fest",
  "Seminar",
  "Competition",
];

export const events: CollegeEvent[] = [
  {
    id: "1",
    title: "HackOverflow 2026",
    college: "IIT Bombay",
    logo: "/logos/iit-bombay.jpg",
    date: "2026-03-15",
    category: "Hackathon",
    description:
      "48-hour hackathon with mentors from top tech companies. Build solutions for real-world problems.",
    attendees: 320,
    location: "Main Auditorium, IIT Bombay",
  },
  {
    id: "2",
    title: "AI/ML Bootcamp",
    college: "MIT Pune",
    logo: "/logos/mit-pune.jpg",
    date: "2026-03-20",
    category: "Workshop",
    description:
      "Intensive 3-day workshop on machine learning fundamentals and deploying models at scale.",
    attendees: 150,
    location: "CS Department, MIT Pune",
  },
  {
    id: "3",
    title: "Waves Festival",
    college: "BITS Pilani",
    logo: "/logos/bits-pilani.jpg",
    date: "2026-04-02",
    category: "Fest",
    description:
      "Annual cultural extravaganza featuring live performances, art exhibitions, and celebrity appearances.",
    attendees: 5000,
    location: "Campus Grounds, BITS Pilani",
  },
  {
    id: "4",
    title: "Pragyan Tech Summit",
    college: "NIT Trichy",
    logo: "/logos/nit-trichy.jpg",
    date: "2026-04-10",
    category: "Seminar",
    description:
      "Tech summit with keynotes from industry leaders on the future of AI, Web3, and quantum computing.",
    attendees: 800,
    location: "Lecture Hall Complex, NIT Trichy",
  },
  {
    id: "5",
    title: "CodeSprint Challenge",
    college: "VIT Vellore",
    logo: "/logos/vit-vellore.jpg",
    date: "2026-04-18",
    category: "Competition",
    description:
      "Competitive programming contest with prizes worth 5 lakhs. Open to all college students.",
    attendees: 600,
    location: "Anna Auditorium, VIT Vellore",
  },
  {
    id: "6",
    title: "DevOps Masterclass",
    college: "DTU Delhi",
    logo: "/logos/dtu-delhi.jpg",
    date: "2026-03-28",
    category: "Workshop",
    description:
      "Learn Docker, Kubernetes, and CI/CD pipelines from industry practitioners in this hands-on session.",
    attendees: 200,
    location: "Seminar Hall, DTU Delhi",
  },
  {
    id: "7",
    title: "TechFest 2026",
    college: "IIT Bombay",
    logo: "/logos/iit-bombay.jpg",
    date: "2026-05-01",
    category: "Fest",
    description:
      "Asia's largest science and technology festival with robotics, gaming, and innovation challenges.",
    attendees: 10000,
    location: "Entire Campus, IIT Bombay",
  },
  {
    id: "8",
    title: "Blockchain Bootcamp",
    college: "BITS Pilani",
    logo: "/logos/bits-pilani.jpg",
    date: "2026-05-12",
    category: "Workshop",
    description:
      "Hands-on workshop covering Solidity, smart contracts, and building decentralized applications.",
    attendees: 180,
    location: "Workshop Hall, BITS Pilani",
  },
  {
    id: "9",
    title: "RoboWars Championship",
    college: "NIT Trichy",
    logo: "/logos/nit-trichy.jpg",
    date: "2026-05-20",
    category: "Competition",
    description:
      "Build and battle robots in this thrilling championship. Categories include sumo, line-follower, and combat.",
    attendees: 400,
    location: "Sports Complex, NIT Trichy",
  },
];
