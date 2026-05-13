import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, SectionType, BorderStyle, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

interface ResumeData {
  name?: string;
  title?: string;
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{ title?: string; company?: string; date?: string; location?: string; bullets?: string[] }>;
  projects?: Array<{ title?: string; date?: string; details?: string }>;
  education?: Array<{ degree?: string; school?: string; date?: string; details?: string }>;
  skills?: Array<{ category?: string; items?: string[]; proficiency?: number }>;
}

export const exportToDocx = async (data: ResumeData, filename: string = 'Resume.docx') => {
  const doc = new Document({
    sections: [
      {
        properties: {
          type: SectionType.CONTINUOUS,
        },
        children: [
          // Header
          new Paragraph({
            text: data.name?.toUpperCase() || 'RESUME',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: [
                  data.contact?.email,
                  data.contact?.phone,
                  data.contact?.location,
                  data.contact?.linkedin
                ].filter(Boolean).join(' | '),
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Summary
          ...(data.summary ? [
            new Paragraph({
              text: 'PROFESSIONAL SUMMARY',
              heading: HeadingLevel.HEADING_2,
              border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
            }),
            new Paragraph({
              children: [new TextRun({ text: data.summary, size: 22 })],
              spacing: { before: 200, after: 400 },
            }),
          ] : []),

          // Experience
          ...(data.experience?.length ? [
            new Paragraph({
              text: 'EXPERIENCE',
              heading: HeadingLevel.HEADING_2,
              border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
            }),
            ...data.experience.flatMap(exp => [
              new Paragraph({
                children: [
                  new TextRun({ text: exp.title || '', bold: true, size: 24 }),
                  new TextRun({ text: ` | ${exp.company || ''}`, size: 24 }),
                  new TextRun({ text: `\t${exp.date || ''}`, size: 24 }),
                ],
                tabStops: [{ type: 'right', position: 9350 }],
                spacing: { before: 200 },
              }),
              ...(exp.bullets || []).map(bullet => 
                new Paragraph({
                  text: bullet,
                  bullet: { level: 0 },
                  spacing: { before: 100 },
                })
              )
            ]),
            new Paragraph({ text: '', spacing: { after: 200 } }),
          ] : []),

          // Projects
          ...(data.projects?.length ? [
            new Paragraph({
              text: 'PROJECTS',
              heading: HeadingLevel.HEADING_2,
              border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
            }),
            ...data.projects.flatMap(proj => [
              new Paragraph({
                children: [
                  new TextRun({ text: proj.title || '', bold: true, size: 24 }),
                  new TextRun({ text: `\t${proj.date || ''}`, size: 24 }),
                ],
                tabStops: [{ type: 'right', position: 9350 }],
                spacing: { before: 200 },
              }),
              new Paragraph({
                children: [new TextRun({ text: proj.details || '', size: 22 })],
                spacing: { before: 100 },
              }),
            ]),
            new Paragraph({ text: '', spacing: { after: 200 } }),
          ] : []),

          // Education
          ...(data.education?.length ? [
            new Paragraph({
              text: 'EDUCATION',
              heading: HeadingLevel.HEADING_2,
              border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
            }),
            ...data.education.flatMap(edu => [
              new Paragraph({
                children: [
                  new TextRun({ text: edu.school || '', bold: true, size: 24 }),
                  new TextRun({ text: `\t${edu.date || ''}`, size: 24 }),
                ],
                tabStops: [{ type: 'right', position: 9350 }],
                spacing: { before: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: edu.degree || '', italics: true, size: 22 }),
                ],
                spacing: { before: 100 },
              }),
            ]),
            new Paragraph({ text: '', spacing: { after: 200 } }),
          ] : []),

          // Skills
          ...(data.skills?.length ? [
            new Paragraph({
              text: 'SKILLS',
              heading: HeadingLevel.HEADING_2,
              border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
            }),
            new Paragraph({
              children: (data.skills || []).flatMap((skill, idx) => [
                new TextRun({ text: `${skill.category}: `, bold: true, size: 22 }),
                new TextRun({ text: (skill.items || []).join(', '), size: 22 }),
                ...(idx < (data.skills?.length || 0) - 1 ? [new TextRun({ break: 1 })] : []),
              ]),
              spacing: { before: 200, after: 400 },
            }),
          ] : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};
