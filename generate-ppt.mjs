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
  BLACK:        "000000",
};

// ── helpers ──────────────────────────────────────────────────────
function addHeader(s, title) {
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:0.9, fill:{color:C.BLUE_DARK} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:0.9, w:"100%", h:0.05, fill:{color:C.ORANGE} });
  s.addText("NH", { x:0.25, y:0.1, w:0.6, h:0.7, fontSize:22, bold:true, color:C.ORANGE });
  s.addText(title, { x:1.0, y:0.1, w:8.5, h:0.7, fontSize:22, bold:true, color:C.WHITE, valign:"middle" });
}

function bullet(text, indent = 0) {
  return { text, options:{ bullet:{ indent: indent * 15 }, fontSize:15, color:C.GRAY_DARK, breakLine:true } };
}

function greenCheck(text) {
  return { text:`✔  ${text}`, options:{ fontSize:14, color:C.GREEN, breakLine:true } };
}

// ── SLIDE 1: Title ────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.BLUE_DARK} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:4.1, w:"100%", h:0.07, fill:{color:C.ORANGE} });

  s.addText("NH", {
    x:3.5, y:0.5, w:3, h:0.9, align:"center", fontSize:42, bold:true, color:C.ORANGE,
  });
  s.addText("NeighborHub", {
    x:2, y:1.35, w:6, h:0.55, align:"center", fontSize:26, bold:true, color:C.WHITE,
  });
  s.addText("Local Community Marketplace & Service Platform", {
    x:1, y:1.85, w:8, h:0.4, align:"center", fontSize:14, color:"93C5FD", italic:true,
  });
  s.addText("Task 6: System Refinement,\nTesting & Deployment", {
    x:0.5, y:2.4, w:9, h:1.3, align:"center", fontSize:30, bold:true, color:C.WHITE, breakLine:true,
  });
  s.addShape(pptx.ShapeType.rect, { x:3, y:3.85, w:4, h:0.06, fill:{color:C.ORANGE} });
  s.addText("IT Elective 2  |  May 9, 2026  |  Earl Brian Baclohan", {
    x:0.5, y:4.3, w:9, h:0.45, align:"center", fontSize:14, color:"CBD5E1",
  });
}

// ── SLIDE 2: Task 6 Overview ──────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Task 6 Overview");

  const cards = [
    { n:"01", title:"Project Refinement", body:"Code cleanup, README, config files, ESLint" },
    { n:"02", title:"Testing & Bug Fixes", body:"Identified & resolved deployment issues" },
    { n:"03", title:"Version Control", body:"Clean GitHub commits & documentation" },
    { n:"04", title:"Cloud Deployment", body:"Vercel (frontend) + Render (backend) + FreeSQLDatabase" },
  ];

  cards.forEach((c, i) => {
    const x = i < 2 ? 0.3 + (i * 4.8) : 0.3 + ((i-2) * 4.8);
    const y = i < 2 ? 1.2 : 3.0;
    s.addShape(pptx.ShapeType.rect, { x, y, w:4.4, h:1.6, fill:{color:C.BLUE_LIGHT}, line:{color:C.BLUE_MID, w:1} });
    s.addText(c.n, { x:x+0.15, y:y+0.1, w:0.7, h:0.5, fontSize:22, bold:true, color:C.ORANGE });
    s.addText(c.title, { x:x+0.9, y:y+0.1, w:3.35, h:0.5, fontSize:15, bold:true, color:C.BLUE_DARK });
    s.addText(c.body, { x:x+0.15, y:y+0.65, w:4.1, h:0.8, fontSize:12, color:C.GRAY_DARK, wrap:true });
  });
}

