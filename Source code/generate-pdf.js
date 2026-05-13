const fs = require('fs');
const PDFDocument = require('pdfkit');

async function createPDF() {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(fs.createWriteStream('source_code.pdf'));

  // Define files to read for each section
  const sections = [
    {
      title: '--- FRONTEND SOURCE CODE ---',
      files: [
        'frontend/src/App.tsx',
        'frontend/src/pages/Dashboard.tsx',
        'frontend/src/pages/InterviewPage.tsx'
      ],
      targetLines: 550
    },
    {
      title: '--- BACKEND SOURCE CODE ---',
      files: [
        'backend/src/server.js',
        'backend/src/config/db.js',
        'backend/src/routes/notes.routes.js',
        'backend/src/controllers/notes.controller.js',
        'backend/src/models/Note.model.js',
        'backend/src/scripts/seed-notes.js',
        'backend/src/app.js'
      ],
      targetLines: 550
    },
    {
      title: '--- ADMIN PANEL SOURCE CODE ---',
      files: [
        'frontend/src/pages/AdminPanel.tsx'
      ],
      targetLines: 150
    }
  ];

  doc.font('Courier').fontSize(10);

  for (const section of sections) {
    doc.addPage();
    doc.fontSize(14).text(section.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10);

    let linesAdded = 0;

    for (const file of section.files) {
      if (linesAdded >= section.targetLines) break;

      if (fs.existsSync(file)) {
        doc.fillColor('blue').text(`\n\n// File: ${file}\n`, { continued: false });
        doc.fillColor('black');
        
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        const linesToTake = Math.min(lines.length, section.targetLines - linesAdded);
        const codeSubset = lines.slice(0, linesToTake).join('\n');
        
        doc.text(codeSubset);
        linesAdded += linesToTake;
      }
    }
  }

  doc.end();
  console.log('source_code.pdf generated successfully!');
}

createPDF().catch(console.error);
