import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
import Note from './src/models/Note.model.js';

const SKILLS = {
  "Computer Science Fundamentals": {
    "Data Structures & Algorithms": {
      topics: ["Arrays & Strings","Linked Lists","Stacks & Queues","Trees & Graphs","Sorting & Searching","Dynamic Programming","Greedy Algorithms","Hashing","Recursion & Backtracking","Time & Space Complexity"],
      desc: "Foundation of computer science covering how data is organized, stored, and manipulated efficiently."
    },
    "Operating Systems": {
      topics: ["Process Management","CPU Scheduling","Deadlocks","Memory Management","Virtual Memory","File Systems","I/O Management","System Calls","Threads & Concurrency","Page Replacement Algorithms"],
      desc: "Study of software that manages computer hardware and provides services for programs."
    },
    "Networking": {
      topics: ["OSI & TCP/IP Models","IP Addressing & Subnetting","Routing Protocols","TCP vs UDP","DNS & DHCP","HTTP/HTTPS","Network Security","Firewalls","Socket Programming","Wireless Networks"],
      desc: "Principles of computer communication, protocols, and network architecture."
    },
    "Computer Architecture": {
      topics: ["Von Neumann Architecture","Instruction Set Architecture","Pipelining","Cache Memory","RISC vs CISC","Memory Hierarchy","I/O Organization","Parallel Processing","Microarchitecture","Performance Metrics"],
      desc: "Study of computer system structure, organization, and design principles."
    },
    "Database Management & SQL": {
      topics: ["ER Modeling","Normalization","SQL Queries","Joins & Subqueries","Indexing","Transactions & ACID","Concurrency Control","NoSQL Databases","Query Optimization","Stored Procedures"],
      desc: "Design, implementation, and management of database systems."
    },
    "Object-Oriented Programming": {
      topics: ["Classes & Objects","Encapsulation","Inheritance","Polymorphism","Abstraction","SOLID Principles","Design Patterns","Interfaces","Exception Handling","Generics & Templates"],
      desc: "Programming paradigm based on objects containing data and methods."
    },
    "SDLC & Agile": {
      topics: ["Waterfall Model","Agile Manifesto","Scrum Framework","Sprint Planning","Kanban","CI/CD Pipelines","Test-Driven Development","Version Control","Code Reviews","DevOps Practices"],
      desc: "Software development methodologies and project management frameworks."
    }
  },
  "Electrical & Electronics": {
    "Circuit Analysis": {
      topics: ["Ohm's Law","Kirchhoff's Laws","Thevenin's Theorem","Norton's Theorem","AC Circuit Analysis","RLC Circuits","Network Theorems","Power Analysis","Transient Analysis","Frequency Response"],
      desc: "Analysis of electrical circuits using fundamental laws and theorems."
    },
    "Digital Logic": {
      topics: ["Boolean Algebra","Logic Gates","Combinational Circuits","Sequential Circuits","Flip-Flops","Counters & Registers","Multiplexers","ALU Design","Finite State Machines","Memory Units"],
      desc: "Design and analysis of digital electronic circuits and systems."
    },
    "Microcontrollers & Embedded Systems": {
      topics: ["Microcontroller Architecture","GPIO Programming","Interrupts","Timers & Counters","ADC/DAC","Serial Communication","I2C & SPI","RTOS Basics","Embedded C","Sensor Interfacing"],
      desc: "Programming and design of embedded computing systems."
    },
    "Signal Processing": {
      topics: ["Signals & Systems","Fourier Transform","Laplace Transform","Z-Transform","Sampling Theorem","Digital Filters","Convolution","Modulation Techniques","Spectral Analysis","DSP Applications"],
      desc: "Analysis, modification, and synthesis of signals."
    },
    "Control Systems": {
      topics: ["Open & Closed Loop Systems","Transfer Functions","Block Diagrams","Stability Analysis","Routh-Hurwitz Criterion","Root Locus","Bode Plots","Nyquist Criterion","PID Controllers","State Space Analysis"],
      desc: "Engineering discipline dealing with system behavior and feedback."
    }
  },
  "Mechanical & Civil": {
    "Thermodynamics": {
      topics: ["Laws of Thermodynamics","Entropy","Carnot Cycle","Heat Engines","Refrigeration Cycles","Properties of Pure Substances","Gas Mixtures","Psychrometry","Combustion","Energy Balance"],
      desc: "Study of energy, heat, work, and their transformations."
    },
    "Materials Science": {
      topics: ["Atomic Structure","Crystal Systems","Phase Diagrams","Mechanical Properties","Heat Treatment","Corrosion","Polymers","Ceramics","Composites","Material Selection"],
      desc: "Study of material properties and their engineering applications."
    },
    "Fluid Mechanics": {
      topics: ["Fluid Properties","Hydrostatics","Bernoulli's Equation","Viscous Flow","Reynolds Number","Boundary Layer Theory","Pipe Flow","Open Channel Flow","Dimensional Analysis","Fluid Machinery"],
      desc: "Study of fluids at rest and in motion."
    },
    "Structural Analysis": {
      topics: ["Stress & Strain","Bending Moments","Shear Force Diagrams","Deflection of Beams","Trusses","Columns & Struts","Influence Lines","Matrix Methods","Finite Element Basics","Structural Stability"],
      desc: "Analysis of forces and deformations in structures."
    },
    "CAD Fundamentals": {
      topics: ["2D Drafting","3D Modeling","Assembly Design","Engineering Drawings","Dimensioning & Tolerancing","Surface Modeling","Parametric Design","Rendering","Simulation Basics","CAD/CAM Integration"],
      desc: "Computer-aided design principles and practices."
    }
  },
  "Aptitude & Reasoning": {
    "Quantitative Aptitude": {
      topics: ["Number Systems","Percentages","Profit & Loss","Time & Work","Time, Speed & Distance","Ratio & Proportion","Averages","Simple & Compound Interest","Permutations & Combinations","Probability"],
      desc: "Mathematical problem-solving skills for competitive exams."
    },
    "Logical Reasoning": {
      topics: ["Syllogisms","Blood Relations","Coding-Decoding","Direction Sense","Seating Arrangement","Puzzles","Analogies","Series Completion","Venn Diagrams","Statement & Assumptions"],
      desc: "Analytical thinking and logical problem-solving."
    },
    "Verbal Communication": {
      topics: ["Reading Comprehension","Vocabulary Building","Grammar Rules","Sentence Correction","Para Jumbles","Idioms & Phrases","Active & Passive Voice","Direct & Indirect Speech","Precis Writing","Formal Communication"],
      desc: "English language and communication skills."
    },
    "Data Interpretation": {
      topics: ["Bar Graphs","Pie Charts","Line Graphs","Tables","Caselets","Mixed Charts","Data Sufficiency","Data Comparison","Percentage Analysis","Growth Rate Calculations"],
      desc: "Analyzing and interpreting data from various visual formats."
    }
  },
  "Business & Management": {
    "Financial Accounting": {
      topics: ["Accounting Principles","Journal Entries","Ledger & Trial Balance","Financial Statements","Depreciation","Ratio Analysis","Cash Flow Statement","Cost Accounting","Budgeting","Taxation Basics"],
      desc: "Recording, summarizing, and reporting financial transactions."
    },
    "Marketing": {
      topics: ["Marketing Mix (4Ps)","Market Segmentation","Consumer Behavior","Brand Management","Digital Marketing","SWOT Analysis","Pricing Strategies","Distribution Channels","Advertising","Market Research"],
      desc: "Strategies for promoting and selling products or services."
    },
    "Operations & Supply Chain": {
      topics: ["Production Planning","Inventory Management","Quality Control","Lean Manufacturing","Six Sigma","Supply Chain Design","Logistics","Procurement","Demand Forecasting","ERP Systems"],
      desc: "Management of production processes and supply networks."
    },
    "Business Strategy": {
      topics: ["Porter's Five Forces","PESTEL Analysis","Competitive Advantage","BCG Matrix","Ansoff Matrix","Blue Ocean Strategy","Strategic Planning","Corporate Governance","Mergers & Acquisitions","Business Model Canvas"],
      desc: "Formulating and implementing organizational strategies."
    },
    "Corporate Ethics": {
      topics: ["Ethical Theories","CSR","Corporate Governance","Whistleblowing","Stakeholder Theory","Business Ethics Frameworks","Environmental Ethics","Workplace Ethics","Code of Conduct","Ethical Decision Making"],
      desc: "Moral principles governing business conduct."
    }
  }
};

