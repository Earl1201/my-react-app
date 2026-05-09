import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";

const C = {
  BLUE_DARK:    "1E3A5F",
  BLUE_MID:     "2563EB",
  BLUE_LIGHT:   "DBEAFE",
  ORANGE:       "F97316",
  ORANGE_LIGHT: "FED7AA",
  WHITE:        "FFFFFF",
  GRAY_DARK:    "1F2937",
  GRAY_MID:     "6B7280",
  GRAY_LIGHT:   "F3F4F6",
  GREEN:        "16A34A",
  GREEN_LIGHT:  "DCFCE7",
  PURPLE:       "7C3AED",
  PURPLE_LIGHT: "EDE9FE",
  TEAL:         "0D9488",
  TEAL_LIGHT:   "CCFBF1",
};

// ── helpers ───────────────────────────────────────────────────────
function addHeader(s, title, subtitle = "") {
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:1.0, fill:{color:C.BLUE_DARK} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:1.0, w:"100%", h:0.06, fill:{color:C.ORANGE} });
  s.addText("NH", { x:0.22, y:0.12, w:0.65, h:0.76, fontSize:24, bold:true, color:C.ORANGE, valign:"middle" });
  s.addText(title, { x:1.05, y:0.12, w:7.5, h:subtitle ? 0.45 : 0.76, fontSize:22, bold:true, color:C.WHITE, valign:"middle" });
  if (subtitle) s.addText(subtitle, { x:1.05, y:0.58, w:7.5, h:0.35, fontSize:12, color:"93C5FD", valign:"middle" });
}

