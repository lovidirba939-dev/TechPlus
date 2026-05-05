import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';
import { ROADMAPS, ROADMAP_QUESTIONS, COURSE_SUGGESTIONS } from '../src/data/roadmapData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../public/pdfs');

const COLORS = {
  bg: [7, 9, 18],
  panel: [11, 14, 26],
  panelSoft: [15, 18, 32],
  border: [48, 53, 75],
  text: [244, 245, 255],
  muted: [180, 186, 212],
  accent: [124, 58, 237],
  accentSoft: [168, 85, 247],
  success: [94, 234, 212],
  warn: [255, 214, 76]
};

const STAGE_TIMINGS = ['3-4 weeks', '4-5 weeks', '4-6 weeks', '6-8 weeks', 'Ongoing'];

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createDoc() {
  return new jsPDF({ unit: 'pt', format: 'a4' });
}

function pageSize(doc) {
  return {
    w: doc.internal.pageSize.getWidth(),
    h: doc.internal.pageSize.getHeight()
  };
}

function splitTopics(step) {
  return String(step?.detail || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferTools(topics) {
  const preferred = topics.filter((topic) =>
    /\b(react|node|docker|kubernetes|terraform|aws|azure|gcp|postgres|mysql|mongodb|redis|typescript|python|kotlin|swift|compose|hilt|room|retrofit|workmanager|jest|vitest|playwright|cypress|solidity|ethers|unity|unreal|figma|tableau|power bi|pytorch|tensorflow|scikit|mlflow)\b/i.test(topic)
  );
  return (preferred.length ? preferred : topics).slice(0, 4);
}

function inferProjects(title, topics, idx) {
  const label = title.replace(/^Stage\s*\d+\s*[-:]\s*/i, '').trim();
  const first = topics[0] || 'core concepts';
  const second = topics[1] || 'delivery';
  return [
    `${label} workshop using ${first}`,
    `${label} portfolio project with ${second}`
  ];
}

function inferMilestone(roadmapTitle, idx, projects) {
  if (idx === 4) {
    return `A production-grade ${roadmapTitle.toLowerCase()} workflow with measurable performance, quality, and release confidence.`;
  }
  return `Complete ${projects[0]} and document the decisions, trade-offs, and validation checks before moving to Stage ${idx + 2}.`;
}

function groupedSteps(roadmap) {
  return roadmap.steps.map((step, idx) => {
    const topics = splitTopics(step);
    const tools = inferTools(topics);
    const projects = inferProjects(roadmap.title, topics, idx);
    return {
      ...step,
      idx,
      topics,
      tools,
      projects,
      milestone: inferMilestone(roadmap.title, idx, projects)
    };
  });
}

function paintPage(doc) {
  const { w, h } = pageSize(doc);
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, w, h, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(1);
  doc.rect(24, 24, w - 48, h - 48, 'S');
}

function footer(doc, title, pageNumber) {
  const { w, h } = pageSize(doc);
  doc.setTextColor(136, 143, 170);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${title} Roadmap  |  TechPlus Intelligence Platform`, 42, h - 28);
  doc.text(`Page ${pageNumber} of 6`, w - 92, h - 28);
}

function addWrappedText(doc, text, x, y, width, lineHeight, color = COLORS.muted, style = 'normal', size = 11) {
  doc.setTextColor(...color);
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function getWrappedLines(doc, text, width, size = 11, style = 'normal') {
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
  return doc.splitTextToSize(String(text || ''), width);
}

function drawSectionTitle(doc, label, x, y) {
  doc.setTextColor(...COLORS.accentSoft);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(label, x, y);
}

function drawBulletList(doc, items, x, y, width, lineHeight = 13, bulletColor = COLORS.accentSoft) {
  let cursor = y;
  for (const item of items) {
    const lines = doc.splitTextToSize(item, width - 16);
    doc.setFillColor(...bulletColor);
    doc.circle(x + 3, cursor - 4, 2.2, 'F');
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text(lines, x + 12, cursor);
    cursor += lines.length * lineHeight + 4;
  }
  return cursor;
}

function drawCard(doc, x, y, w, h) {
  doc.setFillColor(...COLORS.panel);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(x, y, w, h, 14, 14, 'FD');
}

function drawBrandHeader(doc, y = 52) {
  doc.setFillColor(...COLORS.text);
  doc.roundedRect(42, y - 14, 18, 18, 5, 5, 'F');
  doc.setTextColor(...COLORS.bg);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('T+', 46.5, y - 1);

  doc.setTextColor(...COLORS.accentSoft);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TECHPLUS', 68, y);
}

function drawTopicPills(doc, pills, startX, startY, maxRowWidth) {
  const gapX = 10;
  const gapY = 12;
  const minWidth = 104;
  const maxWidth = 176;
  const paddingX = 14;
  const paddingTop = 9;
  const lineHeight = 10;
  const baseHeight = 10;
  let x = startX;
  let y = startY;
  let rowHeight = 0;

  for (const pill of pills) {
    const textWidth = maxWidth - paddingX * 2;
    const lines = getWrappedLines(doc, pill, textWidth, 9, 'bold');
    const lineCount = Math.max(lines.length, 1);
    const longestLineWidth = Math.max(...lines.map((line) => doc.getTextWidth(line)));
    const pillWidth = Math.max(
      minWidth,
      Math.min(maxWidth, longestLineWidth + paddingX * 2)
    );
    const pillHeight = baseHeight + paddingTop + lineCount * lineHeight;

    if (x + pillWidth > startX + maxRowWidth) {
      x = startX;
      y += rowHeight + gapY;
      rowHeight = 0;
    }

    doc.setFillColor(...COLORS.panelSoft);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(x, y, pillWidth, pillHeight, 13, 13, 'FD');
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(lines, x + paddingX, y + paddingTop + 7);

    x += pillWidth + gapX;
    rowHeight = Math.max(rowHeight, pillHeight);
  }

  return y + rowHeight;
}

function normalizeResourceItem(item) {
  if (typeof item === 'string') {
    const typeMatch = item.match(/^(FREE|PAID):\s*/i);
    const type = typeMatch ? typeMatch[1].toUpperCase() : 'FREE';
    const rawTitle = item.replace(/^(FREE|PAID):\s*/i, '').trim();
    const urlMatch = rawTitle.match(/\((https?:\/\/[^)]+)\)\s*$/i);
    const url = urlMatch?.[1] || '';
    const title = rawTitle.replace(/\s*\(https?:\/\/[^)]+\)\s*$/i, '').trim();
    return { type, title, url };
  }

  return {
    type: item?.type || 'FREE',
    title: item?.title || '',
    url: item?.url || ''
  };
}

function drawResourceCard(doc, resource, x, y, w) {
  const titleLines = getWrappedLines(doc, resource.title, w - 108, 10, 'normal');
  const hasUrl = Boolean(resource.url);
  const linkLines = hasUrl ? getWrappedLines(doc, resource.url, w - 108, 9, 'normal') : [];
  const cardHeight = Math.max(52, 24 + titleLines.length * 12 + (hasUrl ? 10 + linkLines.length * 10 : 0));

  drawCard(doc, x, y, w, cardHeight);
  const isFree = resource.type === 'FREE';

  doc.setTextColor(...(isFree ? COLORS.success : COLORS.warn));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(resource.type, x + 16, y + 21);

  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(titleLines, x + 82, y + 21);

  if (hasUrl) {
    const linkY = y + 21 + titleLines.length * 12 + 8;
    doc.setTextColor(...COLORS.accentSoft);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Link:', x + 82, linkY);
    doc.setTextColor(...COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(linkLines, x + 112, linkY);
    doc.link(x + 112, linkY - 8, Math.min(w - 124, 380), linkLines.length * 10 + 4, {
      url: resource.url
    });
  }

  return cardHeight;
}

function drawCoverPage(doc, roadmap, steps) {
  paintPage(doc);

  drawBrandHeader(doc, 52);
  doc.text('2026 Edition', 42, 68);

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(28);
  const titleLines = getWrappedLines(doc, String(roadmap.title || '').toUpperCase(), 240, 28, 'bold');
  doc.text(titleLines, 42, 110);
  const titleBottomY = 110 + titleLines.length * 30;
  doc.setFontSize(18);
  doc.text('Complete Learning Roadmap', 42, titleBottomY + 8);

  const descStartY = titleBottomY + 58;
  addWrappedText(doc, roadmap.description, 42, descStartY, 300, 16, COLORS.muted, 'normal', 11.5);

  const pills = steps.flatMap((step) => step.tools).slice(0, 6);
  const pillBottomY = drawTopicPills(doc, pills, 42, descStartY + 64, 320);

  const cardW = 148;
  const cardH = 96;
  const cardGap = 14;
  const firstRowY = pillBottomY + 64;
  const secondRowY = firstRowY + cardH + 16;
  ['01', '02', '03', '04', '05'].forEach((num, idx) => {
    const firstRow = idx < 3;
    const x = firstRow
      ? 42 + idx * (cardW + cardGap)
      : 123 + (idx - 3) * (cardW + cardGap);
    const cardY = firstRow ? firstRowY : secondRowY;
    drawCard(doc, x, cardY, cardW, cardH);
    doc.setTextColor(...COLORS.accentSoft);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(num, x + 14, cardY + 28);
    doc.setTextColor(...COLORS.text);
    const label = steps[idx]?.title?.replace(/^Stage\s*\d+\s*-\s*/i, '') || `Stage ${idx + 1}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(getWrappedLines(doc, label, 112, 10.5, 'bold'), x + 14, cardY + 50);
  });

  const statsY = secondRowY + cardH + 26;
  [
    ['5', 'Learning Stages'],
    [`${steps.reduce((sum, step) => sum + step.topics.length, 0)}+`, 'Core Topics'],
    [`${steps.reduce((sum, step) => sum + step.projects.length, 0)}+`, 'Projects'],
    ['100%', roadmap.title.split(' ')[0]]
  ].forEach(([value, label], idx) => {
    const x = 42 + idx * 122;
    drawCard(doc, x, statsY, 110, 80);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(value, x + 16, statsY + 30);
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(label, 80), x + 16, statsY + 52);
  });

  footer(doc, roadmap.title, 1);
}