// ── SLIDE 3: Deployment Architecture ─────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Deployment Architecture");

  // Arrow flow: User → Vercel → Render → FreeSQLDB
  const boxes = [
    { x:0.3,  label:"User\n(Browser)", sub:"", color:C.GRAY_LIGHT, text:C.GRAY_DARK },
    { x:2.7,  label:"Vercel", sub:"React/Vite SPA\nnborhubb-theta.vercel.app", color:C.BLUE_LIGHT, text:C.BLUE_DARK },
    { x:5.1,  label:"Render", sub:"Express.js API\nneighborhub-snsy.onrender.com", color:"FEF3C7", text:"92400E" },
    { x:7.5,  label:"FreeSQLDB", sub:"MySQL 5.5\nsql12824333", color:"DCFCE7", text:"166534" },
  ];

  boxes.forEach((b) => {
    s.addShape(pptx.ShapeType.rect, { x:b.x, y:1.8, w:2.2, h:2.2,
      fill:{color:b.color}, line:{color:C.GRAY_MID, w:1}, rounding:0.1 });
    s.addText(b.label, { x:b.x+0.1, y:1.95, w:2.0, h:0.55,
      fontSize:14, bold:true, color:b.text, align:"center", breakLine:true });
    s.addText(b.sub, { x:b.x+0.1, y:2.6, w:2.0, h:1.2,
      fontSize:10, color:b.text, align:"center", wrap:true });
  });

  // Arrows
  [2.5, 4.9, 7.3].forEach((x) => {
    s.addShape(pptx.ShapeType.rect, { x, y:2.83, w:0.2, h:0.12, fill:{color:C.ORANGE} });
    s.addText("▶", { x:x+0.02, y:2.77, w:0.2, h:0.25, fontSize:14, color:C.ORANGE });
  });

  s.addText("HTTPS / REST API", { x:3.0, y:4.2, w:2.0, h:0.3, fontSize:10, color:C.GRAY_MID, align:"center", italic:true });
  s.addText("MySQL queries", { x:5.4, y:4.2, w:2.0, h:0.3, fontSize:10, color:C.GRAY_MID, align:"center", italic:true });

  s.addText("Frontend auto-deploys on every GitHub push to main", {
    x:0.3, y:4.6, w:9.4, h:0.35, fontSize:12, color:C.GRAY_MID, align:"center", italic:true,
  });
}

// ── SLIDE 4: Project Refinement ───────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Project Refinement & Code Cleanup");

  const rows = [
    ["package.json",      "Renamed project from my-react-app → neighborhub"],
    ["README.md",         "Full rewrite: tech stack, setup guide, env vars, deployment steps, feature list"],
    [".env.example",      "Created for frontend: documents VITE_API_URL variable"],
    ["vercel.json",       "Added SPA routing rewrites — prevents 404 on direct URL access"],
    ["server/render.yaml","Render deployment config: rootDir, buildCommand, startCommand"],
    ["ESLint",            "Ran npm run lint — 0 errors reported"],
    ["Production Build",  "Ran npm run build — dist/ generated successfully"],
  ];

  rows.forEach(([file, desc], i) => {
    const y = 1.1 + i * 0.52;
    s.addShape(pptx.ShapeType.rect, { x:0.3, y, w:2.6, h:0.42, fill:{color:C.BLUE_LIGHT}, line:{color:C.BLUE_MID, w:0.5} });
    s.addText(file, { x:0.35, y:y+0.05, w:2.5, h:0.35, fontSize:11, bold:true, color:C.BLUE_DARK });
    s.addText("✔", { x:3.0, y:y+0.05, w:0.3, h:0.35, fontSize:13, color:C.GREEN, bold:true });
    s.addText(desc, { x:3.35, y:y+0.05, w:6.3, h:0.35, fontSize:11, color:C.GRAY_DARK, valign:"middle" });
  });
}

