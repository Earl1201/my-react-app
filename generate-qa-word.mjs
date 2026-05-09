import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType,
} from "docx";
import fs from "fs";

// ── colors ───────────────────────────────────────────────────────
const BLUE_DARK  = "1E3A5F";
const BLUE_MID   = "2563EB";
const ORANGE     = "F97316";
const GRAY       = "6B7280";
const GRAY_LIGHT = "F3F4F6";
const WHITE      = "FFFFFF";
const GREEN      = "16A34A";

// ── helpers ───────────────────────────────────────────────────────
function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 32, color: WHITE, font: "Calibri" })],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.SOLID, color: BLUE_DARK, fill: BLUE_DARK },
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE } },
  });
}

function sectionHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text: `  ${text}  `, bold: true, size: 26, color: WHITE, font: "Calibri" })],
    shading: { type: ShadingType.SOLID, color: BLUE_MID, fill: BLUE_MID },
    spacing: { before: 320, after: 120 },
    border: { left: { style: BorderStyle.SINGLE, size: 16, color: ORANGE } },
  });
}

function questionPara(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: "Q: ", bold: true, size: 22, color: ORANGE, font: "Calibri" }),
      new TextRun({ text, bold: true, size: 22, color: BLUE_DARK, font: "Calibri" }),
    ],
    shading: { type: ShadingType.SOLID, color: "EFF6FF", fill: "EFF6FF" },
    spacing: { before: 180, after: 60 },
    indent: { left: 200 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE } },
  });
}

function answerPara(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: "A: ", bold: true, size: 21, color: GREEN, font: "Calibri" }),
      new TextRun({ text, size: 21, color: "1F2937", font: "Calibri" }),
    ],
    spacing: { before: 60, after: 160 },
    indent: { left: 400 },
  });
}

function spacer() {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 60, after: 60 } });
}

function divider() {
  return new Paragraph({
    children: [new TextRun("")],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DBEAFE" } },
    spacing: { before: 100, after: 100 },
  });
}

