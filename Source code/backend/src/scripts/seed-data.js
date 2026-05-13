import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Company from '../models/Company.model.js';
import Job from '../models/Job.model.js';
import User from '../models/User.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const companies = [
  {
    name: 'Google',
    slug: 'google',
    industry: 'Information Technology',
    description: 'Google LLC is an American multinational technology company that specializes in Internet-related services and products.',
    shortDescription: 'Global leader in search and cloud computing.',
    website: 'https://google.com',
    headquarters: { city: 'Mountain View', state: 'California', country: 'USA' },
    companySize: '5000+',
    companyType: 'MNC',
    foundedYear: 1998,
    hiringStatus: 'actively_hiring',
    followerCount: 1250000,
    ratings: { overall: 4.5, culture: 4.6, salaryBenefits: 4.4, careerGrowth: 4.3 },
    techStack: ['Go', 'Python', 'C++', 'Java', 'Angular', 'TensorFlow'],
    benefits: ['Free Meals', 'Health Insurance', 'Remote Work', 'Education Allowance'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png',
    status: 'approved'
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    industry: 'Software Development',
    description: 'Microsoft Corporation is an American multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services.',
    shortDescription: 'Empowering every person and organization on the planet.',
    website: 'https://microsoft.com',
    headquarters: { city: 'Redmond', state: 'Washington', country: 'USA' },
    companySize: '5000+',
    companyType: 'MNC',
    foundedYear: 1975,
    hiringStatus: 'actively_hiring',
    followerCount: 980000,
    ratings: { overall: 4.4, culture: 4.3, salaryBenefits: 4.2, careerGrowth: 4.5 },
    techStack: ['C#', '.NET', 'TypeScript', 'Azure', 'React', 'SQL Server'],
    benefits: ['Stock Options', 'Health Care', 'Parental Leave', 'Gym Membership'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1024px-Microsoft_logo.svg.png',
    status: 'approved'
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    industry: 'E-commerce',
    description: 'Amazon.com, Inc. is an American multinational technology company which focuses on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
    shortDescription: 'Earth\'s most customer-centric company.',
    website: 'https://amazon.com',
    headquarters: { city: 'Seattle', state: 'Washington', country: 'USA' },
    companySize: '5000+',
    companyType: 'MNC',
    foundedYear: 1994,
    hiringStatus: 'actively_hiring',
    followerCount: 1500000,
    ratings: { overall: 4.0, culture: 3.8, salaryBenefits: 4.5, careerGrowth: 4.2 },
    techStack: ['Java', 'C++', 'AWS', 'React', 'Python', 'DynamoDB'],
    benefits: ['Relocation Bonus', 'RSUs', 'Insurance', 'Pet Friendly'],
    logo: 'https://cdn4.auth0.com/marketplace/catalog/content/assets/creators/amazon/amazon-logo.png',
    status: 'approved'
  },
  {
    name: 'Meta',
    slug: 'meta',
    industry: 'Software Development',
    description: 'Meta Platforms, Inc., doing business as Meta and formerly named Facebook, Inc., is an American multinational technology conglomerate.',
    shortDescription: 'Building the future of social connection.',
    website: 'https://meta.com',
    headquarters: { city: 'Menlo Park', state: 'California', country: 'USA' },
    companySize: '5000+',
    companyType: 'MNC',
    foundedYear: 2004,
    hiringStatus: 'actively_hiring',
    followerCount: 850000,
    ratings: { overall: 4.2, culture: 4.1, salaryBenefits: 4.6, careerGrowth: 4.4 },
    techStack: ['React', 'PyTorch', 'PHP', 'Hack', 'MySQL', 'Rust'],
    benefits: ['Competitive Pay', 'Wellness Days', 'Food Credits', 'On-site Gym'],
    logo: 'https://static.wikia.nocookie.net/logopedia/images/7/7b/Meta_Platforms_Inc._logo.svg/revision/latest?cb=20211028191242',
    status: 'approved'
  },
  {
    name: 'Netflix',
    slug: 'netflix',
    industry: 'Media & Entertainment',
    description: 'Netflix, Inc. is an American subscription streaming service and production company.',
    shortDescription: 'Entertaining the world with great stories.',
    website: 'https://netflix.com',
    headquarters: { city: 'Los Gatos', state: 'California', country: 'USA' },
    companySize: '5000+',
    companyType: 'MNC',
    foundedYear: 1997,
    hiringStatus: 'actively_hiring',
    followerCount: 600000,
    ratings: { overall: 4.3, culture: 4.5, salaryBenefits: 4.7, careerGrowth: 4.1 },
    techStack: ['Java', 'React', 'Node.js', 'AWS', 'Kafka', 'Cassandra'],
    benefits: ['Top Tier Pay', 'Unlimited PTO', 'Health Insurance', 'Flexible Work'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1024px-Netflix_2015_logo.svg.png',
    status: 'approved'
  }
];


const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found in .env');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find an admin user to assign as poster
    let admin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
    if (!admin) {
      console.log('No admin found, creating a system admin...');
      admin = await User.create({
        fullName: 'System Admin',
        email: 'admin@prepzo.ai',
        password: 'AdminPassword123!',
        role: 'admin',
        isOnboarded: true
      });
    }

    // Clear existing data (optional, but good for consistent seeding)
    await Company.deleteMany({});
    await Job.deleteMany({});

    // Bulk create companies
    const createdCompanies = await Company.insertMany(companies);
    console.log(`Seeded ${createdCompanies.length} companies`);

    const jobs = [
      {
        title: 'Senior Software Engineer (Frontend)',
        company: createdCompanies[0]._id, // Google
        description: 'We are looking for a Senior Frontend Engineer to join our Search team. You will be responsible for building high-performance user interfaces.',
        jobType: 'full_time',
        workMode: 'hybrid',
        experienceLevel: 'senior',
        experienceRequired: { min: 5, max: 10 },
        requiredSkills: [
          { skill: 'React', importance: 'required' },
          { skill: 'TypeScript', importance: 'required' },
          { skill: 'CSS/Tailwind', importance: 'preferred' }
        ],
        salary: { min: 4500000, max: 7500000, currency: 'INR', period: 'yearly' },
        locations: [{ city: 'Bangalore', state: 'Karnataka', country: 'India' }],
        roleCategory: 'Frontend Developer',
        department: 'Engineering',
        status: 'active',
        isApproved: true,
        postedBy: admin._id,
        isFeatured: true
      },
      {
        title: 'Backend Developer (Node.js)',
        company: createdCompanies[4]._id, // Netflix
        description: 'Join the Netflix content delivery team. Build scalable microservices that serve millions of concurrent users.',
        jobType: 'full_time',
        workMode: 'remote',
        experienceLevel: 'mid',
        experienceRequired: { min: 3, max: 6 },
        requiredSkills: [
          { skill: 'Node.js', importance: 'required' },
          { skill: 'Java', importance: 'required' },
          { skill: 'AWS', importance: 'preferred' }
        ],
        salary: { min: 4000000, max: 6500000, currency: 'INR', period: 'yearly' },
        locations: [{ city: 'Remote', country: 'India' }],
        roleCategory: 'Backend Developer',
        department: 'Engineering',
        status: 'active',
        isApproved: true,
        postedBy: admin._id,
        isUrgent: true
      },
      {
        title: 'Data Scientist',
        company: createdCompanies[3]._id, // Meta
        description: 'Work on cutting-edge ML models for content recommendation and ranking.',
        jobType: 'full_time',
        workMode: 'onsite',
        experienceLevel: 'entry',
        experienceRequired: { min: 1, max: 3 },
        requiredSkills: [
          { skill: 'Python', importance: 'required' },
          { skill: 'PyTorch', importance: 'required' },
          { skill: 'SQL', importance: 'required' }
        ],
        salary: { min: 3000000, max: 5000000, currency: 'INR', period: 'yearly' },
        locations: [{ city: 'Hyderabad', state: 'Telangana', country: 'India' }],
        roleCategory: 'Data Scientist',
        department: 'Data Science',
        status: 'active',
        isApproved: true,
        postedBy: admin._id
      },
      {
        title: 'Full Stack Intern',
        company: createdCompanies[1]._id, // Microsoft
        description: 'Great opportunity for students to learn from world-class engineers.',
        jobType: 'internship',
        workMode: 'hybrid',
        experienceLevel: 'fresher',
        experienceRequired: { min: 0, max: 1 },
        requiredSkills: [
          { skill: 'JavaScript', importance: 'required' },
          { skill: 'C#', importance: 'preferred' }
        ],
        salary: { min: 50000, max: 80000, currency: 'INR', period: 'monthly' },
        locations: [{ city: 'Bangalore', state: 'Karnataka', country: 'India' }],
        roleCategory: 'Full Stack Developer',
        department: 'Engineering',
        status: 'active',
        isApproved: true,
        postedBy: admin._id
      },
      {
        title: 'Cloud Solutions Architect',
        company: createdCompanies[2]._id, // Amazon
        description: 'Help our customers build scalable solutions on AWS.',
        jobType: 'full_time',
        workMode: 'hybrid',
        experienceLevel: 'lead',
        experienceRequired: { min: 8, max: 15 },
        requiredSkills: [
          { skill: 'AWS', importance: 'required' },
          { skill: 'Architecture', importance: 'required' }
        ],
        salary: { min: 6000000, max: 10000000, currency: 'INR', period: 'yearly' },
        locations: [{ city: 'Mumbai', state: 'Maharashtra', country: 'India' }],
        roleCategory: 'Cloud Engineer',
        department: 'Engineering',
        status: 'active',
        isApproved: true,
        postedBy: admin._id,
        isFeatured: true
      }
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log(`Seeded ${createdJobs.length} jobs`);

    // Update company job counts
    for (const comp of createdCompanies) {
      const count = await Job.countDocuments({ company: comp._id });
      await Company.findByIdAndUpdate(comp._id, { jobCount: count });
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