// ── SLIDE 5: Database Setup ───────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Database Migration & Setup");

  s.addShape(pptx.ShapeType.rect, { x:0.3, y:1.05, w:4.2, h:2.1, fill:{color:"FEF2F2"}, line:{color:"FCA5A5", w:1} });
  s.addText("Railway MySQL", { x:0.5, y:1.1, w:3.8, h:0.45, fontSize:15, bold:true, color:"DC2626" });
  s.addText("Trial expired — database\ninaccessible. Free tier\nno longer available.", {
    x:0.5, y:1.6, w:3.8, h:1.4, fontSize:12, color:"7F1D1D", breakLine:true,
  });

  s.addText("→", { x:4.65, y:1.85, w:0.5, h:0.5, fontSize:28, bold:true, color:C.ORANGE, align:"center" });

  s.addShape(pptx.ShapeType.rect, { x:5.3, y:1.05, w:4.3, h:2.1, fill:{color:"F0FDF4"}, line:{color:"86EFAC", w:1} });
  s.addText("FreeSQLDatabase.com", { x:5.5, y:1.1, w:3.9, h:0.45, fontSize:15, bold:true, color:"15803D" });
  s.addText("Free MySQL hosting\nNo credit card required\nDatabase: sql12824333\n11 tables imported ✔", {
    x:5.5, y:1.6, w:3.9, h:1.4, fontSize:12, color:"14532D", breakLine:true,
  });

  s.addText("MySQL 5.5 Compatibility Fixes Applied:", {
    x:0.3, y:3.3, w:9.4, h:0.4, fontSize:14, bold:true, color:C.BLUE_DARK,
  });

  const fixes = [
    "Removed CREATE DATABASE / USE neighborhub statements (not permitted on shared hosting)",
    "Changed updated_at TIMESTAMP → DATETIME DEFAULT NULL (MySQL 5.5 allows only 1 TIMESTAMP with DEFAULT CURRENT_TIMESTAMP per table)",
    "Categories, Users, Listings, Orders, Reviews, Messages, Notifications — all 11 tables created successfully",
  ];
  fixes.forEach((f, i) => {
    s.addText(`✔  ${f}`, { x:0.5, y:3.75 + i * 0.42, w:9.1, h:0.38, fontSize:11, color:C.GRAY_DARK });
  });
}

// ── SLIDE 6: Backend Deployment ───────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Backend Deployment — Render");

  s.addShape(pptx.ShapeType.rect, { x:0.3, y:1.05, w:5.8, h:3.7, fill:{color:C.GRAY_LIGHT}, line:{color:C.GRAY_MID, w:0.5} });
  s.addText("Render Configuration", { x:0.5, y:1.15, w:5.4, h:0.45, fontSize:14, bold:true, color:C.BLUE_DARK });

  const cfg = [
    ["Service Type",    "Web Service (Node.js)"],
    ["Root Directory",  "server/"],
    ["Build Command",   "npm install"],
    ["Start Command",   "npm start"],
    ["NODE_ENV",        "production"],
  ];
  cfg.forEach(([k, v], i) => {
    s.addText(k, { x:0.5, y:1.7 + i*0.46, w:2.0, h:0.4, fontSize:11, bold:true, color:C.GRAY_MID });
    s.addText(v, { x:2.6, y:1.7 + i*0.46, w:3.3, h:0.4, fontSize:11, color:C.GRAY_DARK });
  });

  s.addShape(pptx.ShapeType.rect, { x:6.4, y:1.05, w:3.3, h:3.7, fill:{color:"FFF7ED"}, line:{color:"FED7AA", w:0.5} });
  s.addText("Key Bug Fixed", { x:6.6, y:1.15, w:2.9, h:0.45, fontSize:13, bold:true, color:"C2410C" });
  s.addText("SSL Error", { x:6.6, y:1.65, w:2.9, h:0.35, fontSize:12, bold:true, color:"DC2626" });
  s.addText("FreeSQLDatabase.com does not support SSL connections. Removed ssl config block from db.js.", {
    x:6.6, y:2.05, w:2.9, h:1.0, fontSize:10, color:C.GRAY_DARK, wrap:true,
  });
  s.addText("Fix commit: ca048e8", { x:6.6, y:3.1, w:2.9, h:0.3, fontSize:10, color:C.GRAY_MID, italic:true });

  s.addShape(pptx.ShapeType.rect, { x:0.3, y:4.85, w:9.4, h:0.5, fill:{color:"F0FDF4"}, line:{color:"86EFAC", w:1} });
  s.addText("✔  Live  |  https://neighborhub-snsy.onrender.com  |  MySQL connected to: sql12824333", {
    x:0.5, y:4.9, w:9.0, h:0.4, fontSize:12, bold:true, color:C.GREEN,
  });
}