// ── Q&A data ───────────────────────────────────────────────────────
const sections = [
  {
    title: "SECTION 1: General / Project Overview",
    qas: [
      {
        q: "What is NeighborHub and what problem does it solve?",
        a: "NeighborHub is a full-stack web application that serves as a local community marketplace. It solves the problem of having no centralized platform where community members can buy and sell items, find local services, communicate directly, and build trust through reviews — all in one place. Currently, people rely on scattered Facebook groups or word-of-mouth, which is inefficient.",
      },
      {
        q: "Why did you choose this project?",
        a: "Local commerce is underserved digitally — most platforms like Lazada or Shopee are national, not community-focused. NeighborHub addresses a real, everyday need: connecting neighbors for transactions like selling used items, hiring a local plumber, or finding a tutor nearby.",
      },
      {
        q: "What are the main features of NeighborHub?",
        a: "The system has seven core modules: (1) Authentication with JWT and bcrypt, (2) Listings with image upload and filtering, (3) Orders with a status lifecycle, (4) Messaging between buyers and sellers, (5) Reviews and ratings, (6) Notifications, and (7) an Admin Dashboard for platform management.",
      },
      {
        q: "How long did it take to build this system?",
        a: "The system was built across 7 phases over approximately 4 months, from initial planning and database design through to final deployment and this presentation.",
      },
    ],
  },
  {
    title: "SECTION 2: Technical — Frontend",
    qas: [
      {
        q: "Why did you use React?",
        a: "React is the industry standard for building interactive UIs. It allows component-based architecture, which keeps the code modular and maintainable. React 19's hooks make state management clean without needing Redux. It also has a massive ecosystem and community support.",
      },
      {
        q: "What is Vite and why use it instead of Create React App?",
        a: "Vite is a modern build tool that offers near-instant hot module replacement during development and produces optimized production bundles. It is significantly faster than Create React App, especially for larger projects. It also has native support for environment variables, which we use for the VITE_API_URL.",
      },
      {
        q: "What is Tailwind CSS?",
        a: "Tailwind CSS is a utility-first CSS framework. Instead of writing custom CSS files, you apply small utility classes directly in JSX — like text-blue-600 or flex items-center. It speeds up styling and keeps the design consistent. We also added custom brand color tokens for NeighborHub's blue and orange palette.",
      },
      {
        q: "How does routing work in your React app?",
        a: "We use React Router DOM version 7. Public routes like the home page and listing detail are accessible to everyone. Protected routes like creating listings, orders, and the admin panel are wrapped in a ProtectedRoute component that checks if the user has a valid JWT in localStorage before rendering the page.",
      },
      {
        q: "Where is the user's login stored?",
        a: "After a successful login, the JWT token and user object are stored in localStorage under the keys nh_token and nh_user. The AuthContext reads these on app load to restore the session. The token is attached to every API request via an Axios interceptor.",
      },
      {
        q: "What happens when a user's token expires?",
        a: "The Axios response interceptor detects a 401 Unauthorized response from the backend. When it receives one, it automatically clears nh_token and nh_user from localStorage and redirects the user to the login page.",
      },
      {
        q: "How does the 'Continue with Google' button work?",
        a: "We use the @react-oauth/google library which provides a useGoogleLogin hook. When the user clicks the button, it opens a Google OAuth 2.0 consent popup. After the user approves, Google returns an access token. We send this access token to our backend POST /api/auth/google endpoint, which verifies it and returns a NeighborHub JWT. The whole flow is handled without exposing a client secret on the frontend.",
      },
      {
        q: "Why did you use @react-oauth/google instead of building the OAuth flow yourself?",
        a: "The @react-oauth/google library abstracts the OAuth 2.0 popup flow, state management, and token exchange. Building it from scratch would require managing redirect URIs, authorization codes, and PKCE manually. The library provides a simple useGoogleLogin hook and handles all of that internally — it reduced the integration to about 20 lines of code.",
      },
    ],
  },
  {
    title: "SECTION 3: Technical — Backend",
    qas: [
      {
        q: "Why did you choose Express.js for the backend?",
        a: "Express.js is lightweight, minimal, and well-suited for building REST APIs. It gives full control over routing, middleware, and request handling without the overhead of a larger framework. It pairs naturally with Node.js and has excellent library support for JWT, bcrypt, Multer, and MySQL.",
      },
      {
        q: "How does JWT authentication work?",
        a: "When a user logs in with valid credentials, the server creates a JSON Web Token signed with a secret key (JWT_SECRET). This token contains the user's ID and role. The client stores it and sends it in the Authorization header of every subsequent request. The server's JWT middleware verifies the signature and decodes the payload — no database lookup needed for authentication.",
      },
      {
        q: "What is bcrypt and why do you use it?",
        a: "bcrypt is a password hashing algorithm. When a user registers, their plain-text password is run through bcrypt with 10 salt rounds, producing an irreversible hash that is stored in the database. On login, bcrypt compares the entered password against the stored hash. Even if the database is compromised, the original passwords cannot be recovered.",
      },
      {
        q: "How does image upload work?",
        a: "We use the Multer library on the Express backend to handle multipart/form-data requests. When a user submits a listing with images, Multer intercepts the file data, validates the file type and size, and saves the file to the server's disk. The file path is then stored in the listing_images table.",
      },
      {
        q: "How does CORS work in your system?",
        a: "Cross-Origin Resource Sharing (CORS) is a security mechanism that controls which origins can call your API. Our Express backend uses the cors middleware configured with the CLIENT_URL environment variable — which is set to the Vercel frontend URL. This ensures only our frontend can make API calls; requests from other origins are blocked.",
      },
      {
        q: "What is the difference between authentication and authorization in your system?",
        a: "Authentication verifies who the user is — this is done by the JWT middleware that checks the token on every protected request. Authorization verifies what the user is allowed to do — for example, an admin middleware checks that the token's role equals 'admin' before allowing access to admin routes. A regular user can be authenticated but not authorized to access admin endpoints.",
      },
      {
        q: "How does the backend verify a Google sign-in?",
        a: "The frontend sends the Google access token to POST /api/auth/google. The backend calls Google's userinfo endpoint (https://www.googleapis.com/oauth2/v3/userinfo) with that token in the Authorization header. Google returns the user's email, name, and profile picture if the token is valid. We then check if that email already exists in our database — if yes, we log them in; if no, we auto-register a new account. Either way, we return a NeighborHub JWT.",
      },
      {
        q: "What happens if someone tries to send a fake or expired Google token?",
        a: "Google's userinfo API will return a non-OK HTTP response for any invalid or expired token. Our backend checks if the response is OK — if not, it immediately returns a 401 Unauthorized error. This means forging or replaying a Google token cannot be used to gain access to our system.",
      },
    ],
  },
  {
    title: "SECTION 4: Technical — Database",
    qas: [
      {
        q: "What database did you use and why MySQL?",
        a: "We use MySQL, a relational database management system. MySQL is ideal for this project because our data has clear relationships — a listing belongs to a user, an order connects a buyer, seller, and listing, a review links a reviewer to a seller. Relational databases handle these relationships efficiently using foreign keys and JOIN queries.",
      },
      {
        q: "How many tables does your database have?",
        a: "The database has 11 tables: users, categories, listings, listing_images, orders, conversations, conversation_participants, messages, reviews, notifications, and saved_listings. Each table is normalized to reduce data redundancy.",
      },
      {
        q: "What is database normalization?",
        a: "Normalization is the process of organizing database tables to reduce data duplication and improve integrity. For example, instead of storing a category name in every listing row, we store only a category_id and reference the categories table. This means if a category name changes, we only update it in one place.",
      },
      {
        q: "Why do you use FreeSQLDatabase instead of a paid service?",
        a: "The original plan used Railway, but the free trial expired. FreeSQLDatabase.com provides a permanently free MySQL hosting service with no credit card required — suitable for a student project demonstration. For a production system, a managed service like PlanetScale or AWS RDS would be more appropriate.",
      },
      {
        q: "What challenges did MySQL 5.5 cause?",
        a: "MySQL 5.5 has two major restrictions we encountered: First, only one TIMESTAMP column with CURRENT_TIMESTAMP can exist per table — we resolved this by changing updated_at columns to DATETIME. Second, the shared hosting does not support SSL connections — we resolved this by removing the SSL config from the database connection pool.",
      },
    ],
  },
  {
    title: "SECTION 5: Technical — Deployment",
    qas: [
      {
        q: "Where is your system deployed?",
        a: "The frontend React SPA is deployed on Vercel at https://neighborhub-theta.vercel.app. The Express backend is deployed on Render at https://neighborhub-snsy.onrender.com. The MySQL database is hosted on FreeSQLDatabase.com.",
      },
      {
        q: "Why did you separate the frontend and backend deployments?",
        a: "Vercel is optimized for static frontends and SPAs with global CDN delivery. Render is optimized for running server-side Node.js processes. Using each platform for what it does best gives better performance and simpler deployment pipelines than trying to host both on one server.",
      },
      {
        q: "What is a CDN and how does Vercel use it?",
        a: "A Content Delivery Network (CDN) is a network of servers distributed globally. When Vercel deploys the frontend, it stores the static files (HTML, JS, CSS) on edge servers around the world. When a user loads the site, they receive files from the nearest server — this reduces load time regardless of where the user is located.",
      },
      {
        q: "Why does the site sometimes take 50 seconds to load?",
        a: "Render's free tier spins down backend instances after 15 minutes of inactivity to save resources. The first request after inactivity wakes up the server, which can take 50+ seconds. Subsequent requests are fast. This is a known limitation of the free tier — a paid plan keeps the server always running.",
      },
      {
        q: "What is the purpose of vercel.json?",
        a: "Without it, navigating directly to a URL like /listings would return a 404, because Vercel would look for a file named 'listings' that doesn't exist. The vercel.json rewrite rule tells Vercel to always serve index.html for any path — then React Router handles the client-side routing.",
      },
    ],
  },
  {
    title: "SECTION 6: System Design",
    qas: [
      {
        q: "How does the messaging system work technically?",
        a: "When a buyer sends a message, the frontend calls POST /api/messages with the conversation ID and message content. The backend inserts the message into the messages table. On the recipient's side, the frontend polls GET /api/messages/:conversationId every 5 seconds using setInterval. When new messages are detected, they appear on screen.",
      },
      {
        q: "Why polling instead of WebSockets?",
        a: "WebSockets were out of scope for this project phase, but polling was a practical alternative that achieves a near-real-time effect. Polling every 5 seconds is acceptable for a community marketplace where messages don't need millisecond delivery. WebSocket implementation using Socket.io is listed as a high-priority future improvement.",
      },
      {
        q: "How do you prevent a user from editing another user's listing?",
        a: "The backend listing edit endpoint first verifies the JWT to get the requesting user's ID, then queries the database to check if listing.user_id matches the authenticated user's ID. If they don't match, the server returns a 403 Forbidden response — even if someone manipulates the frontend to show the edit form.",
      },
      {
        q: "How does the order status lifecycle work?",
        a: "An order starts as 'pending' when a buyer places it. The seller can move it to 'confirmed', then 'in_progress', then 'completed'. Either party can cancel the order while it is pending or confirmed. This lifecycle is enforced on both the frontend (showing appropriate action buttons) and on the backend (validating allowed status transitions).",
      },
      {
        q: "How does the admin dashboard know who is an admin?",
        a: "During registration, users are assigned the role 'both' by default. To make a user an admin, their role in the database is manually updated to 'admin'. When that user logs in, the JWT is generated with role: 'admin' in the payload. All admin API routes check for this role via middleware before processing the request.",
      },
    ],
  },
  {
    title: "SECTION 7: Challenges & Lessons Learned",
    qas: [
      {
        q: "What was the biggest challenge you faced?",
        a: "The most impactful challenge was the Railway database trial expiring mid-project. It forced an urgent migration to FreeSQLDatabase.com, which introduced two new technical issues: MySQL 5.5 schema compatibility and SSL connection errors on Render. Each required research, debugging log analysis, and targeted code fixes. It was a strong lesson in anticipating infrastructure risks.",
      },
      {
        q: "What would you do differently if you built this again?",
        a: "I would choose a more stable free database from the start — either Supabase or PlanetScale. I would also implement WebSockets from phase 3 rather than retrofitting polling, and add proper end-to-end testing from the beginning.",
      },
      {
        q: "What did you learn from this project?",
        a: "I learned how to build and deploy a complete full-stack application from scratch — from database schema design to REST API development to SPA routing to cloud deployment across multiple platforms. I also learned how to diagnose real production errors from server logs, which is a critical skill for a developer.",
      },
    ],
  },
];

