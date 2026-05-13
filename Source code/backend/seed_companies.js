/**
 * Seed Companies from TechUprise Telegram Channel
 * Run: node seed_companies.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Company Schema (inline to avoid import issues)
const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    logo: { type: String, default: null },
    industry: {
      type: String,
      required: true,
      enum: [
        'Information Technology', 'Software Development', 'E-commerce',
        'Finance & Banking', 'Consulting', 'Healthcare', 'Education',
        'Manufacturing', 'Telecommunications', 'Media & Entertainment',
        'Automotive', 'Aerospace', 'Energy', 'Retail', 'Hospitality',
        'Real Estate', 'Other',
      ],
    },
    companyType: {
      type: String,
      enum: ['Product', 'Service', 'Startup', 'MNC', 'Government', 'PSU', 'Other'],
      default: 'Other',
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'],
    },
    description: { type: String },
    tagline: { type: String },
    headquarters: {
      city: String,
      state: String,
      country: { type: String, default: 'India' },
    },
    website: { type: String },
    hiringStatus: {
      type: String,
      enum: ['actively_hiring', 'occasionally_hiring', 'not_hiring'],
      default: 'actively_hiring',
    },
    techStack: [String],
    salaryRange: {
      fresher: { min: Number, max: Number, currency: { type: String, default: 'INR' } },
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    isFeatured: { type: Boolean, default: false },
    followerCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

companySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

const Company = mongoose.model('Company', companySchema);

// ===== COMPANIES DATA (sorted big → small) =====
const companies = [
  // --- 5000+ (MNCs / Large) ---
  {
    name: 'Amazon',
    description: 'Work at the scale of millions — one of the world\'s most customer-centric companies. Currently hiring Associates for quality services operations.',
    industry: 'E-commerce',
    companyType: 'MNC',
    companySize: '5000+',
    headquarters: { city: 'Chennai', country: 'India' },
    website: 'https://www.amazon.jobs/en/jobs/10382918/associate-quality-services-qs-access-point-qs',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 400000, max: 700000 } },
    isFeatured: true,
  },
  {
    name: 'Deloitte',
    description: 'Global consulting & professional services leader. Hiring Associate Analysts for Talent Services / GLAS operations supporting internal systems, data workflows, and global business processes.',
    industry: 'Consulting',
    companyType: 'MNC',
    companySize: '5000+',
    headquarters: { city: 'Hyderabad', country: 'India' },
    website: 'https://usijobs.deloitte.com/en_US/careersUSI/JobDetail/USI-EH26-Enabling-Areas-UK-Executive-Assistant-Support-Associate-Analyst/326470',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 450000, max: 700000 } },
    isFeatured: true,
  },
  {
    name: 'Mastercard',
    description: 'Engineer the technology behind global transactions. Building systems used worldwide for secure digital payments and financial services.',
    industry: 'Finance & Banking',
    companyType: 'MNC',
    companySize: '5000+',
    headquarters: { city: 'Gurgaon', country: 'India' },
    website: 'https://careers.mastercard.com/us/en/job/R-273964/Software-Engineer-R',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 400000, max: 700000 } },
    isFeatured: true,
  },
  {
    name: 'Accenture',
    description: 'Global professional services company providing consulting, technology, and outsourcing services. Hiring IT Customer Service Representatives.',
    industry: 'Consulting',
    companyType: 'MNC',
    companySize: '5000+',
    headquarters: { city: 'Coimbatore', country: 'India' },
    website: 'https://www.accenture.com/in-en/careers/jobdetails?id=14154433_en',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 350000, max: 600000 } },
    isFeatured: true,
  },
  {
    name: 'PwC',
    description: 'Top global consulting firm. Hiring Data Analytics Associates to work with real-world data, solve complex business problems, and build actionable insights.',
    industry: 'Consulting',
    companyType: 'MNC',
    companySize: '5000+',
    headquarters: { city: 'Hyderabad', country: 'India' },
    website: 'https://jobs-ta.pwc.com/global/en/job/712963WD/Cyber-R-R-ER-CS-Data-Analytics-Associate-HYD-BLR-KOL-MUM',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 400000, max: 600000 } },
    isFeatured: true,
  },
  {
    name: 'DHL',
    description: 'World-class IT ecosystem powering global logistics. Hiring Software Engineering Analysts to build systems that power worldwide supply chain operations.',
    industry: 'Information Technology',
    companyType: 'MNC',
    companySize: '5000+',
    headquarters: { city: 'Indore', country: 'India' },
    website: 'https://careers.dhl.com/global/en/job/DPDHGLOBALAV299829ENGLOBALEXTERNAL/Software-Engineering-Analyst',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 400000, max: 600000 } },
  },
  {
    name: 'Genpact',
    description: 'Global professional services firm delivering digital transformation. Hiring Process Associates for business operations roles.',
    industry: 'Consulting',
    companyType: 'MNC',
    companySize: '5000+',
    headquarters: { city: 'Noida', country: 'India' },
    website: 'https://genpact.taleo.net/careersection/sgy_external_career_section/jobdetail.ftl?job=CPG063326',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 300000, max: 500000 } },
  },
  {
    name: 'Johnson Controls',
    description: 'Global leader in smart, connected solutions for modern infrastructure. Hiring Software Engineers to build technology for buildings and smart cities.',
    industry: 'Information Technology',
    companyType: 'MNC',
    companySize: '5000+',
    headquarters: { city: 'Bangalore', country: 'India' },
    website: 'https://jobs.johnsoncontrols.com/job/WD30264663',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 400000, max: 600000 } },
  },
  {
    name: 'Physics Wallah',
    description: 'India\'s fastest-growing edtech platform. Hiring Associates to support operations, student engagement, and business processes across multiple locations.',
    industry: 'Education',
    companyType: 'Product',
    companySize: '5000+',
    headquarters: { city: 'Noida', country: 'India' },
    website: 'https://www.naukri.com/job-listings-associate-pw-noida-srinagar-agartala-vijayawada-nagar-ambala-chennai-gurugram-howrah-0-to-4-years-070426502248',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 360000, max: 500000 } },
  },

  // --- 1001-5000 (Large-Mid) ---
  {
    name: 'PayPal',
    description: 'One of the world\'s most trusted fintech ecosystems. Hiring Associate Analysts for business process roles in global payments operations.',
    industry: 'Finance & Banking',
    companyType: 'MNC',
    companySize: '1001-5000',
    headquarters: { city: 'Bangalore', country: 'India' },
    website: 'https://wd1.myworkdaysite.com/en-US/recruiting/paypal/jobs/job/Bangalore-Karnataka-India/Associate-Analyst--Business-Process_R0135957-1',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 400000, max: 700000 } },
    isFeatured: true,
  },
  {
    name: 'KLA',
    description: 'Advanced semiconductor and precision engineering systems company. Hiring Software Engineers for high-end product engineering in cutting-edge technology.',
    industry: 'Information Technology',
    companyType: 'MNC',
    companySize: '1001-5000',
    headquarters: { city: 'Chennai', country: 'India' },
    website: 'https://kla.wd1.myworkdayjobs.com/en-US/Search/job/Chennai-India/Software-Engineer_2635012',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 700000, max: 1000000 } },
    isFeatured: true,
  },
  {
    name: 'Dexcom Corporation',
    description: 'Global health tech company building real-world medical devices that impact millions. Hiring SW Development Engineers for product engineering.',
    industry: 'Healthcare',
    companyType: 'MNC',
    companySize: '1001-5000',
    headquarters: { city: 'Remote', country: 'India' },
    website: 'https://careers.dexcom.com/careers/job/30778648',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 350000, max: 600000 } },
  },
  {
    name: 'Firstsource',
    description: 'Leading provider of business process outsourcing services. Hiring Analysts for analytics and business operations roles.',
    industry: 'Information Technology',
    companyType: 'Service',
    companySize: '1001-5000',
    headquarters: { city: 'Bengaluru', country: 'India' },
    website: 'https://www.naukri.com/job-listings-analyst-firstsource-solutions-ltd-bengaluru-0-to-3-years-090426502667',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 250000, max: 400000 } },
  },
  {
    name: 'Turing',
    description: 'Global remote hiring platform connecting developers with international companies, especially US-based clients. Offers contract/freelance-style engagements.',
    industry: 'Information Technology',
    companyType: 'Product',
    companySize: '1001-5000',
    headquarters: { city: 'Remote', country: 'India' },
    website: 'https://work.turing.com/job/home?country=India&job_id=33194',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 300000, max: 700000 } },
  },

  // --- 501-1000 (Mid-size) ---
  {
    name: 'Tekion',
    description: 'Cutting-edge automotive retail cloud solutions company. Hiring Software Development Test Engineers for testing scalable software systems and ensuring product quality.',
    industry: 'Software Development',
    companyType: 'Product',
    companySize: '501-1000',
    headquarters: { city: 'Chennai', country: 'India' },
    website: 'https://job-boards.greenhouse.io/tekion/jobs/7627918003',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 350000, max: 600000 } },
  },

  // --- 201-500 (Mid-small) ---
  {
    name: 'MountBlue',
    description: 'Product engineering company helping freshers break into software development with real-world coding experience, debugging, and fast-paced learning.',
    industry: 'Software Development',
    companyType: 'Service',
    companySize: '201-500',
    headquarters: { city: 'Bengaluru', country: 'India' },
    website: 'https://careers.mountblue.io/sde',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 400000, max: 500000 } },
  },
  {
    name: 'PrimEra Medical Technologies',
    description: 'Healthcare technology company focused on ROI analysis, data evaluation, performance tracking, and business decision support through insights and reporting.',
    industry: 'Healthcare',
    companyType: 'Product',
    companySize: '201-500',
    headquarters: { city: 'Bengaluru', country: 'India' },
    website: 'https://www.naukri.com/job-listings-associate-roi-primera-medical-technologies-hyderabad-0-to-3-years-060426501119',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 300000, max: 500000 } },
  },
  {
    name: 'Coriolis Tech',
    description: 'Technology company hiring Data Analysts for SQL/MySQL-based data analysis, business insights, and data-driven decision-making across real-world projects.',
    industry: 'Information Technology',
    companyType: 'Product',
    companySize: '201-500',
    headquarters: { city: 'Hyderabad', country: 'India' },
    website: 'https://www.naukri.com/job-listings-business-analyst-data-analyst-sql-mysql-coriolis-tech-hyderabad-pune-bengaluru-0-to-1-years-110426012670',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 350000, max: 600000 } },
  },
  {
    name: 'Detroit Engineered Products',
    description: 'Core engineering and product development company. Hiring Associate Software Engineers for coding, problem-solving, and building real-world applications.',
    industry: 'Software Development',
    companyType: 'Product',
    companySize: '201-500',
    headquarters: { city: 'Chennai', country: 'India' },
    website: 'https://www.naukri.com/job-listings-associate-software-engineer-detroit-engineered-products-dep-chennai-0-to-0-years-130426027978',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 300000, max: 350000 } },
  },

  // --- 51-200 (Small) ---
  {
    name: 'FlexAI',
    description: 'AI-driven products company building scalable systems. Hiring Software Engineers to develop efficient code and contribute to real-world AI products in a fast-paced tech environment.',
    industry: 'Software Development',
    companyType: 'Startup',
    companySize: '51-200',
    headquarters: { city: 'Bengaluru', country: 'India' },
    website: 'https://www.naukri.com/job-listings-software-engineer-new-grad-flexai-bengaluru-0-to-2-years-060426502186',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 300000, max: 500000 } },
  },
  {
    name: 'ColoredCow',
    description: 'Tech solutions company building impactful projects. Hiring Software Engineers to contribute to real-world development work in a collaborative environment.',
    industry: 'Software Development',
    companyType: 'Startup',
    companySize: '51-200',
    headquarters: { city: 'Gurgaon', country: 'India' },
    website: 'https://www.naukri.com/job-listings-software-engineer-coloredcow-gurugram-0-to-3-years-060426500418',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 225000, max: 450000 } },
  },
  {
    name: 'Fortuna Retail',
    description: 'Retail analytics company. Hiring Data Analysts to work with numbers, spot trends, and build insights for business decisions.',
    industry: 'Retail',
    companyType: 'Other',
    companySize: '51-200',
    headquarters: { city: 'Gurugram', country: 'India' },
    website: 'https://www.naukri.com/job-listings-urgent-requirement-of-data-analyst-fortuna-retail-gurugram-0-to-2-years-060226033540',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 250000, max: 400000 } },
  },

  // --- 11-50 (Small) ---
  {
    name: 'BiCSoM',
    description: 'Digital marketing and web development company. Hiring Web Developers to build modern websites, optimize performance, and work on real-world digital projects.',
    industry: 'Software Development',
    companyType: 'Startup',
    companySize: '11-50',
    headquarters: { city: 'Bengaluru', country: 'India' },
    website: 'https://bicsom.co/jobs/web-developer-fresher/',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 300000, max: 400000 } },
  },
  {
    name: 'American Chase',
    description: 'IT services company. Hiring Associate System Engineers to build and support real-world systems, solve technical problems, and grow in engineering roles.',
    industry: 'Information Technology',
    companyType: 'Service',
    companySize: '11-50',
    headquarters: { city: 'Indore', country: 'India' },
    website: 'https://americanchase.keka.com/careers/jobdetails/88834',
    hiringStatus: 'actively_hiring',
    salaryRange: { fresher: { min: 320000, max: 350000 } },
  },
];

async function seedCompanies() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    let added = 0;
    let skipped = 0;
    let failed = 0;

    for (const data of companies) {
      try {
        // Check if company already exists
        const existing = await Company.findOne({
          name: { $regex: new RegExp(`^${data.name}$`, 'i') },
        });

        if (existing) {
          console.log(`  ⏭️  SKIP: ${data.name} (already exists)`);
          skipped++;
          continue;
        }

        const company = new Company({
          ...data,
          status: 'approved',
          approvedAt: new Date(),
        });
        await company.save();
        console.log(`  ✅ ADDED: ${data.name} (${data.companySize} | ${data.headquarters.city})`);
        added++;
      } catch (err) {
        console.log(`  ❌ FAIL: ${data.name} — ${err.message}`);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Results: ${added} added, ${skipped} skipped, ${failed} failed`);
    console.log('='.repeat(50));

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
}

seedCompanies();
