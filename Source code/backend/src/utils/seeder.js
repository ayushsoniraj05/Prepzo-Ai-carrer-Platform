import Company from '../models/Company.model.js';
import Job from '../models/Job.model.js';

export const runSeeder = async () => {
  const companiesData = [
    {
      name: 'Google',
      slug: 'google',
      industry: 'Product Based',
      website: 'https://careers.google.com',
      description: 'Global leader in search, advertising, and cloud computing.',
      hiringStatus: 'actively_hiring',
      status: 'approved',
      headquarters: { city: 'Mountain View' },
      techStack: ['Python', 'Go', 'Java', 'C++', 'TensorFlow'],
      isFeatured: true
    },
    {
      name: 'Amazon',
      slug: 'amazon',
      industry: 'Product Based',
      website: 'https://amazon.jobs',
      description: 'E-commerce and cloud computing giant.',
      hiringStatus: 'actively_hiring',
      status: 'approved',
      headquarters: { city: 'Seattle' },
      techStack: ['Java', 'C++', 'Python', 'AWS', 'React'],
      isFeatured: true
    },
    {
      name: 'Microsoft',
      slug: 'microsoft',
      industry: 'Product Based',
      website: 'https://careers.microsoft.com',
      description: 'Leader in software, services, and hardware.',
      hiringStatus: 'actively_hiring',
      status: 'approved',
      headquarters: { city: 'Redmond' },
      techStack: ['C#', 'TypeScript', 'Azure', 'Python', 'React'],
      isFeatured: true
    },
    {
      name: 'TCS',
      slug: 'tcs',
      industry: 'Service Based',
      website: 'https://www.tcs.com/careers',
      description: 'Global IT services, consulting, and business solutions.',
      hiringStatus: 'actively_hiring',
      status: 'approved',
      headquarters: { city: 'Mumbai' },
      techStack: ['Java', 'Python', 'Cloud Computing', 'Big Data'],
      isFeatured: false
    },
    {
      name: 'Infosys',
      slug: 'infosys',
      industry: 'Service Based',
      website: 'https://www.infosys.com/careers',
      description: 'Global leader in next-generation digital services and consulting.',
      hiringStatus: 'actively_hiring',
      status: 'approved',
      headquarters: { city: 'Bangalore' },
      techStack: ['Java', '.NET', 'Cloud', 'Automation'],
      isFeatured: false
    }
  ];

  // Upsert Companies
  const seededCompanies = [];
  for (const data of companiesData) {
    const company = await Company.findOneAndUpdate(
      { slug: data.slug },
      data,
      { upsert: true, new: true }
    );
    seededCompanies.push(company);
  }

  // Jobs Data
  const jobsData = [
    {
      title: 'Software Development Engineer I',
      company: seededCompanies[0]._id, // Google
      description: 'Working on core infrastructure and distributed systems.',
      jobType: 'full-time',
      experienceLevel: 'entry_level',
      salary: { min: 1800000, max: 3500000, currency: 'INR' },
      locations: ['Bangalore', 'Hyderabad'],
      category: 'Software Engineering',
      skills: ['Algorithms', 'Data Structures', 'C++', 'Java'],
      isApproved: true,
      status: 'active'
    },
    {
      title: 'Backend Developer',
      company: seededCompanies[1]._id, // Amazon
      description: 'Building scalable microservices for AWS.',
      jobType: 'full-time',
      experienceLevel: 'junior',
      salary: { min: 1500000, max: 2800000, currency: 'INR' },
      locations: ['Bangalore', 'Pune'],
      category: 'Software Engineering',
      skills: ['Node.js', 'AWS', 'DynamoDB', 'Python'],
      isApproved: true,
      status: 'active'
    },
    {
      title: 'Frontend Engineer (React)',
      company: seededCompanies[2]._id, // Microsoft
      description: 'Crafting premium UI experiences for Office 365.',
      jobType: 'full-time',
      experienceLevel: 'junior',
      salary: { min: 1400000, max: 2600000, currency: 'INR' },
      locations: ['Hyderabad', 'Noida'],
      category: 'Frontend Engineering',
      skills: ['React', 'TypeScript', 'CSS', 'HTML5'],
      isApproved: true,
      status: 'active'
    },
    {
      title: 'Systems Engineer',
      company: seededCompanies[3]._id, // TCS
      description: 'Enterprise level systems management and digital transformation.',
      jobType: 'full-time',
      experienceLevel: 'entry_level',
      salary: { min: 350000, max: 700000, currency: 'INR' },
      locations: ['Chennai', 'Kolkata'],
      category: 'Software Engineering',
      skills: ['Java', 'SQL', 'Unix', 'Python'],
      isApproved: true,
      status: 'active'
    },
    {
      title: 'Digital Specialist Engineer',
      company: seededCompanies[4]._id, // Infosys
      description: 'Working on cutting-edge digital technologies for global clients.',
      jobType: 'full-time',
      experienceLevel: 'entry_level',
      salary: { min: 625000, max: 950000, currency: 'INR' },
      locations: ['Bangalore', 'Mysore', 'Pune'],
      category: 'Software Engineering',
      skills: ['Java', 'Python', 'Cloud', 'Data Science'],
      isApproved: true,
      status: 'active'
    }
  ];

  // Upsert Jobs (based on title and company)
  for (const data of jobsData) {
    await Job.findOneAndUpdate(
      { title: data.title, company: data.company },
      data,
      { upsert: true }
    );
  }

  return {
    companiesCount: seededCompanies.length,
    jobsCount: jobsData.length
  };
};