function genHTML(skill, data, difficulty, noteNum) {
  const d = difficulty;
  const levelLabel = d === 'beginner' ? 'Introduction & Fundamentals' : d === 'intermediate' ? 'Core Concepts & Applications' : 'Advanced Topics & Problem Solving';
  const startIdx = d === 'beginner' ? 0 : d === 'intermediate' ? 3 : 6;
  const topics = data.topics.slice(startIdx, startIdx + (d === 'advanced' ? 4 : 3));
  if (topics.length === 0) topics.push(...data.topics.slice(0, 3));

  let sections = topics.map((t, i) => {
    const examples = d === 'beginner'
      ? `<p>A simple way to understand <strong>${t}</strong> is to think of real-world analogies. For instance, consider how everyday systems use similar principles. This foundational knowledge is essential before moving to more complex topics.</p><ul><li>Definition and basic terminology</li><li>Why ${t} matters in ${skill}</li><li>Common misconceptions to avoid</li><li>Practical everyday examples</li></ul>`
      : d === 'intermediate'
      ? `<p><strong>${t}</strong> builds on foundational knowledge and introduces practical application patterns. Understanding these concepts is crucial for solving real engineering and interview problems.</p><ul><li>Working mechanisms and internal processes</li><li>Key formulas and relationships</li><li>Common problem-solving patterns</li><li>Industry applications and case studies</li></ul><blockquote><strong>Pro Tip:</strong> Practice solving at least 5 problems on ${t} to build intuition before moving to advanced topics.</blockquote>`
      : `<p>At the advanced level, <strong>${t}</strong> requires deep analytical thinking and the ability to combine multiple concepts. These topics frequently appear in technical interviews at top companies.</p><ul><li>Complex problem decomposition strategies</li><li>Optimization techniques and trade-offs</li><li>Edge cases and corner scenarios</li><li>Research frontiers and emerging trends</li></ul><div class="warning-box"><strong>⚠ Interview Alert:</strong> ${t} is a high-frequency topic in FAANG interviews. Be prepared to explain both theory and implementation.</div>`;
    return `<h2>${i + 1}. ${t}</h2>${examples}`;
  }).join('<hr/>');

  const keyConceptsHTML = data.topics.slice(0, 5).map(t => `<li><strong>${t}</strong></li>`).join('');

  return `<h1>${skill} — ${levelLabel}</h1>
<p><em>${data.desc}</em></p>
<div class="key-concept"><h3>📚 Key Concepts Covered</h3><ul>${keyConceptsHTML}</ul></div>
<hr/>
${sections}
<hr/>
<h2>📝 Summary & Key Takeaways</h2>
<ul>
<li>Understanding ${skill} is essential for both academic success and technical interviews.</li>
<li>Focus on building strong fundamentals before attempting advanced problems.</li>
<li>Practice with real-world examples and coding challenges to reinforce learning.</li>
<li>Review these notes regularly and supplement with hands-on projects.</li>
</ul>
<div class="tip-box"><strong>💡 Next Steps:</strong> After mastering these concepts, explore related topics and attempt mock interview questions on ${skill} to test your understanding.</div>`;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Note.deleteMany({});
  console.log('Cleared old notes');

  const notes = [];
  const diffs = ['beginner', 'intermediate', 'advanced'];

  for (const [cat, skills] of Object.entries(SKILLS)) {
    for (const [skill, data] of Object.entries(skills)) {
      for (let i = 0; i < 3; i++) {
        const d = diffs[i];
        notes.push({
          noteId: uuidv4(),
          title: `${skill} — ${d === 'beginner' ? 'Fundamentals' : d === 'intermediate' ? 'Core Concepts' : 'Advanced Guide'}`,
          category: cat,
          subSkill: skill,
          summary: `${d.charAt(0).toUpperCase() + d.slice(1)} level study notes covering ${data.desc.toLowerCase()} Ideal for interview preparation.`,
          content: genHTML(skill, data, d, i + 1),
          difficulty: d,
          readTimeMinutes: d === 'beginner' ? 8 : d === 'intermediate' ? 12 : 18,
          tags: [skill.toLowerCase().replace(/ /g, '-'), 'study-material', 'interview-prep', d]
        });
      }
    }
  }

  await Note.insertMany(notes);
  console.log(`Seeded ${notes.length} real HTML notes!`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
