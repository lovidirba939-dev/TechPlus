const STAGE_LABELS = [
  'Stage 1 - Fundamentals',
  'Stage 2 - Core Concepts',
  'Stage 3 - Tools and Frameworks',
  'Stage 4 - Real Projects',
  'Stage 5 - Advanced Topics'
];

function buildSteps(def) {
  return STAGE_LABELS.map((label, idx) => ({
    title: label,
    detail: def.stages[idx].join(', '),
    videoUrl: '',
    links: [
      { title: 'Roadmap Reference', url: def.roadmapUrl },
      { title: 'Official Docs', url: def.docsUrl }
    ]
  }));
}

function toQuestions(title) {
  return [
    `How would you evaluate readiness for Stage 3 in ${title}?`,
    `Which project best proves Stage 4 competency in ${title}?`,
    `What trade-offs appear in Stage 5 decisions for ${title}?`
  ];
}

function toCourses(def) {
  return [
    {
      type: 'FREE',
      title: `${def.title} docs and community guides`,
      url: def.docsUrl
    },
    {
      type: 'FREE',
      title: 'Build one portfolio project per stage before moving ahead',
      url: def.roadmapUrl
    },
    {
      type: 'PAID',
      title: `Structured specialization track focused on ${def.title}`,
      url: def.roadmapUrl
    }
  ];
}

