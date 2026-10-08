export const site = {
  name: 'TITAN',
  tagline: 'building small, useful things for the web',
  role: 'ai & software engineering',
  description:
    "TITAN's portfolio — a software developer building small, useful things for the web.",
  theme: 'green' as 'green' | 'amber',
  nav: [
    { key: '1', label: 'about', href: '#about' },
    { key: '2', label: 'education', href: '#education' },
    { key: '3', label: 'experience', href: '#experience' },
    { key: '4', label: 'projects', href: '#projects' },
    { key: '5', label: 'skills', href: '#skills' },
    { key: '6', label: 'contact', href: '#contact' }
  ],
  education: [
    {
      school: 'Telkom University Jakarta',
      degree: 'Bachelor of Information Systems',
      detail: 'Faculty of Industrial Engineering',
      period: '2023 - Present',
      location: 'Jakarta, Indonesia',
      description:
        'GPA 3.71/4.00. Studying how information systems, software and business processes fit together, with a growing focus on AI and RAG. Currently working on a capstone project and a final thesis.'
    },
    {
      school: 'SMA Yayasan Pupuk Kaltim',
      degree: 'High School Diploma',
      period: '2019 - 2022',
      location: 'Bontang, East Kalimantan, Indonesia',
      description: 'Completed senior high school with a focus on social studies.'
    }
  ] as { school: string; degree: string; detail?: string; period?: string; location?: string; description?: string }[],
  experience: [
    {
      role: 'Software Developer Intern',
      org: 'Indonesia Stock Exchange',
      period: 'Jul 2026 - Sep 2026',
      location: 'Jakarta, Indonesia',
      points: [
        'Built a proof-of-concept enterprise RAG chatbot with LLM switching between on-prem and commercial models, in a two-person team.',
        'Worked on the RAG pipeline, chat history, PDF export, source citations and confidence scoring.'
      ]
    }
  ] as { role: string; org?: string; period?: string; location?: string; points: string[] }[],
  about: [
    "I'm Triztan, an aspiring developer based in Jakarta.",
    'I spend most of my time around AI tooling and software engineering, turning rough ideas into code.',
    "When I'm not coding, I'm probably reading about new tools or tinkering with a side project.",
    "Feel free to check out my portfolio!"
  ],
  skills: {
    languages: ['PHP', 'JavaScript', 'Python', 'Java', 'HTML/CSS', 'SQL'],
    frameworks: ['Next.js', 'Tailwind CSS', 'Node.js', 'Vue.js', 'Laravel'],
    tools: ['Git', 'Docker', 'Vercel', 'Linux', 'Neovim']
  },
  links: {
    email: 'kingswata@gmail.com',
    github: 'https://github.com/portannn',
    linkedin: 'https://linkedin.com/in/triztan-2005'
  }
};
