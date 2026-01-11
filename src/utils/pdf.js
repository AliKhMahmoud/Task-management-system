const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");

function getTemplate(templateName) {
  const templatePath = path.join(__dirname, "..", "templates", templateName);
  return fs.readFileSync(templatePath, "utf-8");
}

async function renderTemplate(templateName, data) {
  const template = getTemplate(templateName);
  return ejs.render(template, data);
}

async function generatePdfFromHtml(html) {
  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        bottom: "14mm",
        left: "12mm",
        right: "12mm",
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

async function generateTasksPdf(data) {
  const html = await renderTemplate("tasks-report.ejs", data);
  return generatePdfFromHtml(html);
}

async function generateProjectPdf(data) {
  const html = await renderTemplate("project-report.ejs", data);
  return generatePdfFromHtml(html);
}

module.exports = {
  generateTasksPdf,
  generateProjectPdf,
};
