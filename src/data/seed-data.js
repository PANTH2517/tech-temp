export const site = {
  name: "TECHFEST '27",
  theme: 'Paradox',
  start: '2027-02-12T09:00:00+05:30',
  venue: 'NMIMS MPSTME, Shirpur',
  prizePool: '₹5,00,000',
  baseParticipants: 4800
};

export const events = [
  {
    id: 'loop', twin: 'Finite Loop', title: 'Infinite Loop', cat: 'Code', kind: '24-hour hackathon', day: 1, start_time: '10:00', venue: 'Innovation Lab', team: '2–4',
    prize: '₹1,00,000', prize_amount: 100000, capacity: 120, base_registered: 86,
    description: 'The problem statement is released only when you submit your solution. Build anything that bends a rule, then explain which rule it bends.',
    rules: ['Teams of 2 to 4 students.', 'Any language, framework or tool is allowed.', 'Code must be written during the 24 hours.', 'Projects are judged on idea, execution and how well they bend the rule.'],
    tags: ['hackathon', 'team', 'overnight']
  },
  {
    id: 'robo', twin: 'Immovable vs Unstoppable', title: 'Unstoppable vs Immovable', cat: 'Robotics', kind: 'Robowars', day: 2, start_time: '14:00', venue: 'Main Arena', team: '3–5',
    prize: '₹75,000', prize_amount: 75000, capacity: 40, base_registered: 31,
    description: 'Attack bots against defence bots in a 6 × 6 m arena. Something has to give, and the arena will decide what.',
    rules: ['Bot weight limit is 8 kg.', 'No flammable, liquid or projectile weapons.', 'Each bout lasts three minutes.', 'Inspection happens one hour before your first bout.'],
    tags: ['robots', 'team', 'live']
  },
  {
    id: 'quiz', twin: 'The Honest Quiz', title: "The Liar's Quiz", cat: 'Quiz', kind: 'Tech quiz', day: 2, start_time: '11:00', venue: 'Seminar Hall', team: '2',
    prize: '₹20,000', prize_amount: 20000, capacity: 100, base_registered: 64,
    description: 'One option in every round lies about being wrong. Three rounds, one buzzer, no phones.',
    rules: ['Teams of exactly 2.', 'No phones or smart devices in the hall.', 'Three rounds: written, buzzer and rapid fire.', 'The quizmaster’s decision is final.'],
    tags: ['quiz', 'pairs']
  },
  {
    id: 'data', twin: 'More Is Less', title: 'Less Is More', cat: 'Data', kind: 'Data challenge', day: 1, start_time: '15:00', venue: 'Lab 204', team: '1–3',
    prize: '₹40,000', prize_amount: 40000, capacity: 60, base_registered: 41,
    description: 'You get a 2 GB dataset and a five-minute pitch. The team that tells the story with the fewest charts wins.',
    rules: ['Teams of 1 to 3.', 'The dataset is shared at the start of the event.', 'Pitch is capped at five minutes.', 'Fewer charts score higher when the story is equally clear.'],
    tags: ['data', 'pitch']
  },
  {
    id: 'ux', twin: 'Good UI, Bad UX', title: 'Bad UI, Good UX', cat: 'Design', kind: 'Design sprint', day: 3, start_time: '10:00', venue: 'Design Studio', team: '1–2',
    prize: '₹30,000', prize_amount: 30000, capacity: 50, base_registered: 28,
    description: 'Design the most frustrating interface that still gets the job done. Judged by real users with a stopwatch.',
    rules: ['Solo or pairs.', 'Figma, Penpot or any prototype tool is fine.', 'Users must still finish the task.', 'Score is task time plus a delight rating.'],
    tags: ['design', 'ux']
  },
  {
    id: 'ship', twin: 'Ship of Theseus II', title: 'Ship of Theseus', cat: 'Code', kind: 'Relay coding', day: 3, start_time: '13:00', venue: 'Lab 101', team: '3',
    prize: '₹50,000', prize_amount: 50000, capacity: 45, base_registered: 33,
    description: 'Every 45 minutes your code is handed to the next team. By the end, whose project is it?',
    rules: ['Teams of exactly 3.', 'Code is passed on every 45 minutes.', 'Write a short handover note each time.', 'Final score blends working features and clean handovers.'],
    tags: ['relay', 'team']
  },
  {
    id: 'ctf', twin: 'Release the Paradox', title: 'Capture the Paradox', cat: 'Security', kind: 'Jeopardy CTF', day: 1, start_time: '18:00', venue: 'Cyber Lab', team: '2–3',
    prize: '₹60,000', prize_amount: 60000, capacity: 70, base_registered: 52,
    description: 'An overnight capture-the-flag where some flags are decoys that look exactly like real ones.',
    rules: ['Teams of 2 or 3.', 'No attacking the scoreboard or other teams.', 'Decoy flags cost points.', 'Writeups are required for the top ten.'],
    tags: ['security', 'ctf', 'overnight']
  },
  {
    id: 'game', twin: 'Lose to Win', title: 'Win to Lose', cat: 'Gaming', kind: 'E-sports', day: 2, start_time: '17:00', venue: 'Auditorium', team: '1–5',
    prize: '₹45,000', prize_amount: 45000, capacity: 80, base_registered: 57,
    description: 'Shooter and football brackets with one twist round where the lowest score advances.',
    rules: ['Bring your own peripherals.', 'Brackets are announced on the day.', 'The twist round counts for double.', 'Disputes go to the referee table.'],
    tags: ['esports', 'live']
  }
];