// ── SLIDE 7: Frontend Deployment ──────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Frontend Deployment — Vercel");

  const left = [
    ["Platform",       "Vercel (Hobby — Free, Lifetime)"],
    ["Repository",     "Earl1201/my-react-app @ main"],
    ["Framework",      "Vite (auto-detected)"],
    ["Root Dir",       "./ (project root)"],
    ["Build Command",  "vite build"],
    ["Output Dir",     "dist/"],
    ["VITE_API_URL",   "https://neighborhub-snsy.onrender.com"],
  ];

  s.addShape(pptx.ShapeType.rect, { x:0.3, y:1.05, w:6.0, h:3.8, fill:{color:C.GRAY_LIGHT}, line:{color:C.GRAY_MID, w:0.5} });
  s.addText("Vercel Configuration", { x:0.5, y:1.15, w:5.6, h:0.45, fontSize:14, bold:true, color:C.BLUE_DARK });
  left.forEach(([k, v], i) => {
    s.addText(k, { x:0.5, y:1.7 + i*0.44, w:1.9, h:0.38, fontSize:11, bold:true, color:C.GRAY_MID });
    s.addText(v, { x:2.5, y:1.7 + i*0.44, w:3.65, h:0.38, fontSize:11, color:C.GRAY_DARK, wrap:true });
  });

  s.addShape(pptx.ShapeType.rect, { x:6.6, y:1.05, w:3.1, h:3.8, fill:{color:C.BLUE_LIGHT}, line:{color:C.BLUE_MID, w:0.5} });
  s.addText("SPA Routing Fix", { x:6.75, y:1.15, w:2.8, h:0.45, fontSize:13, bold:true, color:C.BLUE_DARK });
  s.addText("vercel.json ensures React Router deep links work correctly on Vercel:", {
    x:6.75, y:1.65, w:2.8, h:0.8, fontSize:10, color:C.GRAY_DARK, wrap:true,
  });
  s.addText('{\n  "rewrites": [{\n    "source": "/(.*)",\n    "destination": "/index.html"\n  }]\n}', {
    x:6.75, y:2.5, w:2.8, h:1.6, fontSize:9.5, color:C.GRAY_DARK, fontFace:"Courier New",
  });

  s.addShape(pptx.ShapeType.rect, { x:0.3, y:4.9, w:9.4, h:0.45, fill:{color:"F0FDF4"}, line:{color:"86EFAC", w:1} });
  s.addText("✔  Ready  |  https://neighborhub-theta.vercel.app", {
    x:0.5, y:4.95, w:9.0, h:0.35, fontSize:12, bold:true, color:C.GREEN,
  });
}

// ── SLIDE 8: Bug Fixes ────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Key Bug Fixes & Problem Solving");

  const bugs = [
    {
      title: "MySQL 5.5 Dual TIMESTAMP Error (#1293)",
      problem: "Schema import failed: two TIMESTAMP columns with CURRENT_TIMESTAMP not allowed in MySQL 5.5.",
      fix: "Changed updated_at columns from TIMESTAMP to DATETIME DEFAULT NULL in users, listings, and orders tables.",
    },
    {
      title: "FreeSQLDatabase SSL Connection Error",
      problem: "Render logs: \"MySQL connection failed: Server does not support secure connection\"",
      fix: "Removed ssl: { rejectUnauthorized: false } block from server/src/config/db.js. FreeSQLDatabase MySQL 5.5 does not support SSL.",
    },
    {
      title: "phpMyAdmin Schema Import Error",
      problem: "CREATE DATABASE IF NOT EXISTS neighborhub failed — permission denied on shared hosting.",
      fix: "Created database/schema_import.sql without CREATE DATABASE and USE statements for direct table creation.",
    },
    {
      title: "Git History Cleanup",
      problem: "Duplicate commit (Phase 8) appeared on top of Phase 9; Co-Authored-By attribution present.",
      fix: "Used git reset --hard + git commit --amend + git push --force-with-lease to clean commit history.",
    },
  ];

  bugs.forEach((b, i) => {
    const y = 1.05 + i * 1.05;
    s.addShape(pptx.ShapeType.rect, { x:0.3, y, w:9.4, h:0.95, fill:{color:C.GRAY_LIGHT}, line:{color:C.GRAY_MID, w:0.5} });
    s.addText(b.title, { x:0.45, y:y+0.05, w:9.0, h:0.3, fontSize:12, bold:true, color:C.BLUE_DARK });
    s.addText(`Problem: ${b.problem}`, { x:0.45, y:y+0.36, w:9.0, h:0.25, fontSize:9.5, color:"DC2626" });
    s.addText(`Fix: ${b.fix}`, { x:0.45, y:y+0.62, w:9.0, h:0.25, fontSize:9.5, color:C.GREEN });
  });
}

