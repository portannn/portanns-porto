export const site = {
  name: 'Triztan',
  tagline: 'building small, useful things for the web',
  role: 'ai & software engineering',
  description:
    "Triztan's portfolio, an aspiring ai & software engineer building things for the web.",
  theme: 'green' as 'green' | 'amber',
  nav: [
    { key: '1', label: 'about', href: '#about' },
    { key: '2', label: 'projects', href: '#projects' },
    { key: '3', label: 'experience', href: '#experience' },
    { key: '4', label: 'education', href: '#education' },
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
  // `projects` are content-collection ids, so each skill points at where it was actually used
  skills: [
    {
      group: 'ai',
      items: [
        { name: 'RAG', projects: ['enterprise-rag-chatbot'] },
        { name: 'LLM integration', projects: ['enterprise-rag-chatbot'] },
        { name: 'LangChain', projects: ['enterprise-rag-chatbot'] },
        { name: 'ChromaDB', projects: ['enterprise-rag-chatbot'] },
        { name: 'Ollama', projects: ['enterprise-rag-chatbot'] }
      ]
    },
    {
      group: 'data',
      items: [
        { name: 'Python', projects: ['enterprise-rag-chatbot', 'sales-performance-analysis'] },
        { name: 'SQL', projects: ['gymbro', 'sales-performance-analysis', 'enterprise-rag-chatbot'] },
        { name: 'Pentaho (Kettle)', projects: ['sales-performance-analysis'] },
        { name: 'Looker Studio', projects: ['sales-performance-analysis'] },
        { name: 'K-Means / CRISP-DM', projects: ['sales-performance-analysis'] }
      ]
    },
    {
      group: 'development',
      items: [
        { name: 'FastAPI', projects: ['enterprise-rag-chatbot'] },
        { name: 'Next.js', projects: ['enterprise-rag-chatbot'] },
        { name: 'Express.js', projects: ['gymbro'] },
        { name: 'Flutter', projects: ['gymbro'] },
        { name: 'JavaScript', projects: ['coinpath'] },
        { name: 'Firebase', projects: ['coinpath'] },
        { name: 'REST APIs', projects: ['gymbro', 'enterprise-rag-chatbot'] }
      ]
    },
    {
      group: 'tools',
      items: [
        { name: 'Git / GitHub', projects: ['gymbro'] },
        { name: 'Docker', projects: ['enterprise-rag-chatbot'] },
        { name: 'Vercel', projects: ['coinpath'] },
        { name: 'Linux', projects: [] },
        { name: 'Neovim', projects: [] }
      ]
    },
    {
      group: 'also-familiar-with',
      items: [
        { name: 'PHP', projects: [] },
        { name: 'Laravel', projects: [] },
        { name: 'Java', projects: [] },
        { name: 'Vue.js', projects: [] },
        { name: 'Node.js', projects: [] },
        { name: 'Tailwind CSS', projects: [] },
        { name: 'HTML/CSS', projects: [] }
      ]
    }
  ] as { group: string; items: { name: string; projects: string[] }[] }[],
  projectLabels: {
    'enterprise-rag-chatbot': 'rag-chatbot',
    coinpath: 'coinpath',
    gymbro: 'gymbro',
    'sales-performance-analysis': 'sales-analysis'
  } as Record<string, string>,
  certifications: [
    'IT Specialist - Data Analytics (PKSTI Bandung, 2026)',
    'Mastering UI/UX (Consultee and Co., 2025)',
    'Innovation in Marketing and Branding (Consultee and Co., 2025)'
  ],
  languages: ['Indonesian (native)', 'English'],
  links: {
    cv: '/Triztan-Fairuz-CV.pdf',
    email: 'kingswata@gmail.com',
    github: 'https://github.com/portannn',
    linkedin: 'https://linkedin.com/in/triztan-2005'
  }
};