const ROADMAP_DEFINITIONS = [
  {
    id: 'frontend-development',
    title: 'Frontend Development',
    badge: 'Core Web',
    description: 'Learn browser fundamentals, modern UI engineering, and production-grade frontend performance.',
    docsUrl: 'https://developer.mozilla.org/',
    roadmapUrl: 'https://roadmap.sh/frontend',
    stages: [
      ['HTML semantics', 'CSS layout systems', 'JavaScript essentials', 'Git workflows'],
      ['DOM events', 'Async data fetching', 'Accessibility basics', 'Responsive design'],
      ['TypeScript', 'React', 'Routing patterns', 'State management'],
      ['Design system page', 'Dashboard with API data', 'Auth-protected app', 'Testing workflow'],
      ['Performance budgets', 'Web Vitals optimization', 'Architecture scaling', 'Observability for UX']
    ]
  },
  {
    id: 'backend-development',
    title: 'Backend Development',
    badge: 'Server Core',
    description: 'Design resilient APIs, data layers, and secure service logic for production systems.',
    docsUrl: 'https://expressjs.com/',
    roadmapUrl: 'https://roadmap.sh/backend',
    stages: [
      ['HTTP lifecycle', 'Node runtime fundamentals', 'REST principles', 'Data modeling basics'],
      ['Authentication flows', 'Validation strategies', 'Error handling', 'Caching concepts'],
      ['Express patterns', 'ORM/ODM usage', 'Queue systems', 'API documentation'],
      ['Multi-tenant API', 'File upload service', 'Webhook processing', 'Background jobs'],
      ['Distributed tracing', 'Rate-limiting strategy', 'Zero-downtime deploys', 'SLO-driven operations']
    ]
  },
  {
    id: 'full-stack-development',
    title: 'Full Stack Development',
    badge: 'End-to-End',
    description: 'Connect user-facing interfaces with secure backend services and reliable deployment pipelines.',
    docsUrl: 'https://roadmap.sh/full-stack',
    roadmapUrl: 'https://roadmap.sh/full-stack',
    stages: [
      ['Web fundamentals', 'Client-server model', 'Version control', 'Database basics'],
      ['SPA architecture', 'REST integration', 'Auth sessions', 'Form and state handling'],
      ['React and Node stack', 'Testing stack', 'CI workflows', 'Cloud deployment tooling'],
      ['Production CRUD platform', 'Role-based dashboard', 'Realtime notifications', 'Analytics integration'],
      ['Scalable architecture', 'Cost optimization', 'Security hardening', 'Team-level coding standards']
    ]
  },
  {
    id: 'react-development',
    title: 'React Development',
    badge: 'UI Specialist',
    description: 'Master component architecture, state orchestration, and performance for complex React apps.',
    docsUrl: 'https://react.dev/',
    roadmapUrl: 'https://roadmap.sh/react',
    stages: [
      ['JSX mental model', 'Component composition', 'Props and state', 'Event handling'],
      ['Hooks patterns', 'Controlled forms', 'Context boundaries', 'Error boundaries'],
      ['React Router', 'State libraries', 'Data-fetching libraries', 'Testing libraries'],
      ['Admin console build', 'Realtime feed UI', 'Multi-step workflow app', 'Accessible component library'],
      ['Render optimization', 'Concurrent features', 'Large app architecture', 'Performance profiling']
    ]
  },
  {
    id: 'nodejs-development',
    title: 'Node.js Development',
    badge: 'Runtime Expert',
    description: 'Build fast backend services with Node.js internals, async patterns, and runtime observability.',
    docsUrl: 'https://nodejs.org/en/docs',
    roadmapUrl: 'https://roadmap.sh/nodejs',
    stages: [
      ['Node event loop', 'Modules and package management', 'Async JavaScript', 'CLI basics'],
      ['HTTP server design', 'Middleware model', 'Input validation', 'Secure configuration'],
      ['Express ecosystem', 'Queues and workers', 'Redis cache', 'Database integration'],
      ['Scalable API service', 'Batch processing worker', 'Event webhook pipeline', 'Monitoring setup'],
      ['Backpressure control', 'Memory tuning', 'High-concurrency design', 'Runtime diagnostics']
    ]
  },
  {
    id: 'devops',
    title: 'DevOps',
    badge: 'Delivery Ops',
    description: 'Automate software delivery, infrastructure reliability, and release confidence at scale.',
    docsUrl: 'https://docs.github.com/actions',
    roadmapUrl: 'https://roadmap.sh/devops',
    stages: [
      ['Linux operations', 'Networking basics', 'Shell scripting', 'Git branching strategies'],
      ['CI/CD principles', 'Container basics', 'Infrastructure as code concepts', 'Monitoring foundations'],
      ['Docker', 'Kubernetes', 'Terraform', 'Prometheus and Grafana'],
      ['Pipeline for microservices', 'Blue-green rollout', 'Incident runbook setup', 'Autoscaling setup'],
      ['SRE metrics', 'Disaster recovery drills', 'Security in pipelines', 'Platform engineering']
    ]
  },
  {
    id: 'cloud-engineering',
    title: 'Cloud Engineering',
    badge: 'Cloud Native',
    description: 'Design, deploy, and operate cloud-native systems with reliability and cost discipline.',
    docsUrl: 'https://docs.aws.amazon.com/',
    roadmapUrl: 'https://roadmap.sh/aws',
    stages: [
      ['Compute and storage basics', 'IAM fundamentals', 'Virtual networking', 'Shared responsibility model'],
      ['Managed databases', 'Load balancing', 'Autoscaling', 'Cloud logging and metrics'],
      ['AWS/Azure/GCP core services', 'Serverless tooling', 'Container platforms', 'Cost-management tools'],
      ['Multi-tier app deployment', 'Global CDN setup', 'Backup strategy implementation', 'Cost-aware environments'],
      ['Multi-region resilience', 'Policy-as-code', 'Cloud governance', 'Security posture automation']
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    badge: 'Security Track',
    description: 'Protect infrastructure and applications through offensive testing and defensive controls.',
    docsUrl: 'https://owasp.org/www-project-top-ten/',
    roadmapUrl: 'https://roadmap.sh/cyber-security',
    stages: [
      ['CIA triad', 'Threat modeling', 'Network basics', 'Security hygiene'],
      ['Web vulnerabilities', 'Auth and access controls', 'Security testing', 'Logging fundamentals'],
      ['Burp Suite', 'SIEM tools', 'Vulnerability scanners', 'Cloud security controls'],
      ['Secure coding audit', 'Incident response drill', 'Threat hunting mini-lab', 'Hardening checklist'],
      ['Zero trust architecture', 'Advanced detection engineering', 'Red-blue exercises', 'Compliance automation']
    ]
  },
  {
    id: 'artificial-intelligence',
    title: 'Artificial Intelligence',
    badge: 'AI Core',
    description: 'Build intelligent systems with modern AI concepts, model workflows, and responsible deployment.',
    docsUrl: 'https://platform.openai.com/docs',
    roadmapUrl: 'https://roadmap.sh/ai-data-scientist',
    stages: [
      ['Python foundations', 'Linear algebra essentials', 'Statistics fundamentals', 'Data preprocessing'],
      ['Supervised learning', 'Unsupervised learning', 'Model evaluation', 'Feature engineering'],
      ['PyTorch/TensorFlow', 'Experiment tracking', 'Prompt engineering', 'Vector databases'],
      ['Classifier project', 'RAG assistant project', 'Model API service', 'Evaluation dashboard'],
      ['Responsible AI', 'Model governance', 'Latency optimization', 'Production drift monitoring']
    ]
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    badge: 'ML Specialist',
    description: 'Move from statistical learning basics to scalable model development and serving.',
    docsUrl: 'https://scikit-learn.org/stable/',
    roadmapUrl: 'https://roadmap.sh/ai-data-scientist',
    stages: [
      ['Probability and stats', 'Regression and classification', 'Data cleaning', 'Train-validation split'],
      ['Model tuning', 'Bias-variance tradeoff', 'Feature selection', 'Cross validation'],
      ['scikit-learn', 'MLflow', 'Pipeline automation', 'Model registry'],
      ['Churn predictor', 'Fraud detection baseline', 'Recommendation prototype', 'Model report card'],
      ['Online inference optimization', 'A/B model rollouts', 'Concept drift controls', 'MLOps governance']
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science',
    badge: 'Insights Track',
    description: 'Transform raw datasets into reliable insights through statistical rigor and experimentation.',
    docsUrl: 'https://pandas.pydata.org/docs/',
    roadmapUrl: 'https://roadmap.sh/ai-data-scientist',
    stages: [
      ['Python and notebooks', 'Data wrangling', 'Exploratory analysis', 'SQL querying'],
      ['Hypothesis testing', 'Distributions', 'Correlation analysis', 'Data storytelling'],
      ['Pandas', 'NumPy', 'Seaborn/Plotly', 'Notebook pipelines'],
      ['Business KPI dashboard', 'Experiment readout project', 'Data quality checks', 'Segment analysis'],
      ['Causal inference basics', 'Productionized analytics', 'Experiment design governance', 'Data ethics']
    ]
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    badge: 'BI Track',
    description: 'Deliver practical business intelligence with trusted metrics, dashboards, and reporting.',
    docsUrl: 'https://learn.microsoft.com/power-bi/',
    roadmapUrl: 'https://roadmap.sh/data-analyst',
    stages: [
      ['Metric definitions', 'Spreadsheet fluency', 'SQL fundamentals', 'Data cleanliness'],
      ['Analytical thinking', 'Dashboard design', 'Funnel analysis', 'Cohort analysis'],
      ['Power BI/Tableau', 'dbt basics', 'Warehouse querying', 'Data visualization tooling'],
      ['Executive dashboard', 'Retention analysis', 'Revenue report automation', 'Data QA checklist'],
      ['Semantic layer design', 'Self-serve analytics governance', 'Advanced experimentation analytics', 'Forecasting basics']
    ]
  },
  {
    id: 'system-design',
    title: 'System Design',
    badge: 'Architecture',
    description: 'Architect distributed systems with clear trade-off reasoning and operational reliability.',
    docsUrl: 'https://martinfowler.com/',
    roadmapUrl: 'https://roadmap.sh/system-design',
    stages: [
      ['Scalability and reliability goals', 'Latency budgeting', 'Data consistency basics', 'API contracts'],
      ['Caching strategies', 'Database trade-offs', 'Message-driven systems', 'Failure handling patterns'],
      ['Queue technologies', 'Observability stack', 'Load balancing systems', 'Service gateways'],
      ['URL shortener design', 'Notification platform design', 'Feed service design', 'Realtime chat design'],
      ['Global multi-region architecture', 'Capacity planning', 'Chaos testing', 'Cost/performance trade-off governance']
    ]
  },
  {
    id: 'microservices',
    title: 'Microservices',
    badge: 'Distributed Services',
    description: 'Split systems into independently deployable services with robust communication and observability.',
    docsUrl: 'https://microservices.io/',
    roadmapUrl: 'https://roadmap.sh/software-architect',
    stages: [
      ['Service boundaries', 'Domain-driven basics', 'API contracts', 'Service ownership'],
      ['Sync vs async communication', 'Event versioning', 'Data consistency approaches', 'Resilience patterns'],
      ['API gateway', 'Service mesh', 'Broker technologies', 'Distributed tracing tools'],
      ['Order workflow with saga', 'Inventory service split', 'Audit/event pipeline', 'Independent deploy pipeline'],
      ['Cross-service governance', 'Platform APIs', 'Latency budgeting per service', 'Incident isolation strategy']
    ]
  },
  {
    id: 'blockchain',
    title: 'Blockchain',
    badge: 'Chain Core',
    description: 'Understand distributed ledgers, smart contracts, and secure on-chain application design.',
    docsUrl: 'https://ethereum.org/developers/docs/',
    roadmapUrl: 'https://roadmap.sh/blockchain',
    stages: [
      ['Ledger fundamentals', 'Consensus concepts', 'Wallet basics', 'Cryptographic primitives'],
      ['Transaction lifecycle', 'Token standards', 'Contract security basics', 'Gas mechanics'],
      ['Solidity', 'Hardhat/Foundry', 'On-chain indexing tools', 'Wallet integration libraries'],
      ['ERC-20 project', 'Simple DAO voting contract', 'Contract audit checklist', 'On-chain analytics dashboard'],
      ['MEV awareness', 'Cross-chain interoperability', 'Formal verification basics', 'Protocol governance models']
    ]
  },
  {
    id: 'web3',
    title: 'Web3',
    badge: 'dApp Track',
    description: 'Build user-facing decentralized apps that integrate wallets, contracts, and web clients.',
    docsUrl: 'https://docs.ethers.org/',
    roadmapUrl: 'https://roadmap.sh/web3',
    stages: [
      ['Wallet and identity basics', 'Decentralized app architecture', 'Chain interaction model', 'Transaction UX'],
      ['Token-based permissions', 'dApp security basics', 'On-chain and off-chain data patterns', 'RPC fundamentals'],
      ['ethers.js/wagmi', 'Wallet connectors', 'Indexing tools', 'Contract interaction SDKs'],
      ['Wallet-auth app', 'NFT explorer', 'Governance dashboard', 'Decentralized marketplace prototype'],
      ['Gas optimization strategy', 'Cross-chain dApp architecture', 'Robust fallback RPC design', 'User safety patterns']
    ]
  },
  {
    id: 'mobile-development',
    title: 'Mobile Development',
    badge: 'Cross Platform',
    description: 'Ship high-quality mobile experiences with reliable state, performance, and release workflows.',
    docsUrl: 'https://reactnative.dev/docs/getting-started',
    roadmapUrl: 'https://roadmap.sh/android',
    stages: [
      ['Mobile UI basics', 'Navigation patterns', 'State persistence', 'App lifecycle understanding'],
      ['Networking and caching', 'Offline behavior', 'Authentication flows', 'Permission handling'],
      ['React Native/Flutter core tools', 'Build pipelines', 'Crash reporting', 'Push notification tooling'],
      ['Social feed app', 'Location-based app', 'Offline-first notes app', 'Subscription flow app'],
      ['Performance tuning', 'Release automation', 'A/B mobile experiments', 'Observability on mobile']
    ]
  },
  {
    id: 'android-development',
    title: 'Android Development',
    badge: 'Android Native',
    description: 'Build robust Android apps with Kotlin, modern architecture components, and scalable releases.',
    docsUrl: 'https://developer.android.com/docs',
    roadmapUrl: 'https://roadmap.sh/android',
    stages: [
      ['Kotlin basics', 'Activity and Fragment lifecycle', 'UI fundamentals', 'Gradle fundamentals'],
      ['Jetpack architecture components', 'State and navigation', 'Data storage patterns', 'Testing basics'],
      ['Compose UI', 'Room database', 'Dependency injection', 'Background work manager'],
      ['Commerce app module', 'Realtime chat module', 'Offline sync module', 'Analytics instrumentation'],
      ['Performance profiling', 'Battery optimization', 'Advanced CI/CD for Play Store', 'Large-team modularization']
    ]
  },
  {
    id: 'ios-development',
    title: 'iOS Development',
    badge: 'iOS Native',
    description: 'Develop polished iOS apps with Swift, modern UI frameworks, and strong release quality.',
    docsUrl: 'https://developer.apple.com/documentation/',
    roadmapUrl: 'https://roadmap.sh/ios',
    stages: [
      ['Swift language basics', 'Xcode workflow', 'UIKit/SwiftUI basics', 'App lifecycle'],
      ['State management in SwiftUI', 'Networking and decoding', 'Persistence patterns', 'Security fundamentals'],
      ['SwiftUI advanced components', 'Combine basics', 'Core Data', 'Testing frameworks'],
      ['Finance tracker app', 'Media feed app', 'Push-notification feature', 'In-app purchase flow'],
      ['Accessibility excellence', 'Performance instrumentation', 'Release automation', 'Scalable app architecture']
    ]
  },
  {
    id: 'game-development',
    title: 'Game Development',
    badge: 'Interactive Systems',
    description: 'Create engaging games through mechanics design, engine mastery, and optimized runtime behavior.',
    docsUrl: 'https://learn.unity.com/',
    roadmapUrl: 'https://roadmap.sh/game-developer',
    stages: [
      ['Game loops', 'Input systems', 'Physics fundamentals', 'Object-oriented gameplay code'],
      ['Level design principles', 'State machines', 'Animation systems', 'Audio integration'],
      ['Unity or Unreal toolchains', 'Asset pipelines', 'Scripting workflows', 'Profiling tools'],
      ['2D platformer', '3D action prototype', 'Multiplayer mini-mode', 'In-game economy prototype'],
      ['Live ops basics', 'Performance optimization', 'Cross-platform build strategy', 'Monetization and retention systems']
    ]
  },
  {
    id: 'embedded-systems',
    title: 'Embedded Systems',
    badge: 'Hardware Software',
    description: 'Develop firmware for constrained devices with real-time and low-level reliability concerns.',
    docsUrl: 'https://www.arm.com/resources/education',
    roadmapUrl: 'https://roadmap.sh/cpp',
    stages: [
      ['C/C++ fundamentals', 'Digital electronics basics', 'Microcontroller architecture', 'Memory constraints'],
      ['Interrupts and timers', 'Peripheral interfaces', 'Power management basics', 'Debug fundamentals'],
      ['RTOS basics', 'Build toolchains', 'Hardware debugging tools', 'Communication protocols'],
      ['Sensor firmware project', 'Bootloader setup', 'Low-power telemetry node', 'Firmware update pipeline'],
      ['Safety-critical considerations', 'Deterministic timing design', 'Secure firmware update strategy', 'Manufacturing diagnostics']
    ]
  },
  {
    id: 'iot-development',
    title: 'IoT Development',
    badge: 'Connected Devices',
    description: 'Build end-to-end IoT systems across devices, gateways, cloud ingestion, and monitoring.',
    docsUrl: 'https://aws.amazon.com/iot/',
    roadmapUrl: 'https://roadmap.sh/software-architect',
    stages: [
      ['Sensor and actuator basics', 'Network protocols overview', 'Edge and cloud model', 'Data telemetry basics'],
      ['MQTT patterns', 'Device provisioning', 'Secure communication', 'Remote command handling'],
      ['IoT platform tooling', 'Time-series storage', 'Edge runtime tools', 'Rules engines'],
      ['Smart environment prototype', 'Predictive alerting pipeline', 'Fleet dashboard', 'Device provisioning workflow'],
      ['Fleet security governance', 'Offline edge resilience', 'Cost and bandwidth optimization', 'IoT observability strategy']
    ]
  },
  {
    id: 'database-engineering',
    title: 'Database Engineering',
    badge: 'Data Infrastructure',
    description: 'Design scalable database systems with strong data correctness, performance, and maintainability.',
    docsUrl: 'https://www.postgresql.org/docs/',
    roadmapUrl: 'https://roadmap.sh/postgresql-dba',
    stages: [
      ['Relational modeling', 'Normalization', 'SQL query writing', 'Index basics'],
      ['Transactions and isolation', 'Query optimization', 'Schema migration planning', 'Backup strategies'],
      ['PostgreSQL/MySQL internals', 'NoSQL trade-offs', 'Replication tooling', 'Monitoring tooling'],
      ['High-traffic schema redesign', 'Read replica rollout', 'ETL pipeline integration', 'Audit logging pipeline'],
      ['Sharding approaches', 'Disaster recovery architecture', 'Data governance framework', 'Capacity and cost planning']
    ]
  },
  {
    id: 'software-testing',
    title: 'Software Testing',
    badge: 'Quality Track',
    description: 'Establish quality confidence with robust unit, integration, and end-to-end testing strategy.',
    docsUrl: 'https://testing-library.com/docs/',
    roadmapUrl: 'https://roadmap.sh/qa',
    stages: [
      ['Testing fundamentals', 'Assertions and test design', 'Bug lifecycle basics', 'Risk-based prioritization'],
      ['Unit and integration strategy', 'Test doubles and mocking', 'Regression planning', 'Exploratory testing'],
      ['Jest/Vitest', 'Playwright/Cypress', 'API testing tools', 'CI test orchestration'],
      ['Critical path automation suite', 'Flaky test remediation', 'Performance test baseline', 'Release gate checks'],
      ['Quality metrics governance', 'Shift-left strategy', 'Reliability engineering collaboration', 'Test architecture at scale']
    ]
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    badge: 'Product Design',
    description: 'Create intuitive product experiences through user research, interaction design, and design systems.',
    docsUrl: 'https://www.nngroup.com/articles/',
    roadmapUrl: 'https://roadmap.sh/ux-design',
    stages: [
      ['Design principles', 'Visual hierarchy', 'Typography basics', 'Accessibility fundamentals'],
      ['User research methods', 'Information architecture', 'Interaction patterns', 'Usability testing'],
      ['Figma workflows', 'Design system tooling', 'Prototyping tools', 'Handoff and collaboration tools'],
      ['End-to-end feature redesign', 'Usability benchmark test', 'Design system component set', 'A/B tested UX experiment'],
      ['Design ops governance', 'Cross-platform consistency strategy', 'Advanced accessibility compliance', 'Outcome-driven design iteration']
    ]
  }
];

export const ROADMAPS = ROADMAP_DEFINITIONS.map((def) => ({
  id: def.id,
  title: def.title,
  badge: def.badge,
  description: def.description,
  steps: buildSteps(def),
  pdfPath: `/pdfs/${def.id}-roadmap.pdf`,
  color: 'var(--accent-purple)'
}));

export const ROADMAP_QUESTIONS = Object.fromEntries(
  ROADMAP_DEFINITIONS.map((def) => [def.id, toQuestions(def.title)])
);

export const COURSE_SUGGESTIONS = Object.fromEntries(
  ROADMAP_DEFINITIONS.map((def) => [def.id, toCourses(def)])
);


