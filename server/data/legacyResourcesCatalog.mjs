const course = ({
  title,
  url,
  desc,
  platform,
  domain,
  difficulty,
  resourceType,
  tags = []
}) => ({
  title,
  url,
  desc,
  platform,
  domain,
  difficulty,
  resourceType,
  tags
});

const playlistSeries = ({
  title,
  desc,
  domain,
  difficulty,
  duration,
  tags = [],
  playlist
}) => ({
  title,
  desc,
  platform: "YouTube",
  domain,
  difficulty,
  duration,
  resourceType: "YouTube Playlist",
  tags,
  playlist
});

export const LEGACY_CATALOG = [
  {
    category: "Web Engineering",
    links: [
      course({
        title: "Meta Front-End Developer Professional Certificate",
        url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
        desc: "Comprehensive front-end program covering HTML, CSS, JavaScript, React, accessibility, testing, and portfolio projects.",
        platform: "Coursera",
        domain: "Frontend Development",
        difficulty: "Beginner to Advanced",
        resourceType: "Paid Course",
        tags: ["frontend", "html", "css", "javascript", "react"]
      }),
      course({
        title: "Meta Back-End Developer Professional Certificate",
        url: "https://www.coursera.org/professional-certificates/meta-back-end-developer",
        desc: "Production-oriented back-end curriculum with Python, databases, APIs, Django, and deployment fundamentals.",
        platform: "Coursera",
        domain: "Backend Development",
        difficulty: "Beginner to Advanced",
        resourceType: "Paid Course",
        tags: ["backend", "api", "python", "django", "sql"]
      }),
      course({
        title: "Meta Full Stack Developer Specialization",
        url: "https://www.coursera.org/specializations/meta-full-stack-developer",
        desc: "End-to-end full stack path that combines frontend, backend, databases, APIs, and career-ready projects.",
        platform: "Coursera",
        domain: "Full Stack Development",
        difficulty: "Beginner to Advanced",
        resourceType: "Paid Course",
        tags: ["full stack", "react", "python", "api"]
      }),
      course({
        title: "JavaScript Algorithms and Data Structures Certification",
        url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/",
        desc: "FreeCodeCamp certification focused on core JavaScript, ES6, debugging, functional programming, and algorithms.",
        platform: "FreeCodeCamp",
        domain: "JavaScript",
        difficulty: "Beginner to Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["javascript", "algorithms", "web"]
      }),
      course({
        title: "Build JavaScript Applications with TypeScript",
        url: "https://learn.microsoft.com/en-us/training/paths/build-javascript-applications-typescript/",
        desc: "Microsoft Learn path for building safer JavaScript apps using TypeScript, tooling, and typed APIs.",
        platform: "Microsoft Learn",
        domain: "TypeScript",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["typescript", "javascript", "microsoft"]
      }),
      course({
        title: "Complete Intro to React, v9",
        url: "https://frontendmasters.com/courses/complete-react-v9/",
        desc: "Modern React course covering React 18/19, TanStack tools, testing, forms, and performance patterns.",
        platform: "Frontend Masters",
        domain: "React",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["react", "frontend", "vite", "testing"]
      }),
      course({
        title: "Learn Next.js",
        url: "https://nextjs.org/learn",
        desc: "Official Next.js learning path for App Router, data fetching, rendering strategies, and deployment.",
        platform: "Google Developers",
        domain: "Next.js",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["next.js", "react", "frontend", "vercel"]
      }),
      course({
        title: "Responsive Web Design Certification",
        url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
        desc: "Foundational certification on semantic HTML, modern CSS, accessibility, responsive layouts, and production habits.",
        platform: "FreeCodeCamp",
        domain: "Frontend Development",
        difficulty: "Beginner",
        resourceType: "Free Course With Certificate",
        tags: ["html", "css", "responsive", "frontend"]
      }),
      course({
        title: "Front End Development Libraries Certification",
        url: "https://www.freecodecamp.org/learn/front-end-development-libraries/",
        desc: "Certification covering React, Redux, Bootstrap, jQuery, Sass, and component-based UI development.",
        platform: "FreeCodeCamp",
        domain: "React",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["react", "redux", "frontend", "libraries"]
      }),
      course({
        title: "The Complete Node.js Developer Course",
        url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/",
        desc: "Well-known Udemy course covering Node.js, Express, MongoDB, REST APIs, auth, testing, and deployment.",
        platform: "Udemy",
        domain: "Node.js",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["node.js", "express", "mongodb", "backend"]
      }),
      playlistSeries({
        title: "React Developer Playlist",
        desc: "Curated React learning path with hooks, routing, state, and modern app structure from trusted channels.",
        domain: "React",
        difficulty: "Intermediate",
        duration: "6h 20m",
        tags: ["react", "hooks", "routing", "frontend"],
        playlist: [
          { title: "React Course for Beginners", videoId: "SqcY0GlETPk", duration: "48:23" },
          { title: "React Hooks Explained", videoId: "TNhaISOUy6Q", duration: "35:12" },
          { title: "React Router v6 Tutorial", videoId: "Ul3y1LXxzdU", duration: "41:08" },
          { title: "Building Custom Hooks", videoId: "J-g9ZJha8FE", duration: "28:55" }
        ]
      }),
      playlistSeries({
        title: "Next.js App Router Playlist",
        desc: "Project-style Next.js series focused on App Router, server components, auth, and deployment workflows.",
        domain: "Next.js",
        difficulty: "Intermediate",
        duration: "5h 10m",
        tags: ["next.js", "react", "server components"],
        playlist: [
          { title: "Next.js 14 Full Course", videoId: "wm5gMKuwSYk", duration: "55:00" },
          { title: "App Router Deep Dive", videoId: "gSSsZReIFRk", duration: "38:30" },
          { title: "Server vs Client Components", videoId: "ojqNM5g3QR0", duration: "22:15" },
          { title: "Deploy Next.js to Vercel", videoId: "2HBIzEx6IZA", duration: "18:20" }
        ]
      }),
      playlistSeries({
        title: "JavaScript Foundations Playlist",
        desc: "Strong JavaScript fundamentals sequence covering language basics, closures, DOM, async flow, and modern syntax.",
        domain: "JavaScript",
        difficulty: "Beginner to Intermediate",
        duration: "5h 05m",
        tags: ["javascript", "async", "dom", "es6"],
        playlist: [
          { title: "JavaScript Full Course", videoId: "hdI2bqOjy3s", duration: "45:20" },
          { title: "Closures and Scope", videoId: "vKJpN5FAeF4", duration: "28:15" },
          { title: "Async JavaScript", videoId: "PoRJizFvM7s", duration: "35:40" },
          { title: "Modern JavaScript ES6+", videoId: "NCwa_xi0Uuc", duration: "38:22" }
        ]
      })
    ]
  },
  {
    category: "Backend & Languages",
    links: [
      course({
        title: "Google IT Automation with Python Professional Certificate",
        url: "https://www.coursera.org/professional-certificates/google-it-automation",
        desc: "Excellent Python and automation certificate covering scripting, Git, troubleshooting, and systems tasks.",
        platform: "Coursera",
        domain: "Python",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["python", "automation", "git"]
      }),
      course({
        title: "Java Programming and Software Engineering Fundamentals",
        url: "https://www.coursera.org/specializations/java-programming",
        desc: "University-backed Java path covering OOP, data structures, testing, and software engineering practices.",
        platform: "Coursera",
        domain: "Java",
        difficulty: "Beginner to Intermediate",
        resourceType: "Paid Course",
        tags: ["java", "oop", "software engineering"]
      }),
      course({
        title: "Beginning C++ Programming - From Beginner to Beyond",
        url: "https://www.udemy.com/course/beginning-c-plus-plus-programming/",
        desc: "High-signal C++ course covering language fundamentals, STL, OOP, and problem solving.",
        platform: "Udemy",
        domain: "C++",
        difficulty: "Beginner to Intermediate",
        resourceType: "Paid Course",
        tags: ["c++", "stl", "oop"]
      }),
      course({
        title: "Go Language Path",
        url: "https://www.pluralsight.com/paths/go",
        desc: "Structured Pluralsight path for Go syntax, concurrency, tooling, and production back-end patterns.",
        platform: "Pluralsight",
        domain: "Go",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["go", "backend", "concurrency"]
      }),
      course({
        title: "Rust Path",
        url: "https://www.pluralsight.com/paths/rust",
        desc: "Modern Rust learning path focused on ownership, safety, tooling, and systems-level application design.",
        platform: "Pluralsight",
        domain: "Rust",
        difficulty: "Intermediate to Advanced",
        resourceType: "Paid Course",
        tags: ["rust", "systems", "performance"]
      }),
      course({
        title: "Back End Development and APIs Certification",
        url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
        desc: "Free certification path for Node.js, Express, APIs, npm, and backend fundamentals.",
        platform: "FreeCodeCamp",
        domain: "Backend Development",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["backend", "apis", "node.js", "express"]
      }),
      course({
        title: "Scientific Computing with Python Certification",
        url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
        desc: "Project-based Python certification covering core syntax, computation, and software fundamentals.",
        platform: "FreeCodeCamp",
        domain: "Python",
        difficulty: "Beginner",
        resourceType: "Free Course With Certificate",
        tags: ["python", "foundations", "programming"]
      }),
      course({
        title: "Relational Database Certification",
        url: "https://www.freecodecamp.org/learn/relational-database/",
        desc: "Hands-on SQL and relational database certification with PostgreSQL, shell, and database scripting.",
        platform: "FreeCodeCamp",
        domain: "SQL",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["sql", "postgresql", "database"]
      }),
      course({
        title: "Meta Database Engineer Professional Certificate",
        url: "https://www.coursera.org/professional-certificates/meta-database-engineer",
        desc: "Database-focused program covering SQL, schema design, optimization, and data engineering basics.",
        platform: "Coursera",
        domain: "Database Engineering",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["database", "sql", "data modeling"]
      }),
      course({
        title: "SQL for Data Science",
        url: "https://www.coursera.org/learn/sql-for-data-science",
        desc: "Practical SQL course used widely for data analysis, joins, aggregations, and reporting logic.",
        platform: "Coursera",
        domain: "SQL",
        difficulty: "Beginner to Intermediate",
        resourceType: "Paid Course",
        tags: ["sql", "analytics", "data"]
      }),
      course({
        title: "Introduction to NoSQL Databases",
        url: "https://www.coursera.org/learn/introduction-nosql-databases-big-data",
        desc: "Covers NoSQL database concepts, scaling trade-offs, document stores, and distributed data models.",
        platform: "Coursera",
        domain: "NoSQL",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["nosql", "mongodb", "distributed systems"]
      }),
      playlistSeries({
        title: "Node.js Backend Playlist",
        desc: "Curated Node.js backend sequence covering Express, REST APIs, MongoDB, JWT auth, and error handling.",
        domain: "Node.js",
        difficulty: "Intermediate",
        duration: "5h 40m",
        tags: ["node.js", "express", "api"],
        playlist: [
          { title: "Node.js and Express Full Course", videoId: "Oe421EPjeBE", duration: "52:10" },
          { title: "Express Middleware Deep Dive", videoId: "SccSCuHhOw0", duration: "28:44" },
          { title: "MongoDB and Mongoose", videoId: "ExcRbA7fy_A", duration: "42:15" },
          { title: "JWT Authentication Tutorial", videoId: "7Q17ubqLfaM", duration: "38:50" }
        ]
      }),
      playlistSeries({
        title: "Python Developer Playlist",
        desc: "Curated Python developer sequence for foundations, APIs, automation, and practical scripting.",
        domain: "Python",
        difficulty: "Beginner to Intermediate",
        duration: "5h 15m",
        tags: ["python", "automation", "backend"],
        playlist: [
          { title: "Python Full Course", videoId: "rfscVS0vtbw", duration: "4:26:52" },
          { title: "Python OOP Tutorial", videoId: "JeznW_7DlB0", duration: "34:52" },
          { title: "Automate Tasks with Python", videoId: "qbW6FRbaSl0", duration: "32:19" }
        ]
      }),
      playlistSeries({
        title: "SQL and Databases Playlist",
        desc: "Practical SQL and database series covering relational design, queries, indexing, and reporting use cases.",
        domain: "Database Engineering",
        difficulty: "Intermediate",
        duration: "4h 50m",
        tags: ["sql", "database", "postgresql"],
        playlist: [
          { title: "SQL Full Course", videoId: "HXV3zeQKqGY", duration: "3:50:00" },
          { title: "Database Design Tutorial", videoId: "ztHopE5Wnpc", duration: "33:14" },
          { title: "PostgreSQL Indexing Basics", videoId: "q-JsgN8KxZY", duration: "22:40" }
        ]
      })
    ]
  },
  {
    category: "AI & Data",
    links: [
      course({
        title: "AI for Everyone",
        url: "https://www.coursera.org/learn/ai-for-everyone",
        desc: "Strong non-math introduction to AI strategy, product thinking, team roles, and deployment realities.",
        platform: "Coursera",
        domain: "Artificial Intelligence",
        difficulty: "Beginner",
        resourceType: "Paid Course",
        tags: ["ai", "strategy", "product"]
      }),
      course({
        title: "Machine Learning Specialization",
        url: "https://www.coursera.org/specializations/machine-learning-introduction",
        desc: "The modern Andrew Ng machine learning path covering supervised learning, trees, recommender systems, and more.",
        platform: "Coursera",
        domain: "Machine Learning",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["ml", "supervised learning", "python"]
      }),
      course({
        title: "Deep Learning Specialization",
        url: "https://www.coursera.org/specializations/deep-learning",
        desc: "Industry-standard deep learning curriculum covering CNNs, sequence models, transformers, and optimization.",
        platform: "Coursera",
        domain: "Deep Learning",
        difficulty: "Advanced",
        resourceType: "Paid Course",
        tags: ["deep learning", "neural networks", "transformers"]
      }),
      course({
        title: "IBM Data Science Professional Certificate",
        url: "https://www.coursera.org/professional-certificates/ibm-data-science",
        desc: "Comprehensive data science program with Python, SQL, notebooks, visualization, and capstone work.",
        platform: "Coursera",
        domain: "Data Science",
        difficulty: "Beginner to Intermediate",
        resourceType: "Paid Course",
        tags: ["data science", "python", "sql", "visualization"]
      }),
      course({
        title: "Google Data Analytics Professional Certificate",
        url: "https://www.coursera.org/professional-certificates/google-data-analytics",
        desc: "Excellent entry-level analytics certificate focused on spreadsheets, SQL, dashboards, and business analysis.",
        platform: "Coursera",
        domain: "Data Analytics",
        difficulty: "Beginner",
        resourceType: "Paid Course",
        tags: ["data analytics", "sql", "dashboards"]
      }),
      course({
        title: "Machine Learning Crash Course",
        url: "https://developers.google.com/machine-learning/crash-course",
        desc: "Google's hands-on machine learning course with exercises, real models, and core ML concepts.",
        platform: "Google Developers",
        domain: "Machine Learning",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["ml", "google", "practical"]
      }),
      course({
        title: "Data Analysis with Python Certification",
        url: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
        desc: "Free certification for pandas, NumPy, data wrangling, statistical analysis, and reporting workflows.",
        platform: "FreeCodeCamp",
        domain: "Data Analytics",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["pandas", "python", "analytics"]
      }),
      course({
        title: "Data Visualization Certification",
        url: "https://www.freecodecamp.org/learn/data-visualization/",
        desc: "Project-based data visualization certification using D3, SVG, chart design, and interactive analytics.",
        platform: "FreeCodeCamp",
        domain: "Data Science",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["d3", "visualization", "data science"]
      }),
      course({
        title: "Machine Learning with Python Certification",
        url: "https://www.freecodecamp.org/learn/machine-learning-with-python/",
        desc: "Applied ML certification using Python, TensorFlow, and practical supervised learning projects.",
        platform: "FreeCodeCamp",
        domain: "Machine Learning",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["machine learning", "python", "tensorflow"]
      }),
      playlistSeries({
        title: "Machine Learning Playlist",
        desc: "Trusted ML sequence covering supervised learning, evaluation, trees, clustering, and practical workflows.",
        domain: "Machine Learning",
        difficulty: "Intermediate",
        duration: "6h 05m",
        tags: ["machine learning", "scikit-learn", "evaluation"],
        playlist: [
          { title: "Machine Learning Crash Course", videoId: "7eh4d6sabA0", duration: "55:00" },
          { title: "Linear and Logistic Regression", videoId: "GNhgr_OnQOM", duration: "42:30" },
          { title: "Decision Trees and Random Forests", videoId: "D0efHEJsfHo", duration: "38:15" },
          { title: "Model Evaluation", videoId: "fSytzGwwBVw", duration: "32:20" }
        ]
      }),
      playlistSeries({
        title: "Deep Learning Playlist",
        desc: "Visual and practical deep learning journey across neural networks, backpropagation, and transformer concepts.",
        domain: "Deep Learning",
        difficulty: "Intermediate to Advanced",
        duration: "4h 20m",
        tags: ["deep learning", "neural networks", "transformers"],
        playlist: [
          { title: "What is a Neural Network?", videoId: "aircAruvnKk", duration: "19:13" },
          { title: "Gradient Descent", videoId: "IHZwWFHWa-w", duration: "21:00" },
          { title: "Backpropagation Explained", videoId: "Ilg3gGewQ5U", duration: "13:53" },
          { title: "Transformers Explained", videoId: "wjZofJX0v4M", duration: "27:00" }
        ]
      }),
      playlistSeries({
        title: "Data Science Playlist",
        desc: "Data science learning path for notebooks, pandas, storytelling, EDA, and experiment-style analysis.",
        domain: "Data Science",
        difficulty: "Intermediate",
        duration: "5h 35m",
        tags: ["data science", "pandas", "eda"],
        playlist: [
          { title: "Python for Data Science Course", videoId: "LHBE6Q9XlzI", duration: "1:57:20" },
          { title: "Pandas Tutorial", videoId: "vmEHCJofslg", duration: "1:02:43" },
          { title: "Data Analysis Project Walkthrough", videoId: "Gp8bw7wouU8", duration: "48:17" }
        ]
      }),
      playlistSeries({
        title: "Artificial Intelligence Playlist",
        desc: "Curated AI app-development path focused on LLM concepts, embeddings, agents, and production workflows.",
        domain: "Artificial Intelligence",
        difficulty: "Intermediate to Advanced",
        duration: "5h 10m",
        tags: ["ai", "llm", "agents", "rag"],
        playlist: [
          { title: "LangChain Full Course", videoId: "lG7Uxts9SXs", duration: "52:00" },
          { title: "RAG with LangChain and Pinecone", videoId: "tcqEUSNCn8I", duration: "38:30" },
          { title: "Building AI Agents", videoId: "DWUdGFCU2XA", duration: "42:15" },
          { title: "OpenAI API and App Workflow", videoId: "ikvnMnBHkNE", duration: "35:20" }
        ]
      })
    ]
  },
  {
    category: "Cloud & DevOps",
    links: [
      course({
        title: "Cloud DevOps Engineer Nanodegree",
        url: "https://www.udacity.com/course/cloud-dev-ops-nanodegree--nd9991",
        desc: "High-quality DevOps program covering CI/CD, Kubernetes, containers, monitoring, and cloud deployment.",
        platform: "Udacity",
        domain: "DevOps",
        difficulty: "Intermediate to Advanced",
        resourceType: "Paid Course",
        tags: ["devops", "cloud", "ci/cd"]
      }),
      course({
        title: "Google Cloud Digital Leader Training",
        url: "https://www.coursera.org/professional-certificates/google-cloud-digital-leader-training",
        desc: "Strong cloud computing foundation with cloud concepts, services, architecture, and governance.",
        platform: "Coursera",
        domain: "Cloud Computing",
        difficulty: "Beginner",
        resourceType: "Paid Course",
        tags: ["cloud", "google cloud", "architecture"]
      }),
      course({
        title: "AWS Cloud Practitioner Essentials",
        url: "https://skillbuilder.aws/learn",
        desc: "Official AWS learning path for cloud fundamentals, compute, storage, security, and pricing basics.",
        platform: "AWS",
        domain: "AWS",
        difficulty: "Beginner",
        resourceType: "Free Course With Certificate",
        tags: ["aws", "cloud", "foundations"]
      }),
      course({
        title: "Docker and Kubernetes: The Practical Guide",
        url: "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/",
        desc: "Hands-on Docker course with container workflows, image design, Kubernetes deployment, and scaling.",
        platform: "Udemy",
        domain: "Docker",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["docker", "kubernetes", "containers"]
      }),
      course({
        title: "Kubernetes for Developers Path",
        url: "https://www.pluralsight.com/paths/kubernetes-for-developers",
        desc: "Focused Kubernetes path for developers building, deploying, and operating cloud-native applications.",
        platform: "Pluralsight",
        domain: "Kubernetes",
        difficulty: "Advanced",
        resourceType: "Paid Course",
        tags: ["kubernetes", "cloud-native", "platform"]
      }),
      course({
        title: "GitHub Actions Learning Path",
        url: "https://learn.microsoft.com/en-us/training/paths/automate-workflow-github-actions/",
        desc: "Official Microsoft/GitHub path for GitHub Actions automation, CI/CD, and workflow engineering.",
        platform: "Microsoft Learn",
        domain: "DevOps",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["github actions", "ci/cd", "automation"]
      }),
      course({
        title: "Azure Fundamentals Learning Path",
        url: "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals-describe-cloud-concepts/",
        desc: "Cloud fundamentals path for Azure services, networking, security, and shared responsibility.",
        platform: "Microsoft Learn",
        domain: "Cloud Computing",
        difficulty: "Beginner",
        resourceType: "Free Course With Certificate",
        tags: ["azure", "cloud", "fundamentals"]
      }),
      playlistSeries({
        title: "DevOps Foundations Playlist",
        desc: "Curated DevOps path covering CI/CD, pipelines, automation, and software delivery thinking.",
        domain: "DevOps",
        difficulty: "Intermediate",
        duration: "5h 05m",
        tags: ["devops", "ci/cd", "pipelines"],
        playlist: [
          { title: "GitHub Actions Full Course", videoId: "R8_veQiYBjI", duration: "48:00" },
          { title: "CI/CD Pipeline with Node.js", videoId: "eB0nUzAI7M8", duration: "32:30" },
          { title: "Terraform Full Course", videoId: "SLB_c_ayRMo", duration: "55:00" },
          { title: "Deploying to AWS with GitHub Actions", videoId: "BsynaFoVdKQ", duration: "35:20" }
        ]
      }),
      playlistSeries({
        title: "Docker and Kubernetes Playlist",
        desc: "Practical containers playlist focused on Docker fundamentals, Compose, Kubernetes deployments, and security.",
        domain: "Kubernetes",
        difficulty: "Intermediate to Advanced",
        duration: "6h 00m",
        tags: ["docker", "kubernetes", "containers"],
        playlist: [
          { title: "Docker Complete Course", videoId: "3c-iBn73dDE", duration: "55:00" },
          { title: "Docker Compose Tutorial", videoId: "HG6yIjR1rXc", duration: "38:30" },
          { title: "Kubernetes for Beginners", videoId: "X48VuDVv0do", duration: "60:00" },
          { title: "Helm Package Manager", videoId: "-ykwb1d0DXU", duration: "28:30" }
        ]
      }),
      playlistSeries({
        title: "AWS Cloud Playlist",
        desc: "AWS-focused learning sequence for cloud foundations, IAM, compute, storage, and networking.",
        domain: "AWS",
        difficulty: "Beginner to Intermediate",
        duration: "4h 55m",
        tags: ["aws", "cloud", "iam", "networking"],
        playlist: [
          { title: "AWS Cloud Practitioner Essentials", videoId: "SOTamWNgDKc", duration: "60:00" },
          { title: "AWS EC2 and S3 Basics", videoId: "a9__D53WsUs", duration: "38:20" },
          { title: "AWS IAM Deep Dive", videoId: "Ul2tZFhAfag", duration: "28:45" },
          { title: "AWS VPC and Networking", videoId: "bGDMeD6kOz0", duration: "35:30" }
        ]
      })
    ]
  },
  {
    category: "Security & Systems",
    links: [
      course({
        title: "Google Cybersecurity Professional Certificate",
        url: "https://www.coursera.org/professional-certificates/google-cybersecurity",
        desc: "Excellent career-ready security certificate with SIEM, Linux, Python, incident response, and hardening.",
        platform: "Coursera",
        domain: "Cybersecurity",
        difficulty: "Beginner to Intermediate",
        resourceType: "Paid Course",
        tags: ["cybersecurity", "linux", "siem", "security"]
      }),
      course({
        title: "Learn Ethical Hacking From Scratch",
        url: "https://www.udemy.com/course/learn-ethical-hacking-from-scratch/",
        desc: "Popular ethical hacking course focused on network attacks, web testing, and Linux-based workflows.",
        platform: "Udemy",
        domain: "Ethical Hacking",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["ethical hacking", "linux", "penetration testing"]
      }),
      course({
        title: "Information Security Certification",
        url: "https://www.freecodecamp.org/learn/information-security/",
        desc: "Free certification covering security engineering, Node.js security labs, and applied verification projects.",
        platform: "FreeCodeCamp",
        domain: "Cybersecurity",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["security", "node.js", "hardening"]
      }),
      course({
        title: "Embedded Systems Essentials with Arm",
        url: "https://www.edx.org/learn/embedded-systems/arm-education-embedded-systems-essentials-with-arm-getting-started",
        desc: "Structured embedded systems foundation covering low-level systems, hardware concepts, and embedded software.",
        platform: "edX",
        domain: "Embedded Systems",
        difficulty: "Beginner to Intermediate",
        resourceType: "Paid Course",
        tags: ["embedded", "arm", "systems"]
      }),
      course({
        title: "Introduction to the Internet of Things and Embedded Systems",
        url: "https://www.coursera.org/learn/iot",
        desc: "Foundational IoT course covering connected systems, sensors, communication models, and device thinking.",
        platform: "Coursera",
        domain: "IoT",
        difficulty: "Beginner",
        resourceType: "Paid Course",
        tags: ["iot", "embedded", "sensors"]
      }),
      playlistSeries({
        title: "Cybersecurity Playlist",
        desc: "Curated cybersecurity learning path covering OWASP, API security, Linux, and practical defensive concepts.",
        domain: "Cybersecurity",
        difficulty: "Intermediate",
        duration: "5h 25m",
        tags: ["security", "owasp", "linux"],
        playlist: [
          { title: "OWASP Top 10 Explained", videoId: "WlmKwIe9z1Q", duration: "45:00" },
          { title: "JWT Security Best Practices", videoId: "rCkDE2me_qk", duration: "25:40" },
          { title: "Secure API Design", videoId: "AJ8M9WEeZ-k", duration: "38:00" },
          { title: "Linux Command Line Crash Course", videoId: "VbEx7B_PTOE", duration: "52:00" }
        ]
      }),
      playlistSeries({
        title: "Ethical Hacking Playlist",
        desc: "Practical ethical hacking sequence for reconnaissance, exploitation basics, and security testing workflows.",
        domain: "Ethical Hacking",
        difficulty: "Intermediate",
        duration: "5h 10m",
        tags: ["ethical hacking", "nmap", "metasploit"],
        playlist: [
          { title: "Ethical Hacking Full Course", videoId: "fNzpcB7ODxQ", duration: "60:00" },
          { title: "Nmap and Recon", videoId: "4t4kBkMsDbQ", duration: "38:15" },
          { title: "SQL Injection Attack and Defense", videoId: "ciNHn38EyRU", duration: "32:30" },
          { title: "Metasploit Framework Tutorial", videoId: "8lR27r8Y_ik", duration: "42:00" }
        ]
      }),
      playlistSeries({
        title: "System Design Playlist",
        desc: "Strong systems playlist for scalability, databases, caching, queues, and service design trade-offs.",
        domain: "System Design",
        difficulty: "Advanced",
        duration: "5h 50m",
        tags: ["system design", "scalability", "distributed systems"],
        playlist: [
          { title: "System Design for Beginners", videoId: "i53Gi_K3o7I", duration: "42:55" },
          { title: "Database Scaling Strategies", videoId: "W2Z7GOfH07U", duration: "35:12" },
          { title: "Caching with Redis", videoId: "jgpVdJB2sKQ", duration: "28:40" },
          { title: "Microservices Architecture", videoId: "lTAcCNbJ7KE", duration: "45:22" }
        ]
      }),
      playlistSeries({
        title: "Microservices Playlist",
        desc: "Curated microservices path for service boundaries, brokers, tracing, resilience, and API gateways.",
        domain: "Microservices",
        difficulty: "Advanced",
        duration: "4h 45m",
        tags: ["microservices", "distributed systems", "architecture"],
        playlist: [
          { title: "Microservices Architecture", videoId: "rv4LlmLmVWk", duration: "56:20" },
          { title: "Event-Driven Architecture", videoId: "STKCRSUsyP0", duration: "34:10" },
          { title: "Distributed Tracing Basics", videoId: "0WLcsPz5O0E", duration: "27:25" }
        ]
      })
    ]
  },
  {
    category: "Mobile & Platforms",
    links: [
      course({
        title: "React Native Specialization",
        url: "https://www.coursera.org/specializations/meta-react-native",
        desc: "Mobile development path for React Native, navigation, native APIs, debugging, and app delivery.",
        platform: "Coursera",
        domain: "Mobile Development",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["mobile", "react native", "ios", "android"]
      }),
      course({
        title: "Android Basics with Compose",
        url: "https://developer.android.com/courses/android-basics-compose/course",
        desc: "Official Android learning path covering Kotlin, Compose UI, navigation, state, and app fundamentals.",
        platform: "Google Developers",
        domain: "Android Development",
        difficulty: "Beginner to Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["android", "kotlin", "compose"]
      }),
      course({
        title: "Developing Apps for iOS with SwiftUI",
        url: "https://www.coursera.org/learn/developing-apps-for-ios-using-swiftui",
        desc: "Practical iOS course covering SwiftUI, app structure, interface building, and native mobile workflows.",
        platform: "Coursera",
        domain: "iOS Development",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["ios", "swiftui", "mobile"]
      }),
      course({
        title: "Flutter Codelabs and Workshops",
        url: "https://docs.flutter.dev/codelabs",
        desc: "Official Flutter learning hub for widget basics, app state, platform integration, and developer workflows.",
        platform: "Google Developers",
        domain: "Flutter",
        difficulty: "Beginner to Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["flutter", "dart", "mobile"]
      }),
      course({
        title: "Unity Essentials Pathway",
        url: "https://learn.unity.com/pathway/unity-essentials",
        desc: "Beginner-friendly game development pathway for Unity editor workflows, scenes, interaction, and play loops.",
        platform: "Google Developers",
        domain: "Game Development",
        difficulty: "Beginner",
        resourceType: "Free Course With Certificate",
        tags: ["game development", "unity", "interactive"]
      }),
      playlistSeries({
        title: "Mobile Development Playlist",
        desc: "Curated mobile playlist covering React Native workflows, app APIs, navigation, and architecture basics.",
        domain: "Mobile Development",
        difficulty: "Intermediate",
        duration: "4h 55m",
        tags: ["mobile", "react native", "navigation"],
        playlist: [
          { title: "React Native Crash Course", videoId: "0-S5a0eXPoc", duration: "55:00" },
          { title: "React Navigation Tutorial", videoId: "npe3Wf4t0SQ", duration: "42:30" },
          { title: "API Integration in Mobile Apps", videoId: "obH0Po_RdWk", duration: "38:15" }
        ]
      }),
      playlistSeries({
        title: "Flutter Playlist",
        desc: "Flutter and Dart learning sequence for UI, state, and cross-platform app development.",
        domain: "Flutter",
        difficulty: "Intermediate",
        duration: "5h 20m",
        tags: ["flutter", "dart", "mobile"],
        playlist: [
          { title: "Flutter Full Course", videoId: "VPvVD8t02U8", duration: "65:00" },
          { title: "Dart Programming Language", videoId: "ej8S_gT2x1w", duration: "45:00" },
          { title: "State Management with Riverpod", videoId: "ZpP98vYOnXY", duration: "35:10" }
        ]
      }),
      playlistSeries({
        title: "Android Development Playlist",
        desc: "Android-focused learning path covering Kotlin, architecture components, Compose, and app lifecycles.",
        domain: "Android Development",
        difficulty: "Intermediate",
        duration: "5h 00m",
        tags: ["android", "kotlin", "compose"],
        playlist: [
          { title: "Kotlin for Beginners", videoId: "F9UC9DY-vIU", duration: "1:14:59" },
          { title: "Android App Architecture", videoId: "4L2m0T5Dr8c", duration: "29:42" },
          { title: "Jetpack Compose Basics", videoId: "mymWGMy9pYI", duration: "41:16" }
        ]
      }),
      playlistSeries({
        title: "Game Development Playlist",
        desc: "Practical game dev sequence focused on Unity fundamentals, gameplay loops, and systems thinking.",
        domain: "Game Development",
        difficulty: "Beginner to Intermediate",
        duration: "4h 15m",
        tags: ["game development", "unity", "c#"],
        playlist: [
          { title: "Unity Beginner Course", videoId: "gB1F9G0JXOo", duration: "1:21:11" },
          { title: "Game Programming Basics", videoId: "XtQMytORBmM", duration: "44:30" },
          { title: "2D Platformer Tutorial", videoId: "on9nwbZNg8Y", duration: "58:12" }
        ]
      })
    ]
  },
  {
    category: "Design, Product & QA",
    links: [
      course({
        title: "Google UX Design Professional Certificate",
        url: "https://www.coursera.org/professional-certificates/google-ux-design",
        desc: "Highly regarded UX program covering research, wireframes, prototypes, usability testing, and portfolios.",
        platform: "Coursera",
        domain: "UX Design",
        difficulty: "Beginner",
        resourceType: "Paid Course",
        tags: ["ux", "research", "design", "figma"]
      }),
      course({
        title: "UI Design Foundations",
        url: "https://learn.microsoft.com/en-us/training/paths/create-ui-windows-applications/",
        desc: "Structured interface design path focused on layout systems, UI composition, interaction, and accessibility.",
        platform: "Microsoft Learn",
        domain: "UI Design",
        difficulty: "Beginner to Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["ui", "design", "accessibility"]
      }),
      course({
        title: "Digital Product Management",
        url: "https://www.coursera.org/specializations/digital-product-management",
        desc: "Strong product management specialization covering product strategy, delivery, experimentation, and decision-making.",
        platform: "Coursera",
        domain: "Product Management",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["product management", "strategy", "delivery"]
      }),
      course({
        title: "Quality Assurance Certification",
        url: "https://www.freecodecamp.org/learn/quality-assurance/",
        desc: "Testing-focused certification with Node, Chai, Mocha, QA principles, and automated verification projects.",
        platform: "FreeCodeCamp",
        domain: "Software Testing",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["testing", "quality assurance", "node.js"]
      }),
      course({
        title: "Selenium WebDriver with Java",
        url: "https://www.udemy.com/course/selenium-real-time-examplesinterview-questions/",
        desc: "Practical automation testing course for Selenium, Java, frameworks, assertions, and browser automation.",
        platform: "Udemy",
        domain: "Automation Testing",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["automation testing", "selenium", "java"]
      }),
      playlistSeries({
        title: "UI and UX Design Playlist",
        desc: "Curated design playlist focused on design systems, UX thinking, research basics, and practical interface work.",
        domain: "UI Design",
        difficulty: "Beginner to Intermediate",
        duration: "4h 10m",
        tags: ["ui design", "ux design", "figma"],
        playlist: [
          { title: "UI Design Crash Course", videoId: "c9Wg6Cb_YlU", duration: "44:10" },
          { title: "UX Design Process", videoId: "Ovj4hFxko7c", duration: "36:22" },
          { title: "Design Systems Explained", videoId: "wc5krC28ynQ", duration: "27:45" }
        ]
      }),
      playlistSeries({
        title: "Software Testing Playlist",
        desc: "Testing workflow playlist covering unit tests, integration strategy, end-to-end thinking, and QA mindset.",
        domain: "Software Testing",
        difficulty: "Intermediate",
        duration: "4h 30m",
        tags: ["testing", "qa", "automation"],
        playlist: [
          { title: "Software Testing Full Course", videoId: "Geq60OVyBPg", duration: "1:06:14" },
          { title: "Playwright Crash Course", videoId: "mqqft2x_Aa4", duration: "49:43" },
          { title: "API Testing with Postman", videoId: "VywxIQ2ZXw4", duration: "39:25" }
        ]
      }),
      playlistSeries({
        title: "Product Management Playlist",
        desc: "Product-focused playlist for roadmap thinking, prioritization, discovery, and shipping useful software.",
        domain: "Product Management",
        difficulty: "Intermediate",
        duration: "3h 55m",
        tags: ["product", "roadmaps", "prioritization"],
        playlist: [
          { title: "Product Management Fundamentals", videoId: "kB0k2lR2N5I", duration: "41:52" },
          { title: "How to Prioritize Features", videoId: "Qj7xk4GqJ8w", duration: "22:18" },
          { title: "Product Discovery Workflow", videoId: "5rV0s7J6g0I", duration: "31:10" }
        ]
      })
    ]
  },
  {
    category: "Architecture & Web3",
    links: [
      course({
        title: "Blockchain Specialization",
        url: "https://www.coursera.org/specializations/blockchain",
        desc: "University-backed blockchain program covering ledgers, smart contracts, consensus, and decentralized systems.",
        platform: "Coursera",
        domain: "Blockchain",
        difficulty: "Intermediate",
        resourceType: "Paid Course",
        tags: ["blockchain", "smart contracts", "distributed systems"]
      }),
      course({
        title: "Introduction to Web3",
        url: "https://www.edx.org/learn/blockchain/the-linux-foundation-introduction-to-web3",
        desc: "Foundational Web3 course exploring decentralized apps, identities, contracts, and ecosystem architecture.",
        platform: "edX",
        domain: "Web3",
        difficulty: "Beginner to Intermediate",
        resourceType: "Paid Course",
        tags: ["web3", "blockchain", "dapps"]
      }),
      playlistSeries({
        title: "Blockchain Playlist",
        desc: "Curated blockchain learning sequence covering smart contracts, wallets, tokens, and on-chain systems.",
        domain: "Blockchain",
        difficulty: "Intermediate",
        duration: "4h 45m",
        tags: ["blockchain", "solidity", "ethereum"],
        playlist: [
          { title: "Blockchain Full Course", videoId: "gyMwXuJrbJQ", duration: "1:02:15" },
          { title: "Solidity Smart Contracts", videoId: "M576WGiDBdQ", duration: "43:17" },
          { title: "Web3 Wallet Integration", videoId: "0MKHYQqYV1E", duration: "35:26" }
        ]
      }),
      playlistSeries({
        title: "Web3 Playlist",
        desc: "Practical Web3 path focused on wallets, ethers.js, contract interaction, and dApp UX foundations.",
        domain: "Web3",
        difficulty: "Intermediate",
        duration: "4h 20m",
        tags: ["web3", "ethers.js", "wallets"],
        playlist: [
          { title: "Web3 Full Course", videoId: "nHhAEkG1y2U", duration: "58:44" },
          { title: "Build a dApp with React and Ethers", videoId: "a0osIaAOFSE", duration: "46:12" },
          { title: "Understanding Wallet Connect", videoId: "XmVDd2p4rfQ", duration: "24:06" }
        ]
      })
    ]
  },
  {
    category: "India Creator Tracks",
    links: [
      course({
        title: "CodeHelp DSA Supreme (Live / Cohort)",
        url: "https://www.codehelp.in/",
        desc: "Structured paid DSA + interview preparation track from CodeHelp by Love Babbar and team.",
        platform: "CodeHelp",
        domain: "Data Structures & Algorithms",
        difficulty: "Beginner to Advanced",
        resourceType: "Paid Course",
        tags: ["dsa", "placements", "interview prep", "love babbar"]
      }),
      course({
        title: "Apna College Sigma Web Development (Cohort)",
        url: "https://www.apnacollege.in/",
        desc: "Paid full-stack cohort from Apna College focused on MERN projects, deployment, and interview prep.",
        platform: "Apna College",
        domain: "Full Stack Development",
        difficulty: "Beginner to Advanced",
        resourceType: "Paid Course",
        tags: ["mern", "web dev", "cohort", "apna college"]
      }),
      course({
        title: "Sheryians Job Ready AI Powered Cohort",
        url: "https://www.sheryians.com/courses",
        desc: "Paid job-ready web + DSA + aptitude style program from Sheryians Coding School.",
        platform: "Sheryians Coding School",
        domain: "Full Stack Development",
        difficulty: "Beginner to Advanced",
        resourceType: "Paid Course",
        tags: ["web dev", "dsa", "gen ai", "cohort"]
      }),
      course({
        title: "CodeHelp - DSA Playlist (YouTube)",
        url: "https://www.youtube.com/@CodeHelp/playlists",
        desc: "Free YouTube DSA learning playlists from Love Babbar's CodeHelp channel.",
        platform: "YouTube",
        domain: "Data Structures & Algorithms",
        difficulty: "Beginner to Intermediate",
        resourceType: "YouTube Playlist",
        tags: ["dsa", "cpp", "love babbar", "free"]
      }),
      course({
        title: "Apna College - Java + DSA Playlists",
        url: "https://www.youtube.com/@ApnaCollegeOfficial/playlists",
        desc: "Free domain playlists for Java, DSA, web development, and interview prep by Apna College.",
        platform: "YouTube",
        domain: "Java",
        difficulty: "Beginner to Intermediate",
        resourceType: "YouTube Playlist",
        tags: ["java", "dsa", "placements", "free"]
      }),
      course({
        title: "Sheryians Coding School - Web Dev Playlists",
        url: "https://www.youtube.com/@sheryians/playlists",
        desc: "Free YouTube playlists for frontend, backend, JavaScript projects, and web fundamentals.",
        platform: "YouTube",
        domain: "Frontend Development",
        difficulty: "Beginner to Intermediate",
        resourceType: "YouTube Playlist",
        tags: ["frontend", "javascript", "projects", "free"]
      }),
      course({
        title: "CampusX - Data Science & ML Playlists",
        url: "https://www.youtube.com/@campusx-official/playlists",
        desc: "Free playlists for machine learning, statistics, SQL, and end-to-end data science workflows.",
        platform: "YouTube",
        domain: "Data Science",
        difficulty: "Beginner to Advanced",
        resourceType: "YouTube Playlist",
        tags: ["machine learning", "data science", "campusx", "free"]
      }),
      course({
        title: "CampusX 100 Days of Machine Learning",
        url: "https://learnwith.campusx.in/courses/100-Days-of-Machine-Learning-YouTube-1763210027804-6918732bee601b12112865e6",
        desc: "Structured ML roadmap style series with day-wise lessons and accompanying notes/resources.",
        platform: "CampusX",
        domain: "Machine Learning",
        difficulty: "Intermediate",
        resourceType: "Free Course With Certificate",
        tags: ["ml", "roadmap", "python", "free"]
      }),
      course({
        title: "CodeHelp DBMS + OS Placement Series",
        url: "https://linktr.ee/codehelp",
        desc: "Free placement-oriented theory playlists including DBMS and OS from CodeHelp resources.",
        platform: "CodeHelp",
        domain: "Computer Science Fundamentals",
        difficulty: "Intermediate",
        resourceType: "YouTube Playlist",
        tags: ["dbms", "os", "placements", "cs fundamentals"]
      }),
      playlistSeries({
        title: "India Creator Web Dev Sampler Playlist",
        desc: "High-signal web development sampler with long-form videos popular among Indian creator audiences.",
        domain: "Frontend Development",
        difficulty: "Beginner to Intermediate",
        duration: "6h 45m",
        tags: ["web dev", "javascript", "html", "css"],
        playlist: [
          { title: "HTML & CSS Full Course", videoId: "mU6anWqZJcc", duration: "2:28:22" },
          { title: "JavaScript Full Course for Beginners", videoId: "VlPiVmYuoqw", duration: "3:26:42" },
          { title: "React JS Crash Course", videoId: "w7ejDZ8SWv8", duration: "1:48:39" }
        ]
      }),
      playlistSeries({
        title: "India Creator DSA Sampler Playlist",
        desc: "DSA-focused mix of interview preparation sessions and coding problem-solving walkthroughs.",
        domain: "Data Structures & Algorithms",
        difficulty: "Beginner to Advanced",
        duration: "5h 30m",
        tags: ["dsa", "interviews", "problem solving"],
        playlist: [
          { title: "Data Structures Easy to Advanced Course", videoId: "RBSGKlAvoiM", duration: "8:56:11" },
          { title: "Dynamic Programming for Beginners", videoId: "oBt53YbR9Kk", duration: "57:00" },
          { title: "Binary Search Interview Pattern", videoId: "GU7DpgHINWQ", duration: "34:15" }
        ]
      }),
      playlistSeries({
        title: "India Creator Data Science Sampler Playlist",
        desc: "Machine learning and data science starter playlist with Python, ML fundamentals, and practical thinking.",
        domain: "Data Science",
        difficulty: "Beginner to Intermediate",
        duration: "7h 10m",
        tags: ["python", "machine learning", "analytics"],
        playlist: [
          { title: "Python for Data Science", videoId: "LHBE6Q9XlzI", duration: "2:36:09" },
          { title: "Machine Learning for Everybody", videoId: "i_LwzRVP7bg", duration: "1:55:00" },
          { title: "Data Analysis with Pandas", videoId: "vmEHCJofslg", duration: "1:30:00" }
        ]
      })
    ]
  }
];