export const days = [
  { day: 1, label: 'Day 1', date_label: 'Fri 12 Feb', theme: 'Begin at the end' },
  { day: 2, label: 'Day 2', date_label: 'Sat 13 Feb', theme: 'The middle is the edge' },
  { day: 3, label: 'Day 3', date_label: 'Sun 14 Feb', theme: 'End at the beginning' }
];

export const slots = [
  [1, '09:00', 'Closing ceremony (yes, first)', 'Main stage', null],
  [1, '10:00', 'Infinite Loop hackathon begins', 'Innovation Lab', 'loop'],
  [1, '13:00', 'Talk: building things that should not work', 'Auditorium', null],
  [1, '15:00', 'Less Is More data challenge', 'Lab 204', 'data'],
  [1, '18:00', 'Capture the Paradox CTF, overnight', 'Cyber Lab', 'ctf'],
  [2, '09:30', 'Robotics expo', 'Central quad', null],
  [2, '11:00', "The Liar's Quiz", 'Seminar Hall', 'quiz'],
  [2, '14:00', 'Unstoppable vs Immovable', 'Main Arena', 'robo'],
  [2, '17:00', 'Win to Lose e-sports finals', 'Auditorium', 'game'],
  [2, '20:00', 'Pro night: a silent concert, very loud', 'Open grounds', null],
  [3, '10:00', 'Bad UI, Good UX design sprint', 'Design Studio', 'ux'],
  [3, '13:00', 'Ship of Theseus relay coding', 'Lab 101', 'ship'],
  [3, '16:00', 'Hackathon results', 'Main stage', null],
  [3, '18:00', 'Opening ceremony', 'Main stage', null]
];

export const team = [
  ['Aarav Mehta', 'Festival Lead', 'Keeps the whole fest on schedule and on budget.'],
  ['Diya Kulkarni', 'Head of Events', 'Owns the rulebooks, judges and event-day flow.'],
  ['Kabir Shah', 'Technical Lead', 'Runs labs, networks and the website you are on.'],
  ['Ira Patil', 'Design Lead', 'Looks after branding, posters and stage visuals.'],
  ['Vihaan Rao', 'Sponsorship', 'Talks to partners and turns them into prizes.'],
  ['Anaya Thakur', 'Logistics', 'Venues, hostels, food and everything that moves.'],
  ['Reyansh Joshi', 'Marketing', 'Campus outreach, socials and college visits.'],
  ['Myra Desai', 'Hospitality', 'Looks after guests, judges and outstation teams.']
];

export const sponsors = [
  ['Nimbus Labs', 'Title'], ['Kiloverse', 'Title'], ['Orbital Pay', 'Gold'], ['Quanta Systems', 'Gold'],
  ['Halcyon AI', 'Gold'], ['Bytewell', 'Silver'], ['Lumen Grid', 'Silver'], ['Parallax Bank', 'Silver'],
  ['Corvid Robotics', 'Silver'], ['Saffron Cloud', 'Community'], ['Tessera', 'Community'], ['Vantage Motors', 'Community']
];

export const faq = [
  ['Who can participate?', 'Any UG or PG student with a valid college ID.'],
  ['Is there a registration fee?', 'Registration is ₹199 per person. It covers all three days and every event.'],
  ['Can I join more than one event?', 'Yes, as long as the timings do not clash. The site warns you if two events overlap.'],
  ['Is accommodation provided?', 'Limited hostel rooms are available for outstation teams. Request one after registering.'],
  ['What are the team sizes?', 'They are listed on every event page. Most events allow 1 to 4 people.'],
  ['Who do I contact?', 'Use the contact form on the FAQ page or write to techfest@college.example. This address is a placeholder.']
];