function drawOverviewPage(doc, roadmap, steps) {
  paintPage(doc);
  drawBrandHeader(doc, 52);
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(20);
  doc.text('Learning Path Overview', 42, 78);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(11);
  doc.text('Five progressive stages from fundamentals to production mastery', 42, 98);

  const cardW = 148;
  const cardH = 116;
  const gap = 14;
  const firstRowY = 142;
  const secondRowY = firstRowY + cardH + 16;
  steps.forEach((step, idx) => {
    const firstRow = idx < 3;
    const x = firstRow
      ? 42 + idx * (cardW + gap)
      : 123 + (idx - 3) * (cardW + gap);
    const y = firstRow ? firstRowY : secondRowY;
    drawCard(doc, x, y, cardW, cardH);
    doc.setTextColor(...COLORS.accentSoft);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(`0${idx + 1}`, x + 12, y + 24);
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10.5);
    doc.text(getWrappedLines(doc, step.title.replace(/^Stage\s*\d+\s*-\s*/i, ''), 116, 10.5, 'bold'), x + 12, y + 44);
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(8.5);
    doc.text(getWrappedLines(doc, step.tools.slice(0, 4).join(' • '), 116, 8.5, 'normal'), x + 12, y + 78);
  });

  let currentY = secondRowY + cardH + 30;
  drawSectionTitle(doc, 'How to Use This Roadmap', 42, currentY);
  currentY += 24;

  const guidance = [
    ['Build and ship first', 'Complete a small working project in every stage before advancing.'],
    ['Use official sources', 'Start with the docs and use secondary resources to reinforce implementation patterns.'],
    ['Iterate on projects', 'Refactor earlier work as you learn better architecture, testing, and performance habits.']
  ];

  guidance.forEach(([title, body]) => {
    drawCard(doc, 42, currentY, 512, 70);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(title, 58, currentY + 22);
    addWrappedText(doc, body, 58, currentY + 42, 470, 14, COLORS.muted, 'normal', 10);
    currentY += 86;
  });

  footer(doc, roadmap.title, 2);
}

