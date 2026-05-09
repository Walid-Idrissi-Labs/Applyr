export const INITIAL_APPLICATIONS = [
  { 
    id: 1, company: 'Google', role: 'Software Engineer', location: 'Remote', status: 'Applied', 
    appliedDate: '2026-04-10', reminderDate: '2026-04-20', url: 'careers.google.com', salary: '$120k', 
    source: 'LinkedIn', tags: 'tech, international',
    notes: 'Entretien RH passé le 14/04. Bon échange, la personne semblait intéressée.',
    history: [
      { status: 'Wishlist', date: '2026-04-01' },
      { status: 'Applied', date: '2026-04-10' }
    ],
    attachments: [{ id: 1, name: 'cv_google.pdf', size: '1.2 MB' }],
    tasks: [
      { id: 1, text: 'Préparer questions', done: true },
      { id: 2, text: 'Réviser algorithmes', done: false }
    ]
  },
  { 
    id: 2, company: 'Meta', role: 'Backend Intern', location: 'Paris', status: 'Interview', 
    appliedDate: '2026-04-07', reminderDate: '', url: '', salary: '', 
    source: 'Site carrière', tags: 'stage, tech',
    notes: 'Test technique à préparer.',
    history: [
      { status: 'Applied', date: '2026-04-07' },
      { status: 'Interview', date: '2026-04-14' }
    ],
    attachments: [],
    tasks: []
  },
  { 
    id: 3, company: 'Capgemini', role: 'Développeur Laravel', location: 'Casablanca', status: 'Wishlist', 
    appliedDate: '', reminderDate: '', url: '', salary: '', 
    source: 'Autre', tags: '',
    notes: 'Refaire mon CV avant de postuler.',
    history: [
      { status: 'Wishlist', date: '2026-04-15' }
    ],
    attachments: [],
    tasks: []
  },
  { 
    id: 4, company: 'OCP Group', role: 'Ingénieur Systèmes', location: 'Rabat', status: 'Rejected', 
    appliedDate: '2026-04-02', reminderDate: '', url: '', salary: '', 
    source: 'LinkedIn', tags: '',
    notes: 'Refus reçu par mail.',
    history: [
      { status: 'Applied', date: '2026-04-02' },
      { status: 'Rejected', date: '2026-04-08' }
    ],
    attachments: [],
    tasks: []
  },
];

export const STATUSES = ['All', 'Wishlist', 'Applied', 'Interview', 'Technical test', 'Offer', 'Accepted', 'Rejected'];
export const ACTIVE_STATUSES = ['Wishlist', 'Applied', 'Interview', 'Technical test', 'Offer'];

export const DEFAULT_INTERVIEW_TASKS = [
  { id: 101, text: 'Rechercher les valeurs de l\'entreprise', done: false },
  { id: 102, text: 'Préparer 3 questions à poser', done: false },
  { id: 103, text: 'Envoyer mail de remerciement post-entretien', done: false }
];

export const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Relance requise', message: 'Il est temps de relancer Google pour le poste Software Engineer.', date: 'Aujourd\'hui', unread: true },
  { id: 2, title: 'Entretien imminent', message: 'N\'oubliez pas votre entretien technique avec Meta demain.', date: 'Hier', unread: true },
  { id: 3, title: 'Candidature importée', message: 'Candidature chez Stripe importée avec succès via Applyr Exporter.', date: 'Il y a 3 jours', unread: false }
];
