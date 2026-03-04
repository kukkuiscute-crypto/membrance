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