// ── Quick-fire table ──────────────────────────────────────────────
const quickFire = [
  ["REST API",          "A standard for building web APIs using HTTP methods: GET, POST, PUT, DELETE"],
  ["JWT",               "A compact, signed token used to prove a user's identity without server-side sessions"],
  ["bcrypt",            "A password hashing algorithm that makes stored passwords uncrackable even if stolen"],
  ["CORS",              "A browser security policy that controls which websites can call your API"],
  ["SPA",               "A web app that loads once and updates dynamically — no full page reloads"],
  ["CDN",               "A global network of servers that delivers content from the nearest location"],
  ["Polling",           "Repeatedly asking the server for new data on a timer"],
  ["Middleware",        "A function that runs between receiving a request and sending a response"],
  ["Foreign Key",       "A database constraint linking a column in one table to the primary key of another"],
  ["Normalization",     "Organizing database tables to eliminate data duplication"],
  ["Environment Variable","A configuration value stored outside the code (in .env) for security"],
  ["Multer",            "A Node.js library for handling file uploads in Express"],
  ["Google OAuth",      "An authentication method that lets users sign in with their Google account using a secure access token instead of a password"],
];

// ── Build document ────────────────────────────────────────────────
const children = [];

// Cover header
children.push(
  new Paragraph({
    children: [
      new TextRun({ text: "NeighborHub", bold: true, size: 52, color: WHITE, font: "Calibri" }),
    ],
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.SOLID, color: BLUE_DARK, fill: BLUE_DARK },
    spacing: { before: 0, after: 0 },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Q&A Preparation Sheet", bold: true, size: 36, color: ORANGE, font: "Calibri" }),
    ],
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.SOLID, color: BLUE_DARK, fill: BLUE_DARK },
    spacing: { before: 0, after: 0 },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Final Presentation & System Defense  |  IT Elective 2  |  May 16, 2026", size: 22, color: "93C5FD", font: "Calibri", italics: true }),
    ],
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.SOLID, color: BLUE_DARK, fill: BLUE_DARK },
    spacing: { before: 0, after: 0 },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Earl Brian Baclohan", bold: true, size: 22, color: WHITE, font: "Calibri" }),
    ],
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.SOLID, color: BLUE_DARK, fill: BLUE_DARK },
    spacing: { before: 0, after: 300 },
  }),
);

