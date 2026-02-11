export type EventCategory = "Technical" | "Cultural" | "Sports" | "Hackathon" | "Fest" | "Seminar";

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

export const regions = [
  "Andhra Pradesh",
  "Arunachal Pradesh", 
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
] as const;

export const capitalCities = {
  "Andhra Pradesh": "Amaravati",
  "Arunachal Pradesh": "Itanagar",
  "Assam": "Dispur",
  "Bihar": "Patna",
  "Chhattisgarh": "Raipur",
  "Goa": "Panaji",
  "Gujarat": "Gandhinagar",
  "Haryana": "Chandigarh",
  "Himachal Pradesh": "Shimla",
  "Jharkhand": "Ranchi",
  "Karnataka": "Bengaluru",
  "Kerala": "Thiruvananthapuram",
  "Madhya Pradesh": "Bhopal",
  "Maharashtra": "Mumbai",
  "Manipur": "Imphal",
  "Meghalaya": "Shillong",
  "Mizoram": "Aizawl",
  "Nagaland": "Kohima",
  "Odisha": "Bhubaneswar",
  "Punjab": "Chandigarh",
  "Rajasthan": "Jaipur",
  "Sikkim": "Gangtok",
  "Tamil Nadu": "Chennai",
  "Telangana": "Hyderabad",
  "Tripura": "Agartala",
  "Uttar Pradesh": "Lucknow",
  "Uttarakhand": "Dehradun",
  "West Bengal": "Kolkata"
} as const;

export const collegeTypes = [
  "IIT",
  "IIIT", 
  "NIT",
  "Others"
] as const;

export const colleges = [
  "IIT",
  "IIIT",
  "NIT", 
  "Others"
] as const;

export const categories: EventCategory[] = [
  "Technical",
  "Cultural", 
  "Sports",
  "Hackathon",
  "Fest",
  "Seminar",
];

export const events: CollegeEvent[] = [
  {
    id: "1",
    title: "Quantum Computing Summit 2026",
    college: "IIT Bombay",
    logo: "/logos/iit-bombay.jpg",
    date: "2026-03-15",
    category: "Hackathon",
    description:
      "48-hour quantum computing hackathon with mentors from leading research institutions.",
    attendees: 320,
    location: "Main Auditorium, IIT Bombay",
  },
  {
    id: "2",
    title: "Neural Networks Workshop",
    college: "MIT Pune",
    logo: "/logos/mit-pune.jpg",
    date: "2026-03-20",
    category: "Technical",
    description:
      "Advanced workshop on deep learning architectures and practical implementations.",
    attendees: 150,
    location: "CS Department, MIT Pune",
  },
  {
    id: "3",
    title: "Cultural Fusion Festival",
    college: "BITS Pilani",
    logo: "/logos/bits-pilani.jpg",
    date: "2026-04-02",
    category: "Fest",
    description:
      "Annual cultural celebration featuring international artists and traditional performances.",
    attendees: 5000,
    location: "Campus Grounds, BITS Pilani",
  },
  {
    id: "4",
    title: "Blockchain Innovation Conference",
    college: "NIT Trichy",
    logo: "/logos/nit-trichy.jpg",
    date: "2026-04-10",
    category: "Seminar",
    description:
      "Conference on distributed ledger technology and cryptocurrency innovations.",
    attendees: 800,
    location: "Lecture Hall Complex, NIT Trichy",
  },
  {
    id: "5",
    title: "Cybersecurity Challenge",
    college: "VIT Vellore",
    logo: "/logos/vit-vellore.jpg",
    date: "2026-04-18",
    category: "Technical",
    description:
      "Capture the flag competition with ethical hacking challenges and security workshops.",
    attendees: 600,
    location: "Anna Auditorium, VIT Vellore",
  },
  {
    id: "6",
    title: "Cloud Architecture Masterclass",
    college: "DTU Delhi",
    logo: "/logos/dtu-delhi.jpg",
    date: "2026-03-28",
    category: "Technical",
    description:
      "Hands-on workshop on AWS, Azure, and Google Cloud platform deployments.",
    attendees: 200,
    location: "Seminar Hall, DTU Delhi",
  },
  {
    id: "7",
    title: "Innovation Expo 2026",
    college: "IIT Bombay",
    logo: "/logos/iit-bombay.jpg",
    date: "2026-05-01",
    category: "Fest",
    description:
      "Showcase of cutting-edge technology projects and startup innovations.",
    attendees: 10000,
    location: "Entire Campus, IIT Bombay",
  },
  {
    id: "8",
    title: "Data Science Symposium",
    college: "BITS Pilani",
    logo: "/logos/bits-pilani.jpg",
    date: "2026-05-12",
    category: "Technical",
    description:
      "Symposium on big data analytics, machine learning applications, and data visualization.",
    attendees: 180,
    location: "Workshop Hall, BITS Pilani",
  },
  {
    id: "9",
    title: "Robotics Championship",
    college: "NIT Trichy",
    logo: "/logos/nit-trichy.jpg",
    date: "2026-05-20",
    category: "Technical",
    description:
      "Build and battle robots in this thrilling championship featuring autonomous systems.",
    attendees: 400,
    location: "Sports Complex, NIT Trichy",
  },
  {
    id: "10",
    title: "Advanced Algorithms Workshop",
    college: "IIT Hyderabad",
    logo: "/logos/iit-hyderabad.jpg",
    date: "2026-03-25",
    category: "Technical",
    description:
      "Deep dive into advanced algorithms, data structures, and competitive programming techniques.",
    attendees: 250,
    location: "Lecture Hall, IIT Hyderabad",
  },
];