// ── SLIDE 9: Testing Checklist ────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.WHITE} });
  addHeader(s, "Functional Testing Checklist");

  const items = [
    "Home page loads — browse listings without login",
    "User Registration — name, email, password, city",
    "Login / Logout — correct & incorrect credentials tested",
    "Create Listing — with image upload (product & service)",
    "Edit / Delete Listing — own listings only",
    "Browse & Filter — category filter, price range",
    "Listing Detail — view images, seller info, place order",
    "Orders — buyer places order; seller updates status",
    "Messages — start conversation, send & receive",
    "Reviews — leave review after completed order",
    "Notifications — bell icon shows unread count",
    "Admin Dashboard — stats, user list, listing management",
    "404 Page — navigate to /nonexistent",
    "Direct URL Access — paste /listings in new tab (SPA routing works)",
  ];

  const half = Math.ceil(items.length / 2);
  items.forEach((item, i) => {
    const col = i < half ? 0 : 1;
    const row = i < half ? i : i - half;
    const x = col === 0 ? 0.3 : 5.1;
    const y = 1.05 + row * 0.42;
    s.addText(`✔  ${item}`, { x, y, w:4.6, h:0.38, fontSize:11, color:C.GRAY_DARK });
  });
}

// ── SLIDE 10: Live URLs & Summary ─────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:"100%", h:"100%", fill:{color:C.BLUE_DARK} });
  s.addShape(pptx.ShapeType.rect, { x:0, y:0.9, w:"100%", h:0.06, fill:{color:C.ORANGE} });

  s.addText("Live URLs & Summary", {
    x:0.5, y:0.1, w:9, h:0.75, fontSize:24, bold:true, color:C.WHITE,
  });

  const urls = [
    { label:"Frontend (Vercel)", url:"https://neighborhub-theta.vercel.app",        color:"DBEAFE" },
    { label:"Backend API (Render)", url:"https://neighborhub-snsy.onrender.com",    color:"FEF3C7" },
    { label:"GitHub Repository", url:"https://github.com/Earl1201/my-react-app",    color:"F3E8FF" },
  ];

  urls.forEach((u, i) => {
    s.addShape(pptx.ShapeType.rect, { x:0.4, y:1.15 + i*0.75, w:9.2, h:0.6, fill:{color:u.color}, line:{color:C.GRAY_MID, w:0.5} });
    s.addText(u.label, { x:0.6, y:1.22 + i*0.75, w:2.4, h:0.45, fontSize:12, bold:true, color:C.BLUE_DARK });
    s.addText(u.url, { x:3.1, y:1.22 + i*0.75, w:6.3, h:0.45, fontSize:12, color:C.BLUE_MID });
  });

  s.addText("What Was Accomplished:", {
    x:0.4, y:3.55, w:9.2, h:0.4, fontSize:14, bold:true, color:C.ORANGE,
  });

  const summary = [
    "Full-stack cloud deployment: React SPA on Vercel, Express API on Render, MySQL on FreeSQLDatabase",
    "All 6 Task 6 deliverables completed: refinement, testing, version control, and deployment",
    "Resolved MySQL 5.5 compatibility, SSL connection, and schema import issues",
    "NeighborHub is publicly accessible with permanent free hosting — no expiry",
  ];

  summary.forEach((t, i) => {
    s.addText(`✔  ${t}`, { x:0.5, y:4.0 + i*0.36, w:9.0, h:0.32, fontSize:11, color:C.WHITE });
  });
}

// ── Save ──────────────────────────────────────────────────────────
await pptx.writeFile({ fileName: "NeighborHub-Task6.pptx" });
console.log("Done! File saved: NeighborHub-Task6.pptx");
