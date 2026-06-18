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

  // ── Summary sheet ──────────────────────────────────────────────────
  const ws2 = wb.addWorksheet("Summary");
  const n = responses.length;

  function avg(vals) {
    const nums = vals.filter(v => v != null && v !== "" && !isNaN(Number(v))).map(Number);
    if (!nums.length) return "";
    return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
  }
  function count(arr, val) { return arr.filter(v => v === val).length; }

  function addTitle(ws, text, row) {
    const cell = ws.getCell(row, 1);
    cell.value = text;
    cell.font = { bold: true, size: 13, color: { argb: "FF2A1F0E" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8D9A8" } };
    ws.mergeCells(row, 1, row, 4);
  }
  function addHeader(ws, labels, row) {
    labels.forEach((l, i) => {
      const c = ws.getCell(row, i + 1);
      c.value = l;
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A1A2B" } };
    });
  }
  function addRow2(ws, label, val, row, indent) {
    ws.getCell(row, 1).value = indent ? `  ${label}` : label;
    ws.getCell(row, 2).value = val;
    ws.getCell(row, 1).font = { color: { argb: "FF241B12" } };
    ws.getCell(row, 2).font = { color: { argb: "FF241B12" } };
    if (row % 2 === 0) {
      [1,2,3,4].forEach(c => {
        ws.getCell(row, c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFBF8F1" } };
      });
    }
  }

  ws2.getColumn(1).width = 36;
  ws2.getColumn(2).width = 14;
  ws2.getColumn(3).width = 14;
  ws2.getColumn(4).width = 14;

  let r2 = 1;

  // Overview
  addTitle(ws2, "Overview", r2++);
  addRow2(ws2, "Total responses", n, r2++);
  addRow2(ws2, "Average age", avg(responses.map(r => r.age)), r2++);
  r2++;

  // Demographics
  addTitle(ws2, "Demographics", r2++);
  addHeader(ws2, ["Category", "Count", "% of total"], r2++);
  const genders = ["Female/Donna", "Male/Uomo", "Non-binary", "Prefer not to say"];
  const genderVals = ["Donna","Female","Uomo","Male","Non binario","Non-binary","Preferisco non dirlo","Prefer not to say"];
  // group by canonical
  const gMap = { Female: ["Donna","Female"], Male: ["Uomo","Male"], "Non-binary": ["Non binario","Non-binary"], Other: ["Preferisco non dirlo","Prefer not to say"] };
  Object.entries(gMap).forEach(([label, vals]) => {
    const c = responses.filter(r => vals.includes(r.gender)).length;
    ws2.getCell(r2, 1).value = `  ${label}`;
    ws2.getCell(r2, 2).value = c;
    ws2.getCell(r2, 3).value = n ? Math.round(c / n * 100) + "%" : "";
    r2++;
  });
  r2++;

  // Education
  addTitle(ws2, "Education", r2++);
  addHeader(ws2, ["Level", "Count", "%"], r2++);
  const eduMap = {
    "Secondary / Scuola secondaria": ["Secondary school","Scuola secondaria"],
    "Bachelor's / Triennale": ["Bachelor's","Laurea triennale"],
    "Master's / Magistrale": ["Master's","Laurea magistrale"],
    "PhD / Dottorato": ["PhD","Dottorato"],
    "Other / Altro": ["Other","Altro"]
  };
  Object.entries(eduMap).forEach(([label, vals]) => {
    const c = responses.filter(r => vals.includes(r.education)).length;
    ws2.getCell(r2, 1).value = `  ${label}`;
    ws2.getCell(r2, 2).value = c;
    ws2.getCell(r2, 3).value = n ? Math.round(c / n * 100) + "%" : "";
    r2++;
  });
  r2++;

  // Scale averages per category
  const catThemes = { wine: "FFB05070", beer: "FF8A4E1C", spirits: "FF13586E" };
  const catLabels = { wine: "Wine / Vino", beer: "Craft Beer / Birra", spirits: "Craft Spirits / Distillati" };
  const scaleGroups = [
    { label: "Heritage & Complexity (hc1–hc4)", keys: ["hc1","hc2","hc3","hc4"] },
    { label: "Feeling Included (cb1–cb4)", keys: ["cb1","cb2","cb3","cb4"] },
    { label: "Feeling at Ease (fa1–fa4)", keys: ["fa1","fa2","fa3","fa4"] },
  ];

  addTitle(ws2, "Perception Scale Averages  (1–5)", r2++);
  addHeader(ws2, ["Scale", "Wine", "Beer", "Spirits"], r2++);
  ws2.getColumn(3).width = 12;
  ws2.getColumn(4).width = 12;

  scaleGroups.forEach(sg => {
    ws2.getCell(r2, 1).value = sg.label;
    ["wine","beer","spirits"].forEach((cat, ci) => {
      const vals = responses.map(resp => resp.perceptions?.[cat]);
      const allVals = sg.keys.flatMap(k => vals.map(p => p?.[k]));
      ws2.getCell(r2, ci + 2).value = avg(allVals);
    });
    ws2.getCell(r2, 1).font = { color: { argb: "FF241B12" } };
    r2++;
  });
  // Total perception avg
  ws2.getCell(r2, 1).value = "  Overall perception avg";
  ws2.getCell(r2, 1).font = { bold: true };
  ["wine","beer","spirits"].forEach((cat, ci) => {
    const allVals = PERC_KEYS.flatMap(k => responses.map(resp => resp.perceptions?.[cat]?.[k]));
    const v = avg(allVals);
    ws2.getCell(r2, ci + 2).value = v;
    ws2.getCell(r2, ci + 2).font = { bold: true };
  });
  r2 += 2;

  // Anxiety
  addTitle(ws2, "Wine Choice Anxiety  (1–5)", r2++);
  addHeader(ws2, ["Item", "Mean"], r2++);
  ANX_IDS.forEach((id, i) => {
    ws2.getCell(r2, 1).value = `  an${i+1}`;
    ws2.getCell(r2, 2).value = avg(responses.map(resp => resp.anxiety?.[id]));
    r2++;
  });
  ws2.getCell(r2, 1).value = "  Overall anxiety avg";
  ws2.getCell(r2, 1).font = { bold: true };
  ws2.getCell(r2, 2).value = avg(ANX_IDS.flatMap(id => responses.map(resp => resp.anxiety?.[id])));
  ws2.getCell(r2, 2).font = { bold: true };
  r2 += 2;

  // Cues
  addTitle(ws2, "Heritage Cues  (1 = discourages, 5 = encourages)", r2++);
  addHeader(ws2, ["Cue", "Mean"], r2++);
  CUE_IDS.forEach(id => {
    ws2.getCell(r2, 1).value = `  ${id}`;
    ws2.getCell(r2, 2).value = avg(responses.map(resp => resp.cues?.[id]));
    r2++;
  });
  r2++;

  // Consumption & Knowledge
  addTitle(ws2, "Consumption & Knowledge Averages  (1–5)", r2++);
  addHeader(ws2, ["Metric", "Wine", "Beer", "Spirits"], r2++);
  ["consumption","knowledge"].forEach(metric => {
    ws2.getCell(r2, 1).value = `  ${metric.charAt(0).toUpperCase() + metric.slice(1)}`;
    ["wine","beer","spirits"].forEach((cat, ci) => {
      ws2.getCell(r2, ci + 2).value = avg(responses.map(resp => resp[metric]?.[cat]));
    });
    r2++;
  });

  // ── end Summary ────────────────────────────────────────────────────

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