// Sections
sections.forEach((section) => {
  children.push(sectionHeading(section.title));
  section.qas.forEach((qa) => {
    children.push(questionPara(qa.q));
    children.push(answerPara(qa.a));
    children.push(divider());
  });
});

// Quick-fire table
children.push(spacer());
children.push(
  new Paragraph({
    children: [new TextRun({ text: "  SECTION 8: Quick-Fire Technical Definitions  ", bold: true, size: 26, color: WHITE, font: "Calibri" })],
    shading: { type: ShadingType.SOLID, color: BLUE_MID, fill: BLUE_MID },
    spacing: { before: 320, after: 180 },
    border: { left: { style: BorderStyle.SINGLE, size: 16, color: ORANGE } },
  })
);

const tableRows = [
  // Header row
  new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Term", bold: true, size: 22, color: WHITE, font: "Calibri" })] })],
        shading: { type: ShadingType.SOLID, color: BLUE_DARK, fill: BLUE_DARK },
        width: { size: 2200, type: WidthType.DXA },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Definition", bold: true, size: 22, color: WHITE, font: "Calibri" })] })],
        shading: { type: ShadingType.SOLID, color: BLUE_DARK, fill: BLUE_DARK },
        width: { size: 7000, type: WidthType.DXA },
      }),
    ],
  }),
  // Data rows
  ...quickFire.map(([term, def], i) =>
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: term, bold: true, size: 21, color: BLUE_DARK, font: "Calibri" })] })],
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? "EFF6FF" : WHITE, fill: i % 2 === 0 ? "EFF6FF" : WHITE },
          width: { size: 2200, type: WidthType.DXA },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: def, size: 21, color: "1F2937", font: "Calibri" })] })],
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? "EFF6FF" : WHITE, fill: i % 2 === 0 ? "EFF6FF" : WHITE },
          width: { size: 7000, type: WidthType.DXA },
        }),
      ],
    })
  ),
];

children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

children.push(spacer());
children.push(
  new Paragraph({
    children: [new TextRun({ text: "Good luck on your defense, Earl Brian!", bold: true, size: 24, color: ORANGE, font: "Calibri", italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 200 },
  })
);

// ── Create & save ─────────────────────────────────────────────────
const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: { top: 720, right: 900, bottom: 720, left: 900 },
      },
    },
    children,
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("NeighborHub-QA-Prep.docx", buffer);
console.log("Done! File saved: NeighborHub-QA-Prep.docx");