const projects = {
  compiler: { title: 'Polite Compiler', desc: 'A tiny compiler that refuses bad code, politely, with suggestions.', url: 'https://example.com/polite-compiler', tags: ['Rust', 'Compilers'] },
  attendance: { title: 'Attendance Radar', desc: 'Predicts how many classes you can skip and still stay above 75%.', url: 'https://example.com/attendance', tags: ['Python', 'Data'] },
  rover: { title: 'Rover-3', desc: 'A line-following rover with an obstacle-avoidance mode that mostly works.', url: 'https://example.com/rover3', tags: ['Arduino', 'Robotics'] },
  notes: { title: 'Notes That Link', desc: 'Markdown notes that link to each other and draw a graph of your thinking.', url: 'https://example.com/notes', tags: ['React', 'Graphs'] },
  budget: { title: 'Hostel Budget', desc: 'Splits mess bills and chai runs between roommates without arguments.', url: 'https://example.com/budget', tags: ['Flutter', 'Firebase'] },
  ctf: { title: 'CTF Writeups', desc: 'Writeups for 30 beginner CTF challenges, with the mistakes left in.', url: 'https://example.com/ctf', tags: ['Security', 'Writing'] },
  portfolio: { title: 'Poster Machine', desc: 'Generates event posters from a spreadsheet of names and times.', url: 'https://example.com/posters', tags: ['Design', 'Node'] },
  vision: { title: 'Seat Finder', desc: 'Counts empty seats in the library with a webcam and a small model.', url: 'https://example.com/seats', tags: ['CV', 'Python'] }
};