function featureCard(s, x, y, w, h, icon, title, lines, bgColor = C.BLUE_LIGHT, titleColor = C.BLUE_DARK) {
  s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill:{color:bgColor}, line:{color:C.GRAY_MID, w:0.5} });
  s.addText(icon, { x, y:y+0.08, w, h:0.45, align:"center", fontSize:20 });
  s.addText(title, { x:x+0.1, y:y+0.52, w:w-0.2, h:0.38, align:"center", fontSize:12, bold:true, color:titleColor });
  lines.forEach((l, i) => {
    s.addText(`• ${l}`, { x:x+0.12, y:y+0.95+i*0.32, w:w-0.24, h:0.3, fontSize:10, color:C.GRAY_DARK, wrap:true });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 1 – Title
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.BLUE_DARK} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:4.25, w:"100%", h:1.25, fill:{color:"162D4A"} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:4.22, w:"100%", h:0.06, fill:{color:C.ORANGE} });

  // Logo block
  s.addShape(pptx.ShapeType.rect, { x:3.9, y:0.45, w:2.2, h:0.9, fill:{color:C.ORANGE}, line:{color:C.ORANGE, w:1} });
  s.addText("NH", { x:3.9, y:0.45, w:2.2, h:0.9, align:"center", valign:"middle", fontSize:38, bold:true, color:C.WHITE });

  s.addText("NeighborHub", { x:1, y:1.45, w:8, h:0.65, align:"center", fontSize:32, bold:true, color:C.WHITE });
  s.addText("Local Community Marketplace & Service Platform", {
    x:1, y:2.05, w:8, h:0.45, align:"center", fontSize:16, color:"93C5FD", italic:true,
  });

  s.addShape(pptx.ShapeType.rect, { x:2.5, y:2.65, w:5, h:0.07, fill:{color:C.ORANGE} });

  s.addText("Final Presentation & System Defense", {
    x:0.5, y:2.85, w:9, h:0.55, align:"center", fontSize:20, bold:true, color:C.ORANGE,
  });

  s.addText("Task 7  |  IT Elective 2  |  May 16, 2026", {
    x:0.5, y:4.38, w:9, h:0.38, align:"center", fontSize:13, color:"CBD5E1",
  });
  s.addText("Earl Brian Baclohan", {
    x:0.5, y:4.76, w:9, h:0.38, align:"center", fontSize:13, bold:true, color:C.ORANGE,
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 2 – Problem Statement
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Problem Statement", "What gap does NeighborHub address?");

  const problems = [
    { icon:"🏪", title:"No Central Local Marketplace", body:"Residents rely on scattered Facebook groups, text chains, or physical bulletin boards to buy and sell within their community." },
    { icon:"🔍", title:"Hard to Find Local Services", body:"Finding trusted plumbers, tutors, or delivery services nearby requires word-of-mouth or scrolling through unrelated platforms." },
    { icon:"💬", title:"No Direct Communication Channel", body:"Buyers and sellers have no unified in-app messaging — negotiations happen across different apps." },
    { icon:"⭐", title:"No Trust & Review System", body:"Without ratings, there is no way to verify a seller's reliability or the quality of a local service provider." },
  ];

  problems.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.3 : 5.15;
    const y = 1.2 + row * 1.85;
    s.addShape(pptx.ShapeType.rect, { x, y, w:4.55, h:1.65, fill:{color:"FFF7ED"}, line:{color:"FED7AA", w:1} });
    s.addText(p.icon, { x, y:y+0.12, w:0.75, h:0.65, align:"center", fontSize:22 });
    s.addText(p.title, { x:x+0.8, y:y+0.12, w:3.6, h:0.45, fontSize:12, bold:true, color:C.BLUE_DARK });
    s.addText(p.body, { x:x+0.8, y:y+0.58, w:3.6, h:1.0, fontSize:10, color:C.GRAY_DARK, wrap:true });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 3 – Solution
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "The Solution — NeighborHub", "A unified platform built for local communities");

  s.addShape(pptx.ShapeType.rect, { x:0.3, y:1.18, w:9.4, h:0.62, fill:{color:C.BLUE_LIGHT}, line:{color:C.BLUE_MID, w:0.5} });
  s.addText("NeighborHub is a full-stack web application that lets community members buy, sell, and find local services — with built-in messaging, orders, reviews, and an admin dashboard.", {
    x:0.5, y:1.24, w:9.0, h:0.5, fontSize:12, color:C.BLUE_DARK, valign:"middle",
  });

  const solutions = [
    { icon:"🛒", title:"Marketplace",     body:"Post products & services. Browse by category, price, and location." },
    { icon:"💬", title:"Messaging",       body:"In-app conversation threads between buyer and seller per listing." },
    { icon:"📦", title:"Orders",          body:"Place, confirm, track, and complete orders end-to-end." },
    { icon:"⭐", title:"Reviews",         body:"Rate sellers after a completed order to build community trust." },
    { icon:"🔔", title:"Notifications",   body:"Real-time-like alerts for messages, orders, and activity." },
    { icon:"🛡️", title:"Admin Panel",    body:"Monitor users, listings, and platform activity from a dashboard." },
  ];

  solutions.forEach((sol, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 3.2;
    const y = 2.0 + row * 1.6;
    s.addShape(pptx.ShapeType.rect, { x, y, w:3.0, h:1.45, fill:{color:C.GRAY_LIGHT}, line:{color:C.GRAY_MID, w:0.5} });
    s.addText(sol.icon, { x, y:y+0.1, w:3.0, h:0.42, align:"center", fontSize:20 });
    s.addText(sol.title, { x:x+0.1, y:y+0.52, w:2.8, h:0.32, align:"center", fontSize:12, bold:true, color:C.BLUE_DARK });
    s.addText(sol.body, { x:x+0.1, y:y+0.85, w:2.8, h:0.52, align:"center", fontSize:10, color:C.GRAY_DARK, wrap:true });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 4 – System Architecture
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "System Architecture", "3-tier cloud deployment");

  // Tier boxes
  const tiers = [
    { x:0.25, color:C.BLUE_LIGHT, borderColor:C.BLUE_MID, title:"Presentation Tier", sub:"Vercel CDN", items:["React 19 + Vite SPA","Tailwind CSS styling","React Router DOM 7","Axios HTTP client"], url:"neighborhub-theta.vercel.app" },
    { x:3.6,  color:"FEF3C7",     borderColor:"F59E0B",    title:"Application Tier",  sub:"Render (Node.js)", items:["Express.js REST API","JWT Authentication","bcrypt password hash","Multer file uploads"], url:"neighborhub-snsy.onrender.com" },
    { x:6.95, color:C.GREEN_LIGHT,borderColor:C.GREEN,     title:"Data Tier",         sub:"FreeSQLDatabase.com", items:["MySQL 5.5 database","11 normalized tables","mysql2/promise pool","Foreign key constraints"], url:"sql12824333" },
  ];

  tiers.forEach((t) => {
    s.addShape(pptx.ShapeType.rect, { x:t.x, y:1.18, w:3.1, h:3.45, fill:{color:t.color}, line:{color:t.borderColor, w:1.5} });
    s.addText(t.title, { x:t.x+0.1, y:1.28, w:2.9, h:0.38, align:"center", fontSize:13, bold:true, color:C.BLUE_DARK });
    s.addText(t.sub, { x:t.x+0.1, y:1.65, w:2.9, h:0.3, align:"center", fontSize:10, color:C.GRAY_MID, italic:true });
    s.addShape(pptx.ShapeType.rect, { x:t.x+0.1, y:2.0, w:2.9, h:0.04, fill:{color:t.borderColor} });
    t.items.forEach((item, i) => {
      s.addText(`• ${item}`, { x:t.x+0.18, y:2.12+i*0.42, w:2.75, h:0.38, fontSize:10.5, color:C.GRAY_DARK });
    });
    s.addText(t.url, { x:t.x+0.1, y:4.2, w:2.9, h:0.3, align:"center", fontSize:9, color:C.GRAY_MID, italic:true });
  });

  // Connection labels — white bg box centered on each gap
  const connLabels = [
    { cx:3.475, top:"HTTPS/REST API", bot:"← JSON Response" },
    { cx:6.825, top:"SQL Queries →",  bot:"← Result Set"    },
  ];
  connLabels.forEach(({ cx, top, bot }) => {
    const lx = cx - 1.05;
    // white backing
    s.addShape(pptx.ShapeType.rect, { x:lx, y:2.45, w:2.1, h:0.72, fill:{color:C.WHITE}, line:{color:C.GRAY_MID, w:0.5} });
    // up arrow + label
    s.addText(`▶  ${top}`, { x:lx+0.05, y:2.5,  w:2.0, h:0.28, align:"center", fontSize:9.5, color:C.ORANGE, bold:true });
    // down arrow + label
    s.addText(`◀  ${bot}`, { x:lx+0.05, y:2.82, w:2.0, h:0.28, align:"center", fontSize:9.5, color:C.BLUE_MID, bold:true });
  });

  s.addText("Polling: Messages every 5s  |  Notifications every 30s", {
    x:0.3, y:4.68, w:9.4, h:0.28, align:"center", fontSize:10, color:C.GRAY_MID, italic:true,
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 5 – Technology Stack
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Technology Stack");

  const stacks = [
    {
      label:"Frontend", color:C.BLUE_LIGHT, tColor:C.BLUE_DARK,
      items:[
        ["React 19",              "UI component library — SPA with hooks"],
        ["Vite",                  "Build tool & dev server with HMR"],
        ["Tailwind CSS",          "Utility-first CSS with custom brand tokens"],
        ["React Router DOM 7",    "Client-side routing & protected routes"],
        ["Axios",                 "HTTP client with JWT interceptor"],
        ["@react-oauth/google",   "Google OAuth 2.0 Sign-In integration"],
        ["Lucide React",          "Icon library"],
      ],
    },
    {
      label:"Backend", color:"FEF3C7", tColor:"92400E",
      items:[
        ["Express.js",        "REST API framework for Node.js"],
        ["Node.js",           "JavaScript runtime environment"],
        ["JSON Web Token",    "Stateless authentication tokens"],
        ["bcryptjs",          "Password hashing with salt rounds"],
        ["Multer",            "Multipart form-data (image uploads)"],
        ["mysql2/promise",    "MySQL connection pool with async/await"],
        ["dotenv",            "Environment variable management"],
      ],
    },
    {
      label:"Database & DevOps", color:C.GREEN_LIGHT, tColor:"14532D",
      items:[
        ["MySQL 5.5",         "Relational database — 11 tables"],
        ["FreeSQLDatabase",   "Free cloud MySQL hosting"],
        ["Vercel",            "Frontend hosting with global CDN"],
        ["Render",            "Backend hosting (Node.js free tier)"],
        ["GitHub",            "Version control & CI/CD trigger"],
        ["ESLint 9",          "Flat config linting for code quality"],
        ["Vite Build",        "Optimized production bundle"],
      ],
    },
  ];

  stacks.forEach((stack, si) => {
    const x = 0.25 + si * 3.25;
    s.addShape(pptx.ShapeType.rect, { x, y:1.12, w:3.1, h:0.38, fill:{color:stack.tColor === C.BLUE_DARK ? C.BLUE_MID : stack.tColor === "92400E" ? "D97706" : C.GREEN} });
    s.addText(stack.label, { x, y:1.12, w:3.1, h:0.38, align:"center", fontSize:13, bold:true, color:C.WHITE });
    s.addShape(pptx.ShapeType.rect, { x, y:1.5, w:3.1, h:3.45, fill:{color:stack.color}, line:{color:C.GRAY_MID, w:0.5} });
    stack.items.forEach(([tech, desc], i) => {
      s.addText(tech, { x:x+0.12, y:1.58+i*0.47, w:1.1, h:0.38, fontSize:10, bold:true, color:stack.tColor });
      s.addText(desc, { x:x+1.26, y:1.58+i*0.47, w:1.72, h:0.38, fontSize:9.5, color:C.GRAY_DARK, wrap:true });
    });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 6 – Key Features: Auth & Listings
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Key Features — Authentication & Listings");

  // Auth
  s.addShape(pptx.ShapeType.rect, { x:0.25, y:1.15, w:4.6, h:4.0, fill:{color:C.BLUE_LIGHT}, line:{color:C.BLUE_MID, w:1} });
  s.addText("🔐  Authentication & User Management", { x:0.35, y:1.22, w:4.4, h:0.45, fontSize:13, bold:true, color:C.BLUE_DARK });
  const authItems = [
    "Register with name, email, password, city, and barangay",
    "Login returns a signed JWT (expires in 7d) stored in localStorage",
    "Google OAuth — 'Continue with Google' opens a popup via @react-oauth/google",
    "Google access token sent to backend → verified via Google's userinfo API",
    "New Google users auto-registered; existing users logged in by matching email",
    "Passwords hashed with bcryptjs (salt rounds: 10) — never stored in plain text",
    "Role-based access: buyer / seller / both / admin",
    "Auto-logout on 401 response via Axios interceptor",
  ];
  authItems.forEach((item, i) => {
    s.addText(`✔  ${item}`, { x:0.38, y:1.75+i*0.44, w:4.3, h:0.4, fontSize:10.5, color:C.GRAY_DARK });
  });

  // Listings
  s.addShape(pptx.ShapeType.rect, { x:5.15, y:1.15, w:4.6, h:3.7, fill:{color:"FEF3C7"}, line:{color:"F59E0B", w:1} });
  s.addText("🏷️  Listings Management", { x:5.25, y:1.22, w:4.4, h:0.45, fontSize:13, bold:true, color:"92400E" });
  const listingItems = [
    "Create product or service listings with title, description, price",
    "Upload multiple images via Multer (multipart/form-data)",
    "Mark price as fixed, negotiable, free, or per_hour",
    "Set listing condition: new, used, or refurbished",
    "Filter by category (10 categories), price range, listing type",
    "Full-text keyword search across title and description",
    "Edit and delete own listings only — enforced server-side",
    "View count tracked per listing",
  ];
  listingItems.forEach((item, i) => {
    s.addText(`✔  ${item}`, { x:5.28, y:1.75+i*0.44, w:4.3, h:0.4, fontSize:10.5, color:C.GRAY_DARK });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 7 – Key Features: Orders, Messaging, Reviews
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Key Features — Orders, Messaging & Reviews");

  const sections = [
    {
      x:0.25, color:C.GREEN_LIGHT, bColor:C.GREEN, tColor:"14532D",
      icon:"📦", title:"Orders System",
      items:[
        "Buyer clicks 'Place Order' on a listing",
        "Seller receives order notification",
        "Status flow: pending → confirmed → in_progress → completed",
        "Buyer and seller can both cancel if needed",
        "Each order stores quantity, total price, and notes",
      ],
    },
    {
      x:3.55, color:C.PURPLE_LIGHT, bColor:C.PURPLE, tColor:C.PURPLE,
      icon:"💬", title:"Messaging System",
      items:[
        "Conversation created per listing between buyer & seller",
        "Messages polled every 5 seconds for near-real-time feel",
        "Read/unread status tracked per message",
        "Conversation list shows latest message preview",
        "No duplicate conversations per buyer-seller-listing",
      ],
    },
    {
      x:6.85, color:"FEF3C7", bColor:"F59E0B", tColor:"92400E",
      icon:"⭐", title:"Reviews & Notifications",
      items:[
        "Leave a review (1–5 stars + comment) for a seller",
        "One review per buyer-seller-listing combination enforced",
        "Seller's average rating shown on profile",
        "Notifications for orders, messages, and reviews",
        "Bell icon badge shows unread notification count",
      ],
    },
  ];

  sections.forEach((sec) => {
    s.addShape(pptx.ShapeType.rect, { x:sec.x, y:1.15, w:3.1, h:3.75, fill:{color:sec.color}, line:{color:sec.bColor, w:1} });
    s.addText(`${sec.icon}  ${sec.title}`, { x:sec.x+0.1, y:1.22, w:2.9, h:0.45, fontSize:12, bold:true, color:sec.tColor });
    s.addShape(pptx.ShapeType.rect, { x:sec.x+0.1, y:1.7, w:2.9, h:0.04, fill:{color:sec.bColor} });
    sec.items.forEach((item, i) => {
      s.addText(`✔  ${item}`, { x:sec.x+0.15, y:1.82+i*0.56, w:2.8, h:0.52, fontSize:10, color:C.GRAY_DARK, wrap:true });
    });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 8 – Admin Dashboard
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Admin Dashboard", "Platform oversight and management");

  const cards = [
    { icon:"📊", title:"Platform Statistics",  body:"Total users, listings, orders, and messages shown as live stat cards with percentage summaries.", color:"EFF6FF", border:C.BLUE_MID },
    { icon:"👥", title:"User Management",       body:"View all registered users, their roles, join date, and listing count. Admins can update roles.", color:C.GREEN_LIGHT, border:C.GREEN },
    { icon:"🏷️", title:"Listing Moderation",  body:"Browse all listings across all users. Admins can deactivate or delete inappropriate listings.", color:"FEF3C7", border:"F59E0B" },
    { icon:"🛡️", title:"Access Control",      body:"Admin routes are double-protected: JWT middleware + role === 'admin' check on every request.", color:C.PURPLE_LIGHT, border:C.PURPLE },
    { icon:"📋", title:"Order Overview",        body:"View all orders on the platform — filter by status (pending, confirmed, completed, cancelled).", color:C.TEAL_LIGHT, border:C.TEAL },
    { icon:"🔒", title:"Security",              body:"Admin panel is a protected route on frontend and all admin API endpoints require admin role JWT.", color:"FEE2E2", border:"EF4444" },
  ];

  cards.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 3.25;
    const y = 1.18 + row * 1.8;
    s.addShape(pptx.ShapeType.rect, { x, y, w:3.1, h:1.65, fill:{color:c.color}, line:{color:c.border, w:1} });
    s.addText(`${c.icon}  ${c.title}`, { x:x+0.12, y:y+0.1, w:2.86, h:0.4, fontSize:12, bold:true, color:C.BLUE_DARK });
    s.addText(c.body, { x:x+0.12, y:y+0.55, w:2.86, h:1.0, fontSize:10, color:C.GRAY_DARK, wrap:true });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 9 – Database Design
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Database Design", "11 normalized tables — MySQL 5.5");

  const tables = [
    { name:"users",                    desc:"Stores all user accounts, roles, location, and profile data" },
    { name:"categories",               desc:"10 predefined listing categories (Home, Electronics, Vehicles…)" },
    { name:"listings",                 desc:"Core marketplace listings — product or service, price, location, status" },
    { name:"listing_images",           desc:"Multiple images per listing with primary flag and sort order" },
    { name:"orders",                   desc:"Tracks buyer-seller transactions with status lifecycle" },
    { name:"conversations",            desc:"Messaging threads linked to a specific listing" },
    { name:"conversation_participants",desc:"Junction table — maps users to their conversations" },
    { name:"messages",                 desc:"Individual messages with read/unread status" },
    { name:"reviews",                  desc:"Seller ratings (1–5 stars) from buyers after orders" },
    { name:"notifications",            desc:"User alerts for orders, messages, and system events" },
    { name:"saved_listings",           desc:"Bookmarked listings per user (composite primary key)" },
  ];

  const col1 = tables.slice(0, 6);
  const col2 = tables.slice(6);

  col1.forEach((t, i) => {
    const y = 1.18 + i * 0.58;
    s.addShape(pptx.ShapeType.rect, { x:0.25, y, w:2.0, h:0.46, fill:{color:C.BLUE_LIGHT}, line:{color:C.BLUE_MID, w:0.5} });
    s.addText(t.name, { x:0.3, y:y+0.07, w:1.9, h:0.32, fontSize:10, bold:true, color:C.BLUE_DARK, fontFace:"Courier New" });
    s.addText(t.desc, { x:2.38, y:y+0.07, w:2.3, h:0.38, fontSize:9.5, color:C.GRAY_DARK, valign:"middle" });
  });

  col2.forEach((t, i) => {
    const y = 1.18 + i * 0.58;
    s.addShape(pptx.ShapeType.rect, { x:5.05, y, w:2.15, h:0.46, fill:{color:C.GREEN_LIGHT}, line:{color:C.GREEN, w:0.5} });
    s.addText(t.name, { x:5.1, y:y+0.07, w:2.05, h:0.32, fontSize:10, bold:true, color:"14532D", fontFace:"Courier New" });
    s.addText(t.desc, { x:7.28, y:y+0.07, w:2.4, h:0.38, fontSize:9.5, color:C.GRAY_DARK, valign:"middle", wrap:true });
  });

  s.addShape(pptx.ShapeType.rect, { x:0.25, y:4.7, w:9.5, h:0.35, fill:{color:C.BLUE_LIGHT}, line:{color:C.BLUE_MID, w:0.5} });
  s.addText("All tables use FOREIGN KEY constraints with CASCADE/RESTRICT/SET NULL rules for referential integrity.", {
    x:0.4, y:4.74, w:9.2, h:0.27, fontSize:10, color:C.BLUE_DARK,
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 10 – Security Implementation
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Security Implementation");

  const secItems = [
    {
      icon:"🔑", title:"JWT & Google Authentication",
      color:"EFF6FF", bColor:C.BLUE_MID,
      points:[
        "Tokens signed with JWT_SECRET stored in environment variables",
        "Token expiry configurable via JWT_EXPIRES_IN (default: 7 days)",
        "Google OAuth: access token verified via Google's userinfo API — no client secret needed on frontend",
        "401 response auto-logs out the user and clears localStorage",
      ],
    },
    {
      icon:"🔒", title:"Password Security",
      color:C.GREEN_LIGHT, bColor:C.GREEN,
      points:[
        "Passwords hashed with bcryptjs before storing in the database",
        "Salt rounds: 10 — industry standard for web applications",
        "Plain text passwords are never stored or logged anywhere",
        "Password not returned in any API response",
      ],
    },
    {
      icon:"🛡️", title:"API & CORS Security",
      color:"FEF3C7", bColor:"F59E0B",
      points:[
        "CORS restricted to CLIENT_URL environment variable only",
        "All protected endpoints require valid JWT middleware",
        "Admin endpoints additionally check role === 'admin'",
        "All secrets stored in .env — never hardcoded in source code",
      ],
    },
    {
      icon:"✅", title:"Input Validation",
      color:C.PURPLE_LIGHT, bColor:C.PURPLE,
      points:[
        "Server-side validation on all user inputs (register, listings, orders)",
        "SQL injection prevented by parameterized queries via mysql2",
        "File type and size validation on image uploads via Multer",
        "User can only edit/delete their own listings (ownership check)",
      ],
    },
  ];

  secItems.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.25 : 5.15;
    const y = 1.15 + row * 1.85;
    s.addShape(pptx.ShapeType.rect, { x, y, w:4.65, h:1.7, fill:{color:item.color}, line:{color:item.bColor, w:1} });
    s.addText(`${item.icon}  ${item.title}`, { x:x+0.12, y:y+0.1, w:4.4, h:0.42, fontSize:13, bold:true, color:C.BLUE_DARK });
    item.points.forEach((pt, pi) => {
      s.addText(`•  ${pt}`, { x:x+0.15, y:y+0.58+pi*0.27, w:4.35, h:0.25, fontSize:10, color:C.GRAY_DARK });
    });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 11 – Live Demo
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.BLUE_DARK} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:4.2, w:"100%", h:1.3, fill:{color:"162D4A"} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:4.17, w:"100%", h:0.07, fill:{color:C.ORANGE} });

  s.addText("🌐", { x:0, y:0.55, w:"100%", h:0.9, align:"center", fontSize:40 });
  s.addText("Live System Demo", { x:0.5, y:1.45, w:9, h:0.65, align:"center", fontSize:30, bold:true, color:C.WHITE });
  s.addText("The system is publicly accessible and fully functional:", {
    x:0.5, y:2.1, w:9, h:0.4, align:"center", fontSize:14, color:"93C5FD",
  });

  const links = [
    { label:"Frontend", url:"https://neighborhub-theta.vercel.app", color:C.BLUE_LIGHT },
    { label:"Backend API Health", url:"https://neighborhub-snsy.onrender.com/api/health", color:"FEF3C7" },
    { label:"GitHub Repository", url:"https://github.com/Earl1201/my-react-app", color:C.GREEN_LIGHT },
  ];

  links.forEach((l, i) => {
    s.addShape(pptx.ShapeType.rect, { x:1.5, y:2.65+i*0.46, w:7, h:0.38, fill:{color:l.color}, line:{color:C.GRAY_MID, w:0.5} });
    s.addText(l.label, { x:1.65, y:2.68+i*0.46, w:1.8, h:0.32, fontSize:11, bold:true, color:C.BLUE_DARK });
    s.addText(l.url, { x:3.55, y:2.68+i*0.46, w:4.8, h:0.32, fontSize:11, color:C.BLUE_MID });
  });

  s.addText("Note: Render free tier may take ~50 seconds to wake up on first request after inactivity.", {
    x:0.5, y:4.28, w:9, h:0.35, align:"center", fontSize:11, color:"CBD5E1", italic:true,
  });
  s.addText("Login with admin account or register a new user to explore all features.", {
    x:0.5, y:4.6, w:9, h:0.35, align:"center", fontSize:11, color:"CBD5E1", italic:true,
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 12 – Challenges Encountered
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Challenges Encountered", "Problems faced and how they were resolved");

  const challenges = [
    {
      num:"01", title:"Railway Trial Expired",
      problem:"The free MySQL database trial ended mid-development — all data became inaccessible.",
      solution:"Migrated to FreeSQLDatabase.com — a permanently free MySQL 5.5 hosting service.",
    },
    {
      num:"02", title:"MySQL 5.5 Schema Compatibility",
      problem:"MySQL 5.5 only allows ONE TIMESTAMP column with CURRENT_TIMESTAMP per table (Error #1293). Also, CREATE DATABASE is not permitted on shared hosting.",
      solution:"Changed all updated_at columns from TIMESTAMP to DATETIME DEFAULT NULL. Removed CREATE DATABASE and USE statements from schema file.",
    },
    {
      num:"03", title:"SSL Connection Error on Render",
      problem:"Render deployment failed: 'Server does not support secure connection' — FreeSQLDatabase MySQL 5.5 does not support SSL.",
      solution:"Removed the ssl: { rejectUnauthorized: false } config block from db.js. Committed and redeployed.",
    },
    {
      num:"04", title:"CORS Configuration Between Platforms",
      problem:"Frontend (Vercel) and backend (Render) are on different domains — all API requests were blocked by CORS policy.",
      solution:"Set CLIENT_URL environment variable in Render to the Vercel deployment URL. Backend CORS middleware uses this variable as the allowed origin.",
    },
    {
      num:"05", title:"SPA Routing on Vercel",
      problem:"Direct URL access to routes like /listings or /profile returned 404 on Vercel because the server didn't know to serve index.html.",
      solution:"Added vercel.json with a rewrite rule to serve index.html for all routes — React Router handles navigation client-side.",
    },
  ];

  challenges.forEach((c, i) => {
    const y = 1.12 + i * 0.82;
    s.addShape(pptx.ShapeType.rect, { x:0.25, y, w:0.5, h:0.68, fill:{color:C.ORANGE} });
    s.addText(c.num, { x:0.25, y:y+0.07, w:0.5, h:0.52, align:"center", fontSize:13, bold:true, color:C.WHITE });
    s.addShape(pptx.ShapeType.rect, { x:0.82, y, w:8.88, h:0.68, fill:{color:C.GRAY_LIGHT}, line:{color:C.GRAY_MID, w:0.5} });
    s.addText(c.title, { x:0.95, y:y+0.05, w:8.6, h:0.28, fontSize:12, bold:true, color:C.BLUE_DARK });
    s.addText(`Problem: ${c.problem}`, { x:0.95, y:y+0.33, w:4.1, h:0.28, fontSize:9, color:"DC2626", wrap:true });
    s.addText(`Solution: ${c.solution}`, { x:5.15, y:y+0.33, w:4.4, h:0.28, fontSize:9, color:C.GREEN, wrap:true });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 13 – Future Improvements
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Future Improvements", "Planned enhancements beyond the current scope");

  const improvements = [
    { icon:"⚡", title:"Real-Time Messaging",      body:"Replace 5-second polling with WebSockets (Socket.io) for instant message delivery without latency.",                                   priority:"High" },
    { icon:"💳", title:"Payment Integration",      body:"Integrate GCash or PayMaya for secure in-app payment processing — from offer to checkout.",                                          priority:"High" },
    { icon:"📱", title:"Mobile Application",       body:"Develop a React Native companion app for iOS and Android with push notifications via Firebase.",                                      priority:"High" },
    { icon:"🗺️", title:"Map-Based Search",        body:"Use Google Maps API or Leaflet to show listings on a map filtered by radius from the user's location.",                              priority:"Medium" },
    { icon:"📧", title:"Email Verification",       body:"Send a verification email on registration using Nodemailer + an email provider like Resend.",                                        priority:"Medium" },
    { icon:"🤖", title:"AI Listing Suggestions",  body:"Use an AI API (e.g., Claude) to auto-generate listing descriptions and suggest category/price from photos.",                         priority:"Low" },
  ];

  improvements.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 3.25;
    const y = 1.15 + row * 1.9;
    const pColor = item.priority === "High" ? "FEE2E2" : item.priority === "Medium" ? "FEF3C7" : C.GREEN_LIGHT;
    const pText  = item.priority === "High" ? "DC2626" : item.priority === "Medium" ? "92400E" : "14532D";
    s.addShape(pptx.ShapeType.rect, { x, y, w:3.1, h:1.75, fill:{color:C.GRAY_LIGHT}, line:{color:C.GRAY_MID, w:0.5} });
    s.addText(item.icon, { x, y:y+0.08, w:3.1, h:0.42, align:"center", fontSize:22 });
    s.addText(item.title, { x:x+0.1, y:y+0.52, w:2.9, h:0.32, align:"center", fontSize:12, bold:true, color:C.BLUE_DARK });
    s.addText(item.body, { x:x+0.1, y:y+0.87, w:2.9, h:0.65, fontSize:9.5, color:C.GRAY_DARK, wrap:true });
    s.addShape(pptx.ShapeType.rect, { x:x+1.55, y:y+0.1, w:1.42, h:0.26, fill:{color:pColor} });
    s.addText(item.priority, { x:x+1.55, y:y+0.1, w:1.42, h:0.26, align:"center", fontSize:9, bold:true, color:pText });
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 14 – Conclusion
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.BLUE_DARK} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:3.85, w:"100%", h:1.65, fill:{color:"162D4A"} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:3.82, w:"100%", h:0.07, fill:{color:C.ORANGE} });

  s.addText("NH", { x:4.15, y:0.3, w:1.7, h:0.72, align:"center", fontSize:32, bold:true, color:C.ORANGE });
  s.addText("Project Summary", { x:1, y:1.05, w:8, h:0.55, align:"center", fontSize:26, bold:true, color:C.WHITE });

  const points = [
    "✔  Full-stack web app built with React 19 + Express.js + MySQL over 7 development phases",
    "✔  7 core modules: Authentication, Listings, Orders, Messaging, Reviews, Notifications, Admin",
    "✔  Publicly deployed: Vercel (frontend) + Render (backend) + FreeSQLDatabase (database)",
    "✔  All Task 7 deliverables met: live demo, slides, architecture, challenges, future plans",
  ];

  points.forEach((pt, i) => {
    s.addText(pt, { x:0.8, y:1.7+i*0.45, w:8.4, h:0.4, fontSize:13, color:C.WHITE });
  });

  s.addText("Live at: https://neighborhub-theta.vercel.app", {
    x:1, y:3.5, w:8, h:0.3, align:"center", fontSize:12, color:"93C5FD", italic:true,
  });

  s.addText("Thank you for listening!", {
    x:0.5, y:3.98, w:9, h:0.52, align:"center", fontSize:22, bold:true, color:C.ORANGE,
  });
  s.addText("IT Elective 2  |  Earl Brian Baclohan  |  May 16, 2026", {
    x:0.5, y:4.5, w:9, h:0.35, align:"center", fontSize:12, color:"CBD5E1",
  });
}

// ══════════════════════════════════════════════════════════════════
// SLIDE 15 – Q&A
// ══════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.BLUE_DARK} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:0.08, fill:{color:C.ORANGE} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:5.42, w:"100%", h:0.08, fill:{color:C.ORANGE} });

  s.addText("❓", { x:0, y:0.8, w:"100%", h:1.0, align:"center", fontSize:52 });
  s.addText("Questions & Answers", {
    x:0.5, y:1.85, w:9, h:0.75, align:"center", fontSize:34, bold:true, color:C.WHITE,
  });
  s.addText("Open for questions from Dr. Tanquis and the panel.", {
    x:1, y:2.65, w:8, h:0.45, align:"center", fontSize:16, color:"93C5FD", italic:true,
  });

  s.addShape(pptx.ShapeType.rect, { x:2, y:3.25, w:6, h:0.06, fill:{color:C.ORANGE} });

  const refs = [
    "Frontend:   https://neighborhub-theta.vercel.app",
    "Backend:    https://neighborhub-snsy.onrender.com",
    "GitHub:     https://github.com/Earl1201/my-react-app",
  ];
  refs.forEach((r, i) => {
    s.addText(r, { x:1.5, y:3.5+i*0.38, w:7, h:0.33, align:"center", fontSize:12, color:"CBD5E1" });
  });
}

// ── Save ──────────────────────────────────────────────────────────
await pptx.writeFile({ fileName: "NeighborHub-Task7-Defense.pptx" });
console.log("Done! File saved: NeighborHub-Task7-Defense.pptx");