function drawStageGroupPage(doc, roadmap, steps, pageNumber, title, subtitle) {
  paintPage(doc);
  drawBrandHeader(doc, 52);
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(20);
  doc.text(title, 42, 78);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(11);
  doc.text(subtitle, 42, 98);

  let top = 132;
  steps.forEach((step) => {
    drawCard(doc, 42, top, 512, 274);
    doc.setTextColor(...COLORS.accentSoft);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(`0${step.idx + 1}`, 58, top + 28);
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(17);
    doc.text(step.title, 58, top + 52);
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(9.5);
    doc.text(`Estimated: ${STAGE_TIMINGS[step.idx]}  |  Prerequisites: ${step.idx === 0 ? 'Basic foundations' : `Stage ${step.idx} complete`}`, 58, top + 72);

    drawSectionTitle(doc, 'Topics', 58, top + 100);
    drawBulletList(doc, step.topics.slice(0, 4), 58, top + 118, 210);

    drawSectionTitle(doc, 'Tools & Frameworks', 300, top + 100);
    drawBulletList(doc, step.tools.slice(0, 4), 300, top + 118, 210, 13, COLORS.success);

    drawSectionTitle(doc, 'Recommended Projects', 58, top + 192);
    drawBulletList(doc, step.projects, 58, top + 210, 452, 13, COLORS.warn);

    doc.setTextColor(...COLORS.success);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Stage ${step.idx + 1} Milestone`, 58, top + 250);
    addWrappedText(doc, step.milestone, 150, top + 250, 356, 12, COLORS.text, 'normal', 9.5);

    top += 294;
  });

  footer(doc, roadmap.title, pageNumber);
}

function drawAdvancedPage(doc, roadmap, step) {
  paintPage(doc);
  drawBrandHeader(doc, 52);
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(20);
  doc.text('Stage 05 - Advanced Topics & Delivery', 42, 78);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(11);
  doc.text('Performance, architecture, release automation, and production governance', 42, 98);

  drawCard(doc, 42, 132, 250, 250);
  doc.setTextColor(...COLORS.accentSoft);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('05', 58, 160);
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(17);
  doc.text(step.title, 58, 184);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(9.5);
  doc.text(`Estimated: ${STAGE_TIMINGS[4]}  |  Industry-grade operating habits`, 58, 204);
  drawSectionTitle(doc, 'Advanced Focus', 58, 232);
  drawBulletList(doc, step.topics.slice(0, 4), 58, 250, 210);

  drawCard(doc, 304, 132, 250, 250);
  drawSectionTitle(doc, 'CI/CD Pipeline', 320, 160);
  const nodes = ['Git', 'Lint', 'Tests', 'Build', 'Release', 'Monitor'];
  nodes.forEach((node, idx) => {
    const x = 320 + (idx % 2) * 110;
    const y = 184 + Math.floor(idx / 2) * 48;
    doc.setFillColor(...COLORS.panelSoft);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(x, y, 90, 28, 10, 10, 'FD');
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(node, x + 28, y + 18);
    if (idx < nodes.length - 1) {
      const nextX = idx % 2 === 0 ? x + 98 : x - 12;
      const nextY = idx % 2 === 0 ? y + 14 : y + 34;
      const endX = idx % 2 === 0 ? x + 110 : x + 33;
      const endY = idx % 2 === 0 ? y + 14 : y + 48;
      doc.setDrawColor(...COLORS.accentSoft);
      doc.line(nextX, nextY, endX, endY);
    }
  });

  drawCard(doc, 42, 398, 512, 150);
  drawSectionTitle(doc, 'Stage 5 Milestone', 58, 426);
  addWrappedText(doc, step.milestone, 58, 446, 470, 15, COLORS.text, 'normal', 11);
  drawSectionTitle(doc, 'Performance Budget', 58, 500);
  addWrappedText(
    doc,
    'Set and track concrete engineering thresholds: startup latency, error budget, throughput, cost efficiency, and deployment confidence.',
    58,
    520,
    470,
    14,
    COLORS.muted,
    'normal',
    10
  );

  footer(doc, roadmap.title, 5);
}

function drawResourcesPage(doc, roadmap, steps) {
  paintPage(doc);
  drawBrandHeader(doc, 52);
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(20);
  doc.text('Resources & Practice Questions', 42, 78);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(11);
  doc.text('Verified links, self-assessment, and community follow-up', 42, 98);

  const resources = [
    ...((COURSE_SUGGESTIONS[roadmap.id] || []).slice(0, 4).map(normalizeResourceItem)),
    normalizeResourceItem({
      type: 'FREE',
      title: `${roadmap.title} roadmap reference`,
      url: steps[0]?.links?.[0]?.url || roadmap.roadmapUrl || ''
    }),
    normalizeResourceItem({
      type: 'FREE',
      title: 'Official documentation',
      url: steps[0]?.links?.[1]?.url || ''
    })
  ].filter((resource) => resource.title);

  let y = 132;
  resources.slice(0, 6).forEach((resource) => {
    const cardHeight = drawResourceCard(doc, resource, 42, y, 512);
    y += cardHeight + 10;
  });

  drawSectionTitle(doc, 'Self-Assessment Practice Questions', 42, 504);
  let qY = 526;
  (ROADMAP_QUESTIONS[roadmap.id] || []).slice(0, 3).forEach((question) => {
    qY = drawBulletList(doc, [question], 42, qY, 512, 12, COLORS.accentSoft) + 6;
  });

  footer(doc, roadmap.title, 6);
}

async function generate() {
  await fs.mkdir(outDir, { recursive: true });

  for (const roadmap of ROADMAPS) {
    const steps = groupedSteps(roadmap);
    const doc = createDoc();

    drawCoverPage(doc, roadmap, steps);
    doc.addPage();
    drawOverviewPage(doc, roadmap, steps);
    doc.addPage();
    drawStageGroupPage(doc, roadmap, steps.slice(0, 2), 3, 'Stages 01 & 02 - Deep Dive', 'Fundamentals, core concepts, and architectural foundations');
    doc.addPage();
    drawStageGroupPage(doc, roadmap, steps.slice(2, 4), 4, 'Stages 03 & 04 - Deep Dive', 'Modern tooling, delivery frameworks, and portfolio projects');
    doc.addPage();
    drawAdvancedPage(doc, roadmap, steps[4]);
    doc.addPage();
    drawResourcesPage(doc, roadmap, steps);

    const filePath = path.join(outDir, `${slugify(roadmap.id)}-roadmap.pdf`);
    await fs.writeFile(filePath, Buffer.from(doc.output('arraybuffer')));
  }
}

generate()
  .then(() => {
    console.log(`Generated ${ROADMAPS.length} PDFs in ${outDir}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