export const users = [
  { name: 'Demo Participant', email: 'demo@techfest.dev', college: 'NMIMS MPSTME Shirpur', handle: 'demo', headline: 'Full-stack tinkerer who likes impossible objects', bio: 'Third-year CS student. I build small tools, break them on purpose and write down what happened. Here to compete in the hackathon and lose gracefully at the quiz.', accent: '#C6FF3D', theme: 'dark', layout: 'cards', cover: 'mobius', emoji: '🌀', skills: ['React', 'Node.js', 'SQLite', 'Three.js', 'Figma'], projects: [projects.notes, projects.compiler, projects.rover], links: [{ label: 'GitHub', url: 'https://github.com/example' }, { label: 'LinkedIn', url: 'https://linkedin.com/in/example' }, { label: 'Website', url: 'https://example.com' }], events: ['loop', 'ux', 'ctf'] },
  { name: 'Aanya Iyer', email: 'aanya@example.com', college: 'VJTI Mumbai', handle: 'aanya', headline: 'Compilers, type systems and chai', bio: 'I like languages that say no. Currently building a toy compiler and trying to explain monads without crying.', accent: '#7DD3FC', theme: 'dark', layout: 'timeline', cover: 'grid', emoji: '🧠', skills: ['Rust', 'C++', 'Compilers', 'Haskell'], projects: [projects.compiler, projects.notes], links: [{ label: 'GitHub', url: 'https://github.com/example' }], events: ['loop', 'ship', 'quiz'] },
  { name: 'Rohan Deshmukh', email: 'rohan@example.com', college: 'COEP Pune', handle: 'rohan', headline: 'Robots that mostly obey', bio: 'Mechatronics student. Two bots built, one still working. Looking for a team for the robowars.', accent: '#FF7A59', theme: 'dark', layout: 'cards', cover: 'dots', emoji: '🤖', skills: ['Arduino', 'CAD', 'Embedded C', 'PCB design'], projects: [projects.rover], links: [{ label: 'Instagram', url: 'https://instagram.com/example' }], events: ['robo', 'game'] },
  { name: 'Sara Qureshi', email: 'sara@example.com', college: 'SPIT Mumbai', handle: 'sara', headline: 'Interfaces that frustrate on purpose', bio: 'Product designer by training, troublemaker by habit. Entering Bad UI, Good UX with a plan to be very annoying.', accent: '#F9A8D4', theme: 'aurora', layout: 'minimal', cover: 'waves', emoji: '🎨', skills: ['Figma', 'Motion design', 'User research', 'Framer'], projects: [projects.portfolio], links: [{ label: 'Dribbble', url: 'https://dribbble.com/example' }, { label: 'Website', url: 'https://example.com' }], events: ['ux', 'quiz'] },
  { name: 'Kabir Nair', email: 'kabir@example.com', college: 'NMIMS MPSTME Shirpur', handle: 'kabirn', headline: 'Breaking things for fun and flags', bio: 'Security club. I enjoy decoy flags more than real ones and I am not sorry.', accent: '#C6FF3D', theme: 'dark', layout: 'cards', cover: 'grid', emoji: '🔐', skills: ['Security', 'Linux', 'Python', 'Reversing'], projects: [projects.ctf], links: [{ label: 'GitHub', url: 'https://github.com/example' }], events: ['ctf', 'loop'] },
  { name: 'Meera Joshi', email: 'meera@example.com', college: 'PICT Pune', handle: 'meera', headline: 'Data stories with fewer charts', bio: 'Statistics student who believes one good chart beats ten. Signed up for Less Is More to prove it.', accent: '#FDE68A', theme: 'light', layout: 'timeline', cover: 'dots', emoji: '📊', skills: ['Python', 'Pandas', 'Statistics', 'Tableau'], projects: [projects.attendance], links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/example' }], events: ['data', 'quiz', 'ship'] },
  { name: 'Arjun Verma', email: 'arjun@example.com', college: 'IIT Bombay', handle: 'arjun', headline: 'Systems and speedrunning', bio: 'Likes fast things: databases, compilers and game consoles. Here for the e-sports bracket.', accent: '#A78BFA', theme: 'dark', layout: 'cards', cover: 'mobius', emoji: '⚡', skills: ['Go', 'Postgres', 'Linux', 'Networking'], projects: [projects.budget], links: [{ label: 'GitHub', url: 'https://github.com/example' }], events: ['game', 'loop', 'ctf'] },
  { name: 'Tara Bhatt', email: 'tara@example.com', college: 'MIT-WPU Pune', handle: 'tara', headline: 'Mobile apps with good manners', bio: 'Flutter developer. I care about empty states and loading skeletons more than is healthy.', accent: '#6EE7B7', theme: 'aurora', layout: 'cards', cover: 'waves', emoji: '📱', skills: ['Flutter', 'Dart', 'Firebase', 'UI polish'], projects: [projects.budget, projects.portfolio], links: [{ label: 'Website', url: 'https://example.com' }], events: ['ux', 'ship'] },
  { name: 'Neel Chavan', email: 'neel@example.com', college: 'VESIT Mumbai', handle: 'neel', headline: 'Computer vision in the library', bio: 'Trying to teach a webcam to find a free seat. It keeps finding my bag.', accent: '#38BDF8', theme: 'dark', layout: 'minimal', cover: 'grid', emoji: '👁️', skills: ['Python', 'OpenCV', 'PyTorch', 'Edge devices'], projects: [projects.vision], links: [{ label: 'GitHub', url: 'https://github.com/example' }], events: ['loop', 'data'] },
  { name: 'Zoya Farooqui', email: 'zoya@example.com', college: 'NIT Karnataka', handle: 'zoya', headline: 'Writes docs people actually read', bio: 'Open source contributor and part-time quiz addict. Will happily argue about commas.', accent: '#FCA5A5', theme: 'light', layout: 'timeline', cover: 'dots', emoji: '✍️', skills: ['Technical writing', 'Git', 'Markdown', 'Open source'], projects: [projects.notes], links: [{ label: 'GitHub', url: 'https://github.com/example' }, { label: 'Blog', url: 'https://example.com/blog' }], events: ['quiz', 'data'] },
  { name: 'Ishaan Lal', email: 'ishaan@example.com', college: 'KJSCE Mumbai', handle: 'ishaan', headline: 'Hardware hacker, software tolerator', bio: 'Soldering iron first, keyboard second. Building a bot for Unstoppable vs Immovable.', accent: '#FB923C', theme: 'dark', layout: 'cards', cover: 'mobius', emoji: '🔧', skills: ['Electronics', 'ESP32', 'C', 'Soldering'], projects: [projects.rover], links: [], events: ['robo', 'ship'] },
  { name: 'Myra Sethi', email: 'myra@example.com', college: 'SVNIT Surat', handle: 'myra', headline: 'Frontend with a motion habit', bio: 'I animate things that did not ask to be animated. Learning WebGL because the strip looked cool.', accent: '#C6FF3D', theme: 'aurora', layout: 'cards', cover: 'mobius', emoji: '✨', skills: ['GSAP', 'Three.js', 'TypeScript', 'CSS'], projects: [projects.notes, projects.portfolio], links: [{ label: 'CodePen', url: 'https://codepen.io/example' }], events: ['ux', 'loop', 'ship'] }
];
