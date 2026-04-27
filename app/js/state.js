const STATUSES = ['All', 'Wishlist', 'Applied', 'Interview', 'Technical Test', 'Offer', 'Accepted', 'Rejected'];
const ACTIVE_STATUSES = ['Wishlist', 'Applied', 'Interview', 'Technical Test', 'Offer'];

const DEFAULT_INTERVIEW_TASKS = [
  { id: 101, text: 'Research company core values', done: false },
  { id: 102, text: 'Prepare 3 questions to ask', done: false },
  { id: 103, text: 'Send post-interview thank you email', done: false }
];

let state = {
  isAuthenticated: false,
  authMode: 'login',
  activeTab: 'Applications',
  viewMode: 'list',
  statusFilter: 'All',
  searchQuery: '',
  modalMode: null,
  editingApp: null,
  isSidebarOpen: true,
  theme: localStorage.getItem('theme') || 'light',
  
  currentTasks: [],
  currentAttachments: [],
  formStatus: 'Wishlist',
  
  globalCV: "Experienced Software Engineer with a background in building scalable web applications using Laravel, React, and Node.js. Strong focus on backend architecture, API design, and performance optimization. Passionate about clean code and agile methodologies.",

  generatedResumes: [
    { id: 1, company: 'Stripe', date: '2026-04-12', name: 'Tailored_CV_Stripe.pdf' }
  ],

  notifications: [
    { id: 1, title: 'Follow-up required', message: 'It\'s time to follow up with Google for the Software Engineer role.', date: 'Today', unread: true },
    { id: 2, title: 'Upcoming interview', message: 'Don\'t forget your technical interview with Meta tomorrow.', date: 'Yesterday', unread: true },
    { id: 3, title: 'Application imported', message: 'Application at Stripe was successfully imported via Applyr Exporter.', date: '3 days ago', unread: false }
  ],

  applications: [
    { 
      id: 1, company: 'Google', role: 'Software Engineer', location: 'Remote', status: 'Applied', 
      appliedDate: '2026-04-10', reminderDate: '2026-04-20', url: 'careers.google.com', salary: '$120k', 
      source: 'LinkedIn', tags: 'tech, international',
      notes: 'HR interview passed on 04/14. Good exchange, the recruiter seemed interested.',
      history: [
        { status: 'Wishlist', date: '2026-04-01' },
        { status: 'Applied', date: '2026-04-10' }
      ],
      attachments: [{ id: 1, name: 'cv_google.pdf', size: '1.2 MB' }],
      tasks: [
        { id: 1, text: 'Prepare behavioral questions', done: true },
        { id: 2, text: 'Review algorithms', done: false }
      ]
    },
    { 
      id: 2, company: 'Meta', role: 'Backend Intern', location: 'Paris', status: 'Interview', 
      appliedDate: '2026-04-07', reminderDate: '', url: '', salary: '', 
      source: 'Career Site', tags: 'internship, tech',
      notes: 'Need to prepare for the technical test.',
      history: [
        { status: 'Applied', date: '2026-04-07' },
        { status: 'Interview', date: '2026-04-14' }
      ],
      attachments: [],
      tasks: []
    },
    { 
      id: 3, company: 'Capgemini', role: 'Laravel Developer', location: 'Casablanca', status: 'Wishlist', 
      appliedDate: '', reminderDate: '', url: '', salary: '', 
      source: 'Other', tags: '',
      notes: 'Redo my resume before applying.',
      history: [
        { status: 'Wishlist', date: '2026-04-15' }
      ],
      attachments: [],
      tasks: []
    },
    { 
      id: 4, company: 'OCP Group', role: 'Systems Engineer', location: 'Rabat', status: 'Rejected', 
      appliedDate: '2026-04-02', reminderDate: '', url: '', salary: '', 
      source: 'LinkedIn', tags: '',
      notes: 'Rejection received via email.',
      history: [
        { status: 'Applied', date: '2026-04-02' },
        { status: 'Rejected', date: '2026-04-08' }
      ],
      attachments: [],
      tasks: []
    }
  ]
};
