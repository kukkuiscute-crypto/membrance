export interface Video {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  youtubeId: string;
  channel: string;
  points: number;
  tags?: string[];
}

export const SUBJECTS = ["All", "Mathematics", "Science", "Biology", "Chemistry", "Physics", "English", "History", "Geography", "Computer Science"];

export const VIDEO_LIBRARY: Video[] = [
  // Mathematics
  { id: "m1", title: "Introduction to Algebra", subject: "Mathematics", grade: "Grade 7", duration: "12:01", youtubeId: "NybHckSEQBI", channel: "Khan Academy", points: 5, tags: ["algebra", "basics"] },
  { id: "m2", title: "Trigonometry Basics", subject: "Mathematics", grade: "Grade 10", duration: "16:05", youtubeId: "PUB0TaZ7bhA", channel: "The Organic Chemistry Tutor", points: 5, tags: ["trigonometry"] },
  { id: "m3", title: "Fractions for Beginners", subject: "Mathematics", grade: "Grade 4", duration: "9:30", youtubeId: "n0FZhQ_GkKw", channel: "Math Antics", points: 5, tags: ["fractions"] },
  { id: "m4", title: "Pythagorean Theorem", subject: "Mathematics", grade: "Grade 8", duration: "10:06", youtubeId: "AA6RfgP-AHU", channel: "Khan Academy", points: 5, tags: ["geometry"] },
  { id: "m5", title: "Understanding Percentages", subject: "Mathematics", grade: "Grade 6", duration: "8:42", youtubeId: "JeVSmq1Nrpw", channel: "Math Antics", points: 5, tags: ["percentages"] },
  { id: "m6", title: "Linear Equations", subject: "Mathematics", grade: "Grade 8", duration: "11:15", youtubeId: "GmMX3-nTWbE", channel: "Khan Academy", points: 5, tags: ["algebra", "equations"] },
  { id: "m7", title: "Geometry: Angles and Lines", subject: "Mathematics", grade: "Grade 5", duration: "7:33", youtubeId: "wBjk-YF0tX0", channel: "Math Antics", points: 5, tags: ["geometry", "angles"] },
  { id: "m8", title: "Quadratic Equations Explained", subject: "Mathematics", grade: "Grade 9", duration: "14:22", youtubeId: "IlNAJl36-10", channel: "The Organic Chemistry Tutor", points: 5, tags: ["algebra", "quadratic"] },
  { id: "m9", title: "Calculus: Limits Introduction", subject: "Mathematics", grade: "Grade 11", duration: "18:03", youtubeId: "riXcZT2ICjA", channel: "3Blue1Brown", points: 5, tags: ["calculus", "limits"] },
  { id: "m10", title: "Statistics and Probability", subject: "Mathematics", grade: "Grade 9", duration: "13:44", youtubeId: "XcLO4f1i4Yo", channel: "CrashCourse", points: 5, tags: ["statistics"] },

  // Science (General)
  { id: "s1", title: "The Solar System 101", subject: "Science", grade: "Grade 5", duration: "3:42", youtubeId: "libKVRa01L8", channel: "National Geographic", points: 5, tags: ["space", "planets"] },
  { id: "s2", title: "The Water Cycle", subject: "Science", grade: "Grade 3", duration: "3:22", youtubeId: "al-do-HGuIk", channel: "NASA", points: 5, tags: ["water", "cycle"] },
  { id: "s3", title: "How Do Volcanoes Erupt?", subject: "Science", grade: "Grade 5", duration: "4:15", youtubeId: "lAmqsMQG3RM", channel: "National Geographic Kids", points: 5, tags: ["volcanoes", "earth"] },
  { id: "s4", title: "What is DNA?", subject: "Science", grade: "Grade 7", duration: "5:30", youtubeId: "zwibgNGe4aY", channel: "Stated Clearly", points: 5, tags: ["DNA", "genetics"] },
  { id: "s5", title: "Electricity Explained", subject: "Science", grade: "Grade 6", duration: "6:28", youtubeId: "mc979OhitAg", channel: "SciShow Kids", points: 5, tags: ["electricity"] },
  { id: "s6", title: "Sound Waves and How We Hear", subject: "Science", grade: "Grade 4", duration: "5:10", youtubeId: "TsQL-sXZOLc", channel: "SciShow Kids", points: 5, tags: ["sound", "waves"] },

  // Biology
  { id: "b1", title: "Photosynthesis", subject: "Biology", grade: "Grade 8", duration: "12:28", youtubeId: "uixA8ZXx0KU", channel: "Amoeba Sisters", points: 5, tags: ["plants", "photosynthesis"] },
  { id: "b2", title: "Cell Structure and Function", subject: "Biology", grade: "Grade 9", duration: "10:22", youtubeId: "URUJD5NEXC8", channel: "Amoeba Sisters", points: 5, tags: ["cells"] },
  { id: "b3", title: "Mitosis vs Meiosis", subject: "Biology", grade: "Grade 10", duration: "11:45", youtubeId: "zGKm4YJkBRc", channel: "Amoeba Sisters", points: 5, tags: ["cell division"] },
  { id: "b4", title: "The Human Digestive System", subject: "Biology", grade: "Grade 7", duration: "8:55", youtubeId: "Og5xAdC8EUI", channel: "Amoeba Sisters", points: 5, tags: ["digestion", "body"] },
  { id: "b5", title: "Evolution by Natural Selection", subject: "Biology", grade: "Grade 10", duration: "10:15", youtubeId: "7VM9YxmULuo", channel: "Stated Clearly", points: 5, tags: ["evolution"] },
  { id: "b6", title: "Ecosystem and Biodiversity", subject: "Biology", grade: "Grade 8", duration: "9:30", youtubeId: "GlLIlbU_qTg", channel: "CrashCourse", points: 5, tags: ["ecosystem"] },

  // Chemistry
  { id: "c1", title: "Chemical Reactions and Equations", subject: "Chemistry", grade: "Grade 10", duration: "14:21", youtubeId: "eNsVaUCzvLA", channel: "Khan Academy", points: 5, tags: ["reactions"] },
  { id: "c2", title: "Periodic Table Explained", subject: "Chemistry", grade: "Grade 9", duration: "12:07", youtubeId: "0RRVV4Diomg", channel: "TED-Ed", points: 5, tags: ["periodic table", "elements"] },
  { id: "c3", title: "Acids, Bases and pH", subject: "Chemistry", grade: "Grade 8", duration: "9:48", youtubeId: "GQGaU5LHquo", channel: "FuseSchool", points: 5, tags: ["acids", "bases"] },
  { id: "c4", title: "Atomic Structure", subject: "Chemistry", grade: "Grade 9", duration: "11:33", youtubeId: "LhveTGblGHY", channel: "CrashCourse", points: 5, tags: ["atoms"] },
  { id: "c5", title: "Chemical Bonding: Ionic vs Covalent", subject: "Chemistry", grade: "Grade 10", duration: "13:20", youtubeId: "CGA8sRwqIFg", channel: "The Organic Chemistry Tutor", points: 5, tags: ["bonding"] },
  { id: "c6", title: "Balancing Chemical Equations", subject: "Chemistry", grade: "Grade 9", duration: "10:10", youtubeId: "RnGu3xO2h74", channel: "Tyler DeWitt", points: 5, tags: ["equations", "balancing"] },

  // Physics
  { id: "p1", title: "Newton's Laws of Motion", subject: "Physics", grade: "Grade 9", duration: "10:12", youtubeId: "kKKM8Y-u7ds", channel: "CrashCourse", points: 5, tags: ["motion", "newton"] },
  { id: "p2", title: "Gravity Explained Simply", subject: "Physics", grade: "Grade 8", duration: "8:10", youtubeId: "Jnoxz2dBhgk", channel: "Kurzgesagt", points: 5, tags: ["gravity"] },
  { id: "p3", title: "What is Light?", subject: "Physics", grade: "Grade 7", duration: "6:45", youtubeId: "IXxZRZxafEQ", channel: "Kurzgesagt", points: 5, tags: ["light", "waves"] },
  { id: "p4", title: "Energy: Forms and Transformations", subject: "Physics", grade: "Grade 8", duration: "9:20", youtubeId: "CW0_S5YpYVo", channel: "CrashCourse", points: 5, tags: ["energy"] },
  { id: "p5", title: "Electric Circuits Explained", subject: "Physics", grade: "Grade 9", duration: "12:15", youtubeId: "F_vLWkkOETI", channel: "The Organic Chemistry Tutor", points: 5, tags: ["circuits", "electricity"] },
  { id: "p6", title: "Magnetism and Electromagnets", subject: "Physics", grade: "Grade 8", duration: "7:55", youtubeId: "s94suB5uLWw", channel: "SciShow", points: 5, tags: ["magnetism"] },

  // English
  { id: "e1", title: "Parts of Speech", subject: "English", grade: "Grade 6", duration: "9:08", youtubeId: "SceDmiBEAGE", channel: "English with Lucy", points: 5, tags: ["grammar"] },
  { id: "e2", title: "Creative Writing Tips", subject: "English", grade: "Grade 7", duration: "4:55", youtubeId: "yPJqFNm0MaA", channel: "TED-Ed", points: 5, tags: ["writing"] },
  { id: "e3", title: "How to Write an Essay", subject: "English", grade: "Grade 8", duration: "8:30", youtubeId: "dHdI0IB_o9c", channel: "Scribbr", points: 5, tags: ["essay", "writing"] },
  { id: "e4", title: "Shakespeare Made Easy", subject: "English", grade: "Grade 10", duration: "11:45", youtubeId: "YkwQgBmVfME", channel: "TED-Ed", points: 5, tags: ["shakespeare", "literature"] },
  { id: "e5", title: "Reading Comprehension Strategies", subject: "English", grade: "Grade 5", duration: "7:20", youtubeId: "WPen1-E0Dl8", channel: "GCFGlobal", points: 5, tags: ["reading"] },
  { id: "e6", title: "Punctuation Rules", subject: "English", grade: "Grade 4", duration: "6:12", youtubeId: "JVrhnRb0hBo", channel: "GrammarSongs", points: 5, tags: ["punctuation", "grammar"] },

  // History
  { id: "h1", title: "World War II in 7 Minutes", subject: "History", grade: "Grade 9", duration: "7:09", youtubeId: "HUqy-OQvVtI", channel: "History Channel", points: 5, tags: ["WWII", "war"] },
  { id: "h2", title: "Ancient Egypt for Kids", subject: "History", grade: "Grade 5", duration: "6:30", youtubeId: "hO1tzmi1V5g", channel: "National Geographic Kids", points: 5, tags: ["egypt", "ancient"] },
  { id: "h3", title: "The French Revolution", subject: "History", grade: "Grade 10", duration: "12:20", youtubeId: "lTTvKwCylFY", channel: "OverSimplified", points: 5, tags: ["france", "revolution"] },
  { id: "h4", title: "Industrial Revolution", subject: "History", grade: "Grade 9", duration: "10:50", youtubeId: "zhL5DCizj5c", channel: "CrashCourse", points: 5, tags: ["industrial"] },
  { id: "h5", title: "Ancient Greece", subject: "History", grade: "Grade 6", duration: "8:15", youtubeId: "gFRxmi4uCGo", channel: "TED-Ed", points: 5, tags: ["greece", "ancient"] },
  { id: "h6", title: "The Cold War Explained", subject: "History", grade: "Grade 10", duration: "11:40", youtubeId: "I79TpDe3t2g", channel: "OverSimplified", points: 5, tags: ["cold war"] },

  // Geography
  { id: "g1", title: "Plate Tectonics Explained", subject: "Geography", grade: "Grade 7", duration: "8:22", youtubeId: "kwfNGatxUJI", channel: "MinuteEarth", points: 5, tags: ["tectonics", "earth"] },
  { id: "g2", title: "Climate Zones of the World", subject: "Geography", grade: "Grade 6", duration: "7:15", youtubeId: "WmVLcj-XKnM", channel: "Geography Now", points: 5, tags: ["climate"] },
  { id: "g3", title: "How Maps Work", subject: "Geography", grade: "Grade 5", duration: "5:40", youtubeId: "2lR7s1Y6Zig", channel: "TED-Ed", points: 5, tags: ["maps"] },
  { id: "g4", title: "Rivers and Their Features", subject: "Geography", grade: "Grade 7", duration: "9:10", youtubeId: "mVhmt80SJMM", channel: "Geography Focus", points: 5, tags: ["rivers"] },

  // Computer Science
  { id: "cs1", title: "What is Coding?", subject: "Computer Science", grade: "Grade 5", duration: "5:55", youtubeId: "QvyTEx1wyOY", channel: "Code.org", points: 5, tags: ["coding", "basics"] },
  { id: "cs2", title: "How the Internet Works", subject: "Computer Science", grade: "Grade 7", duration: "6:44", youtubeId: "Dxcc6ycZ73M", channel: "Kurzgesagt", points: 5, tags: ["internet"] },
  { id: "cs3", title: "Binary Numbers Explained", subject: "Computer Science", grade: "Grade 8", duration: "8:30", youtubeId: "LpuPe81bc2w", channel: "BasicsExplained", points: 5, tags: ["binary"] },
  { id: "cs4", title: "Introduction to Python", subject: "Computer Science", grade: "Grade 9", duration: "14:00", youtubeId: "kqtD5dpn9C8", channel: "Programming with Mosh", points: 5, tags: ["python", "programming"] },
  { id: "cs5", title: "Algorithms Explained", subject: "Computer Science", grade: "Grade 8", duration: "7:25", youtubeId: "rL8X2mlNHPM", channel: "TED-Ed", points: 5, tags: ["algorithms"] },
  { id: "cs6", title: "What is AI?", subject: "Computer Science", grade: "Grade 7", duration: "6:10", youtubeId: "mJeNghZXtMo", channel: "CrashCourse", points: 5, tags: ["AI", "machine learning"] },

  // Magnet Brains
  { id: "mb1", title: "Class 10 Science Chapter 1", subject: "Science", grade: "Grade 10", duration: "45:20", youtubeId: "F3dkMBs2lUc", channel: "Magnet Brains", points: 5, tags: ["class 10", "science"] },
  { id: "mb2", title: "Class 9 Maths Full Course", subject: "Mathematics", grade: "Grade 9", duration: "38:15", youtubeId: "bWTnBUmJMJk", channel: "Magnet Brains", points: 5, tags: ["class 9", "maths"] },

  // Physics Wallah
  { id: "pw1", title: "Kinematics One Shot", subject: "Physics", grade: "Grade 11", duration: "52:30", youtubeId: "2pMVP_r0XGo", channel: "Physics Wallah", points: 5, tags: ["kinematics", "JEE"] },
  { id: "pw2", title: "Organic Chemistry Basics", subject: "Chemistry", grade: "Grade 11", duration: "48:10", youtubeId: "KdDW3IfJxJE", channel: "Physics Wallah", points: 5, tags: ["organic chemistry"] },

  // LearnoHub
  { id: "lh1", title: "Heredity and Evolution Class 10", subject: "Biology", grade: "Grade 10", duration: "32:40", youtubeId: "8FJDVnO3GDc", channel: "LearnoHub", points: 5, tags: ["heredity", "evolution"] },
  { id: "lh2", title: "Light Reflection Refraction", subject: "Physics", grade: "Grade 10", duration: "35:22", youtubeId: "1vL7gBqifzs", channel: "LearnoHub", points: 5, tags: ["light", "optics"] },

  // CodeWithHarry
  { id: "cwh1", title: "Python Tutorial for Beginners", subject: "Computer Science", grade: "Grade 9", duration: "58:00", youtubeId: "7wnove7K-ZQ", channel: "CodeWithHarry", points: 5, tags: ["python", "programming"] },
  { id: "cwh2", title: "Web Development Full Course", subject: "Computer Science", grade: "Grade 10", duration: "65:30", youtubeId: "l1EssrLxt7E", channel: "CodeWithHarry", points: 5, tags: ["web dev", "HTML"] },

  // Unacademy
  { id: "un1", title: "Thermodynamics Complete", subject: "Physics", grade: "Grade 11", duration: "42:18", youtubeId: "rdCMv0x4RfE", channel: "Unacademy", points: 5, tags: ["thermodynamics"] },
  { id: "un2", title: "Indian Polity Basics", subject: "History", grade: "Grade 10", duration: "38:45", youtubeId: "BwrXWRDvR6U", channel: "Unacademy", points: 5, tags: ["polity", "civics"] },

  // Vedantu
  { id: "vd1", title: "Trigonometry Class 10 One Shot", subject: "Mathematics", grade: "Grade 10", duration: "44:50", youtubeId: "K85PJsBxV6A", channel: "Vedantu", points: 5, tags: ["trigonometry"] },
  { id: "vd2", title: "Chemical Reactions Class 10", subject: "Chemistry", grade: "Grade 10", duration: "40:12", youtubeId: "wSCSrPrio14", channel: "Vedantu", points: 5, tags: ["reactions"] },

  // Khan Academy India
  { id: "kai1", title: "Quadratic Equations Hindi", subject: "Mathematics", grade: "Grade 10", duration: "15:30", youtubeId: "IQtPiOo0VrI", channel: "Khan Academy India", points: 5, tags: ["quadratic", "algebra"] },
  { id: "kai2", title: "Acids Bases and Salts", subject: "Chemistry", grade: "Grade 10", duration: "18:22", youtubeId: "gMiMSCmjOs4", channel: "Khan Academy India", points: 5, tags: ["acids", "bases"] },

  // Dear Sir
  { id: "ds1", title: "Electricity Class 10 Full Chapter", subject: "Physics", grade: "Grade 10", duration: "55:40", youtubeId: "C5gIh_ASy7M", channel: "Dear Sir", points: 5, tags: ["electricity"] },
  { id: "ds2", title: "Real Numbers Class 10", subject: "Mathematics", grade: "Grade 10", duration: "42:15", youtubeId: "47cS0aLPIKk", channel: "Dear Sir", points: 5, tags: ["real numbers"] },

  // Apna College
  { id: "ac1", title: "Java Full Course", subject: "Computer Science", grade: "Grade 11", duration: "72:00", youtubeId: "UmnCZ7-9yDY", channel: "Apna College", points: 5, tags: ["java", "programming"] },
  { id: "ac2", title: "DSA Complete Course", subject: "Computer Science", grade: "Grade 11", duration: "68:30", youtubeId: "z9bZufPHFLU", channel: "Apna College", points: 5, tags: ["DSA", "algorithms"] },

  // BYJU'S
  { id: "by1", title: "States of Matter", subject: "Chemistry", grade: "Grade 9", duration: "12:45", youtubeId: "VDfnv3Zx_eA", channel: "BYJU'S", points: 5, tags: ["matter", "states"] },
  { id: "by2", title: "Force and Laws of Motion", subject: "Physics", grade: "Grade 9", duration: "14:20", youtubeId: "fo_pmp5rtzo", channel: "BYJU'S", points: 5, tags: ["force", "motion"] },

  // Thapa Technical
  { id: "tt1", title: "JavaScript Tutorial Hindi", subject: "Computer Science", grade: "Grade 10", duration: "55:00", youtubeId: "KGkiIBTq0y0", channel: "Thapa Technical", points: 5, tags: ["javascript"] },
  { id: "tt2", title: "React JS Full Course", subject: "Computer Science", grade: "Grade 11", duration: "62:15", youtubeId: "RGKi6LSPDLU", channel: "Thapa Technical", points: 5, tags: ["react", "web dev"] },

  // WsCube Tech
  { id: "ws1", title: "HTML CSS Complete Course", subject: "Computer Science", grade: "Grade 9", duration: "48:30", youtubeId: "HcOc7P5BMi4", channel: "WsCube Tech", points: 5, tags: ["HTML", "CSS"] },
  { id: "ws2", title: "Digital Marketing Basics", subject: "Computer Science", grade: "Grade 11", duration: "35:20", youtubeId: "hiRbMmuJB0E", channel: "WsCube Tech", points: 5, tags: ["digital marketing"] },

  // Manocha Academy
  { id: "ma1", title: "Polynomials Class 9", subject: "Mathematics", grade: "Grade 9", duration: "22:30", youtubeId: "iZBia0SrMYs", channel: "Manocha Academy", points: 5, tags: ["polynomials"] },
  { id: "ma2", title: "Statistics Class 10", subject: "Mathematics", grade: "Grade 10", duration: "25:15", youtubeId: "w2BNtYASfaE", channel: "Manocha Academy", points: 5, tags: ["statistics"] },

  // Edumantra
  { id: "em1", title: "Letter Writing Class 10", subject: "English", grade: "Grade 10", duration: "18:40", youtubeId: "Z4VjRIVTJRo", channel: "Edumantra", points: 5, tags: ["letter writing"] },
  { id: "em2", title: "Reading Comprehension Tips", subject: "English", grade: "Grade 9", duration: "15:30", youtubeId: "J29qnqvBN8A", channel: "Edumantra", points: 5, tags: ["comprehension"] },

  // Aman Dhattarwal
  { id: "ad1", title: "How to Study Effectively", subject: "Science", grade: "Grade 10", duration: "20:15", youtubeId: "UJyGM63BPXM", channel: "Aman Dhattarwal", points: 5, tags: ["study tips"] },
  { id: "ad2", title: "Career Guidance After 10th", subject: "Science", grade: "Grade 10", duration: "25:30", youtubeId: "n04UYFKparg", channel: "Aman Dhattarwal", points: 5, tags: ["career"] },

  // Telusko
  { id: "te1", title: "Python for Beginners", subject: "Computer Science", grade: "Grade 9", duration: "42:00", youtubeId: "QXeEoD0pB3E", channel: "Telusko", points: 5, tags: ["python"] },
  { id: "te2", title: "Spring Boot Tutorial", subject: "Computer Science", grade: "Grade 11", duration: "55:20", youtubeId: "35EQXmHKZYs", channel: "Telusko", points: 5, tags: ["java", "spring"] },

  // StudyIQ IAS
  { id: "si1", title: "Indian Geography Complete", subject: "Geography", grade: "Grade 10", duration: "48:30", youtubeId: "CJK5tUQPbDg", channel: "StudyIQ IAS", points: 5, tags: ["geography", "India"] },
  { id: "si2", title: "Modern History of India", subject: "History", grade: "Grade 10", duration: "52:15", youtubeId: "dP5_-Q3Xr7o", channel: "StudyIQ IAS", points: 5, tags: ["history", "modern India"] },

  // Drishti IAS
  { id: "di1", title: "Indian Constitution", subject: "History", grade: "Grade 10", duration: "45:00", youtubeId: "kfFr6oXGbGY", channel: "Drishti IAS", points: 5, tags: ["constitution", "polity"] },
  { id: "di2", title: "Environment and Ecology", subject: "Biology", grade: "Grade 10", duration: "38:20", youtubeId: "MHjwUqgOCSQ", channel: "Drishti IAS", points: 5, tags: ["environment"] },

  // Utkarsh Classes
  { id: "uc1", title: "Reasoning Complete Course", subject: "Mathematics", grade: "Grade 10", duration: "42:30", youtubeId: "s3fULJnQ2AI", channel: "Utkarsh Classes", points: 5, tags: ["reasoning"] },
  { id: "uc2", title: "English Grammar Full", subject: "English", grade: "Grade 9", duration: "35:15", youtubeId: "0xGPi-Al3T0", channel: "Utkarsh Classes", points: 5, tags: ["grammar"] },

  // Rojgar with Ankit
  { id: "ra1", title: "GK for Competitive Exams", subject: "History", grade: "Grade 10", duration: "30:20", youtubeId: "qMPLs6Z1HpM", channel: "Rojgar with Ankit", points: 5, tags: ["GK", "competitive"] },

  // SSC Adda247
  { id: "sa1", title: "Quantitative Aptitude", subject: "Mathematics", grade: "Grade 10", duration: "40:10", youtubeId: "nkMT-FqifqQ", channel: "SSC Adda247", points: 5, tags: ["aptitude", "maths"] },

  // Let's Talk
  { id: "lt1", title: "Spoken English Practice", subject: "English", grade: "Grade 7", duration: "22:30", youtubeId: "hyL_B9sNFCQ", channel: "Let's Talk", points: 5, tags: ["spoken english"] },
  { id: "lt2", title: "English Vocabulary Building", subject: "English", grade: "Grade 8", duration: "18:45", youtubeId: "JBSmithg7qM", channel: "Let's Talk", points: 5, tags: ["vocabulary"] },

  // MyCodeSchool
  { id: "mcs1", title: "Data Structures Introduction", subject: "Computer Science", grade: "Grade 11", duration: "15:20", youtubeId: "92S4zgXN17o", channel: "MyCodeSchool", points: 5, tags: ["data structures"] },
  { id: "mcs2", title: "Pointers in C/C++", subject: "Computer Science", grade: "Grade 11", duration: "18:30", youtubeId: "h-HBipu_1P0", channel: "MyCodeSchool", points: 5, tags: ["pointers", "C++"] },

  // Gate Smashers
  { id: "gs1", title: "Operating System Full Course", subject: "Computer Science", grade: "Grade 11", duration: "55:00", youtubeId: "bkSWJJZNgf8", channel: "Gate Smashers", points: 5, tags: ["OS"] },
  { id: "gs2", title: "DBMS Complete Course", subject: "Computer Science", grade: "Grade 11", duration: "48:20", youtubeId: "kBdlM6f_Mhc", channel: "Gate Smashers", points: 5, tags: ["DBMS", "database"] },

  // Abdul Bari
  { id: "ab1", title: "Algorithms Full Course", subject: "Computer Science", grade: "Grade 11", duration: "60:00", youtubeId: "0IAPZzGSbME", channel: "Abdul Bari", points: 5, tags: ["algorithms"] },
  { id: "ab2", title: "Linear Algebra", subject: "Mathematics", grade: "Grade 11", duration: "42:15", youtubeId: "Fnfh8jNqBlg", channel: "Abdul Bari", points: 5, tags: ["linear algebra"] },

  // Jenny's Lectures
  { id: "jl1", title: "C Programming Full Course", subject: "Computer Science", grade: "Grade 10", duration: "52:00", youtubeId: "EjavYOFoJJ0", channel: "Jenny's Lectures", points: 5, tags: ["C programming"] },
  { id: "jl2", title: "Compiler Design", subject: "Computer Science", grade: "Grade 11", duration: "45:30", youtubeId: "WccZQSERfCM", channel: "Jenny's Lectures", points: 5, tags: ["compiler"] },

  // Neso Academy
  { id: "na1", title: "Digital Electronics", subject: "Physics", grade: "Grade 11", duration: "38:40", youtubeId: "M0mx8S05v60", channel: "Neso Academy", points: 5, tags: ["digital electronics"] },
  { id: "na2", title: "Computer Networks Basics", subject: "Computer Science", grade: "Grade 11", duration: "42:10", youtubeId: "VwN91x5i25g", channel: "Neso Academy", points: 5, tags: ["networking"] },

  // Saurabh Shukla
  { id: "ss1", title: "OOP Concepts in Java", subject: "Computer Science", grade: "Grade 11", duration: "35:20", youtubeId: "a199KZGMNxk", channel: "Saurabh Shukla", points: 5, tags: ["OOP", "java"] },

  // KnowledgeGate
  { id: "kg1", title: "Theory of Computation", subject: "Computer Science", grade: "Grade 11", duration: "48:00", youtubeId: "58N2N7zJGrQ", channel: "KnowledgeGate", points: 5, tags: ["TOC"] },
  { id: "kg2", title: "Computer Architecture", subject: "Computer Science", grade: "Grade 11", duration: "44:30", youtubeId: "Ol8D69VKX2k", channel: "KnowledgeGate", points: 5, tags: ["architecture"] },

  // Love Babbar
  { id: "lb1", title: "DSA Complete Course C++", subject: "Computer Science", grade: "Grade 11", duration: "72:00", youtubeId: "WQoB2z67hvY", channel: "Love Babbar", points: 5, tags: ["DSA", "C++"] },
  { id: "lb2", title: "Placement Preparation Guide", subject: "Computer Science", grade: "Grade 11", duration: "28:30", youtubeId: "th6GCfJiIFc", channel: "Love Babbar", points: 5, tags: ["placement"] },

  // Striver
  { id: "st1", title: "Recursion Complete", subject: "Computer Science", grade: "Grade 11", duration: "45:00", youtubeId: "yVdKa8dnKiE", channel: "Striver", points: 5, tags: ["recursion", "DSA"] },
  { id: "st2", title: "Dynamic Programming Playlist", subject: "Computer Science", grade: "Grade 11", duration: "55:20", youtubeId: "FfXoiwwnxFw", channel: "Striver", points: 5, tags: ["DP", "algorithms"] },

  // Anuj Bhaiya
  { id: "anb1", title: "DSA One Shot", subject: "Computer Science", grade: "Grade 11", duration: "48:00", youtubeId: "5_5oE5lgrhw", channel: "Anuj Bhaiya", points: 5, tags: ["DSA"] },

  // Simplilearn
  { id: "sl1", title: "Machine Learning Explained", subject: "Computer Science", grade: "Grade 11", duration: "52:30", youtubeId: "ukzFI9rgwfU", channel: "Simplilearn", points: 5, tags: ["ML", "AI"] },
  { id: "sl2", title: "Data Science Full Course", subject: "Computer Science", grade: "Grade 11", duration: "65:00", youtubeId: "ua-CiDNNj30", channel: "Simplilearn", points: 5, tags: ["data science"] },

  // Great Learning
  { id: "gl1", title: "Artificial Intelligence Course", subject: "Computer Science", grade: "Grade 11", duration: "58:00", youtubeId: "JMUxmLyrhSk", channel: "Great Learning", points: 5, tags: ["AI"] },

  // Geeky Shows
  { id: "gks1", title: "Django Full Course", subject: "Computer Science", grade: "Grade 11", duration: "55:00", youtubeId: "JxzZxdht-XY", channel: "Geeky Shows", points: 5, tags: ["django", "python"] },

  // Technical Suneja
  { id: "ts1", title: "Computer Fundamentals", subject: "Computer Science", grade: "Grade 8", duration: "28:15", youtubeId: "Jv920KVGAPI", channel: "Technical Suneja", points: 5, tags: ["fundamentals"] },

  // Yahoo Baba
  { id: "yb1", title: "C++ Full Course Hindi", subject: "Computer Science", grade: "Grade 10", duration: "45:00", youtubeId: "yGB9jhsEsr8", channel: "Yahoo Baba", points: 5, tags: ["C++"] },

  // Learn Coding
  { id: "lc1", title: "PHP Complete Tutorial", subject: "Computer Science", grade: "Grade 11", duration: "42:00", youtubeId: "1SnPKhCdlsU", channel: "Learn Coding", points: 5, tags: ["PHP"] },

  // Padhle
  { id: "pd1", title: "Class 12 Physics Revision", subject: "Physics", grade: "Grade 12", duration: "55:30", youtubeId: "gxZGVG4J-jk", channel: "Padhle", points: 5, tags: ["revision", "class 12"] },
  { id: "pd2", title: "Board Exam Tips", subject: "Science", grade: "Grade 10", duration: "15:20", youtubeId: "xU2v7Cv1XNA", channel: "Padhle", points: 5, tags: ["exam tips"] },

  // Shobhit Nirwan
  { id: "sn1", title: "Class 10 Maths Marathon", subject: "Mathematics", grade: "Grade 10", duration: "62:00", youtubeId: "cBCxHUg-RFI", channel: "Shobhit Nirwan", points: 5, tags: ["maths", "marathon"] },
  { id: "sn2", title: "Class 10 Science One Shot", subject: "Science", grade: "Grade 10", duration: "58:30", youtubeId: "a8DEGxKQMSI", channel: "Shobhit Nirwan", points: 5, tags: ["science", "one shot"] },

  // Prashant Kirad
  { id: "pk1", title: "Class 10 Social Science", subject: "History", grade: "Grade 10", duration: "45:20", youtubeId: "Rl4Xz1O7NjE", channel: "Prashant Kirad", points: 5, tags: ["social science"] },

  // Digraj Singh Rajput
  { id: "dsr1", title: "Class 9 Science Full Course", subject: "Science", grade: "Grade 9", duration: "52:00", youtubeId: "gM95HHI4gLk", channel: "Digraj Singh Rajput", points: 5, tags: ["class 9", "science"] },

  // Bhai Ki Padhai
  { id: "bkp1", title: "Accounts Class 11", subject: "Mathematics", grade: "Grade 11", duration: "48:30", youtubeId: "jKZfBh5AaO4", channel: "Bhai Ki Padhai", points: 5, tags: ["accounts"] },

  // Mandeep Education Academy
  { id: "mea1", title: "CBSE Class 10 History", subject: "History", grade: "Grade 10", duration: "38:40", youtubeId: "wy9NaS6oJnQ", channel: "Mandeep Education Academy", points: 5, tags: ["history", "CBSE"] },

  // Green Board
  { id: "gb1", title: "Class 10 Biology Complete", subject: "Biology", grade: "Grade 10", duration: "42:15", youtubeId: "1kG3Rn6bgcA", channel: "Green Board", points: 5, tags: ["biology"] },

  // Don't Memorise
  { id: "dm1", title: "Probability Made Easy", subject: "Mathematics", grade: "Grade 9", duration: "8:30", youtubeId: "KzfWUEJjG18", channel: "Don't Memorise", points: 5, tags: ["probability"] },
  { id: "dm2", title: "Photosynthesis Explained Simply", subject: "Biology", grade: "Grade 8", duration: "7:15", youtubeId: "D1Ymc311XS8", channel: "Don't Memorise", points: 5, tags: ["photosynthesis"] },

  // English Connection
  { id: "ec1", title: "Tenses in English Grammar", subject: "English", grade: "Grade 8", duration: "25:30", youtubeId: "puNo0sxC3VI", channel: "English Connection", points: 5, tags: ["tenses", "grammar"] },

  // Spoken English Guru
  { id: "seg1", title: "Complete English Speaking Course", subject: "English", grade: "Grade 7", duration: "55:00", youtubeId: "V1V1M-Alk44", channel: "Spoken English Guru", points: 5, tags: ["speaking", "english"] },
  { id: "seg2", title: "Daily Use English Sentences", subject: "English", grade: "Grade 6", duration: "32:20", youtubeId: "t2hEkRoc5os", channel: "Spoken English Guru", points: 5, tags: ["sentences"] },

  // Nitish Rajput
  { id: "nr1", title: "Indian Economy Explained", subject: "History", grade: "Grade 10", duration: "22:15", youtubeId: "x_X0rKD_IjA", channel: "Nitish Rajput", points: 5, tags: ["economy", "India"] },

  // Dhruv Rathee
  { id: "dr1", title: "Climate Change Explained", subject: "Geography", grade: "Grade 9", duration: "18:30", youtubeId: "G4H1N_yXBiA", channel: "Dhruv Rathee", points: 5, tags: ["climate change"] },
  { id: "dr2", title: "How Elections Work in India", subject: "History", grade: "Grade 10", duration: "20:45", youtubeId: "qVIXUhZ2AWs", channel: "Dhruv Rathee", points: 5, tags: ["elections", "democracy"] },
];

export const getGradeNumber = (grade: string): number => {
  const match = grade.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

export const getRecommendedVideos = (userGrade: string, limit = 12): Video[] => {
  const gradeNum = getGradeNumber(userGrade);
  if (!gradeNum) return VIDEO_LIBRARY.slice(0, limit);
  
  // Sort by closest grade, then shuffle within same distance
  const scored = VIDEO_LIBRARY.map(v => ({
    video: v,
    distance: Math.abs(getGradeNumber(v.grade) - gradeNum),
  }));
  scored.sort((a, b) => a.distance - b.distance || Math.random() - 0.5);
  return scored.slice(0, limit).map(s => s.video);
};

export const extractYoutubeId = (url: string): string | null => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};
