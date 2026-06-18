const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, "data", "responses.json");
const RESEARCHER_PASSWORD = process.env.RESEARCHER_PASSWORD || "Tesi00";

// Ensure data directory and file exist
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function readResponses() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeResponses(responses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(responses, null, 2), "utf8");
}

app.use(cors());
app.use(express.json({ limit: "200kb" }));

const submitLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

// Save a new response
app.post("/api/responses", submitLimiter, (req, res) => {
  const record = req.body;
  if (!record || !record.id || !record.timestamp) {
    return res.status(400).json({ error: "invalid-record" });
  }
  const responses = readResponses();
  if (responses.find(r => r.id === record.id)) {
    return res.status(409).json({ error: "duplicate" });
  }
  responses.push(record);
  writeResponses(responses);
  res.json({ ok: true, id: record.id });
});

// List all responses (researcher only)
app.get("/api/responses", (req, res) => {
  if (req.query.password !== RESEARCHER_PASSWORD) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const responses = readResponses();
  responses.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  res.json({ responses, total: responses.length });
});

const PERC_KEYS = ["hc1","hc2","hc3","hc4","cb1","cb2","cb3","cb4","fa1","fa2","fa3","fa4"];
const ANX_IDS = ["an1","an2","an3","an4"];
const CUE_IDS = ["origin","family","method","score","organic","vintage","price"];

function flattenRecord(r) {
  const row = {
    id: r.id,
    timestamp: r.timestamp,
    lang: r.lang || "",
    age: r.age,
    works_in_sector: r.worksInSector,
    gender: r.gender,
    education: r.education,
    consumption_wine: r.consumption?.wine ?? "",
    consumption_beer: r.consumption?.beer ?? "",
    consumption_spirits: r.consumption?.spirits ?? "",
    knowledge_wine: r.knowledge?.wine ?? "",
    knowledge_beer: r.knowledge?.beer ?? "",
    knowledge_spirits: r.knowledge?.spirits ?? "",
  };
  ["wine", "beer", "spirits"].forEach(cat => {
    const perc = r.perceptions?.[cat] || {};
    PERC_KEYS.forEach(k => { row[`${cat}_${k}`] = perc[k] ?? ""; });
  });
  ANX_IDS.forEach(id => { row[`anxiety_${id}`] = r.anxiety?.[id] ?? ""; });
  CUE_IDS.forEach(id => { row[`cue_${id}`] = r.cues?.[id] ?? ""; });
  row.open1 = r.open1 || "";
  row.open2 = r.open2 || "";
  row.open3 = r.open3 || "";
  return row;
}

// Export Excel (researcher only)
app.get("/api/responses/export.xlsx", async (req, res) => {
  if (req.query.password !== RESEARCHER_PASSWORD) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const responses = readResponses();
  responses.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  const wb = new ExcelJS.Workbook();
  wb.creator = "Thesis Survey";
  wb.created = new Date();

  const ws = wb.addWorksheet("Responses");

  const cols = [
    { header: "ID", key: "id", width: 22 },
    { header: "Timestamp", key: "timestamp", width: 22 },
    { header: "Lang", key: "lang", width: 6 },
    { header: "Age", key: "age", width: 6 },
    { header: "Works in sector", key: "works_in_sector", width: 16 },
    { header: "Gender", key: "gender", width: 14 },
    { header: "Education", key: "education", width: 20 },
    { header: "Consumption wine", key: "consumption_wine", width: 18 },
    { header: "Consumption beer", key: "consumption_beer", width: 18 },
    { header: "Consumption spirits", key: "consumption_spirits", width: 20 },
    { header: "Knowledge wine", key: "knowledge_wine", width: 16 },
    { header: "Knowledge beer", key: "knowledge_beer", width: 16 },
    { header: "Knowledge spirits", key: "knowledge_spirits", width: 18 },
  ];
  ["wine","beer","spirits"].forEach(cat => {
    PERC_KEYS.forEach(k => cols.push({ header: `${cat}_${k}`, key: `${cat}_${k}`, width: 14 }));
  });
  ANX_IDS.forEach(id => cols.push({ header: `anxiety_${id}`, key: `anxiety_${id}`, width: 13 }));
  CUE_IDS.forEach(id => cols.push({ header: `cue_${id}`, key: `cue_${id}`, width: 13 }));
  cols.push(
    { header: "Open 1", key: "open1", width: 40 },
    { header: "Open 2", key: "open2", width: 40 },
    { header: "Open 3", key: "open3", width: 40 }
  );

  ws.columns = cols;

  // Style header row
  ws.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: "FF2A1F0E" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8D9A8" } };
    cell.border = { bottom: { style: "thin", color: { argb: "FFD8CBA8" } } };
    cell.alignment = { wrapText: false };
  });

  responses.forEach(r => ws.addRow(flattenRecord(r)));

  // Freeze header and enable autoFilter
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: "A1", to: { row: 1, column: cols.length } };

  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="wine_survey_${date}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
});

// Serve React build in production
const distPath = path.join(__dirname, "client", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
