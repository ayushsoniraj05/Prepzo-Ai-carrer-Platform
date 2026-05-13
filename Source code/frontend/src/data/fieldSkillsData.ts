export const fieldSkillsMap: Record<string, string[]> = {
  'Computer Science': [
    'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 
    'System Design', 'React.js', 'Node.js', 'Python', 'Java', 'C++', 'Cloud Computing', 
    'AWS', 'Docker', 'Kubernetes', 'Cybersecurity', 'Machine Learning', 'Data Science',
    'Version Control (Git)', 'Web Development', 'Mobile App Development', 'DevOps'
  ],
  'Electronics': [
    'Digital Electronics', 'Analog Circuits', 'Microprocessors', 'VLSI Design', 
    'Signal Processing', 'Control Systems', 'Embedded Systems', 'Electromagnetics',
    'Circuit Theory', 'Semiconductor Devices', 'Verilog/VHDL', 'PCB Design',
    'Robotics', 'IoT (Internet of Things)', 'Communication Systems',
    'FPGA Design', 'Microcontrollers (ATMEL, PIC, ARM)', 'Antenna Theory',
    'Power Electronics', 'Micro-Electro-Mechanical Systems (MEMS)'
  ],
  'Mechanical': [
    'Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Machine Design', 
    'Manufacturing Processes', 'Heat Transfer', 'AutoCAD', 'SolidWorks', 'Robotics',
    'Automobile Engineering', 'Industrial Engineering', 'Finite Element Analysis',
    'HVAC Systems', 'Material Science', 'Kinematics of Machines'
  ],
  'Civil': [
    'Structural Analysis', 'Geotechnical Engineering', 'Surveying', 'Hydraulics', 
    'Concrete Technology', 'Steel Structures', 'Construction Management', 'AutoCAD Civil 3D',
    'Transportation Engineering', 'Environmental Engineering', 'Project Management',
    'Estimating and Costing', 'Building Materials', 'Revit', 'GIS & Remote Sensing'
  ],
  'Electrical': [
    'Power Systems', 'Electrical Machines', 'Control Systems', 'Power Electronics',
    'Circuit Theory', 'Electromagnetics', 'Signal Processing', 'Network Analysis',
    'Renewable Energy', 'High Voltage Engineering', 'Electrical Measurements',
    'Smart Grids', 'Electric Vehicles', 'Microcontrollers'
  ],
  'Chemical': [
    'Mass Transfer', 'Heat Transfer', 'Fluid Mechanics', 'Thermodynamics', 
    'Chemical Reaction Engineering', 'Process Control', 'Plant Design', 
    'Material and Energy Balance', 'Organic Chemistry', 'Catalysis', 'Safe Operations'
  ],
  'Management': [
    'Strategic Management', 'Marketing Management', 'Financial Accounting', 
    'Human Resource Management', 'Operations Management', 'Business Analytics', 
    'Entrepreneurship', 'Supply Chain Management', 'Project Management', 
    'Consumer Behavior', 'Business Ethics', 'Corporate Finance', 'Investment Banking'
  ],
  'Commerce': [
    'Financial Accounting', 'Corporate Law', 'Cost Accounting', 'Income Tax', 
    'Auditing', 'Business Economics', 'Financial Modeling', 'Banking Operations',
    'Stock Market Analysis', 'GST and Indirect Taxes', 'Corporate Finance',
    'Business Mathematics', 'Statistics', 'Tally Prime'
  ],
  'Science': [
    'Research Methodology', 'Data Analysis', 'Laboratory Techniques', 'Scientific Writing',
    'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Microbiology', 'Biotechnology',
    'Environmental Science', 'Statistics', 'Genetic Engineering', 'Neuroscience'
  ],
  'Arts': [
    'Creative Writing', 'Public Speaking', 'Critical Thinking', 'Sociology', 
    'Psychology', 'Literature Analysis', 'Media Studies', 'Digital Humanities',
    'Fine Arts', 'Historical Analysis', 'Political Science', 'Philosophy',
    'Geography', 'Linguistics', 'Cultural Studies'
  ],
  'Design': [
    'UI/UX Design', 'Graphic Design', 'Figma', 'Adobe Creative Suite', 
    'Design Thinking', 'Visual Communication', 'Product Design', 'Interior Design',
    'Typography', 'Color Theory', 'Prototyping', 'User Research', 'Interaction Design'
  ],
  'Law': [
    'Constitutional Law', 'Criminal Law', 'Corporate Law', 'Family Law', 
    'Intellectual Property Rights', 'Labor Law', 'Legal Writing', 'Court Procedures',
    'Human Rights', 'Environmental Law', 'Cyber Law', 'International Law'
  ],
  'Medical': [
    'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 
    'Microbiology', 'Internal Medicine', 'Surgery', 'Pediatrics', 'Forensic Medicine',
    'Community Medicine', 'Obstetrics and Gynecology', 'Patient Care'
  ],
  'Pharmacy': [
    'Pharmaceutics', 'Pharmaceutical Chemistry', 'Pharmacognosy', 'Pharmacology', 
    'Pharmaceutical Analysis', 'Biopharmaceutics', 'Drug Discovery', 'Clinical Pharmacy',
    'Cosmetology', 'Regulatory Affairs', 'Hospital Pharmacy'
  ],
  'Soft Skills': [
    'Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Time Management', 
    'Adaptability', 'Emotional Intelligence', 'Decision Making', 'Conflict Resolution',
    'Negotiation', 'Critical Thinking', 'Creativity', 'Networking'
  ],
  'Non-Tech': [
    'Content Writing', 'Digital Marketing', 'Social Media Management', 'Customer Relationship Management',
    'Public Relations', 'Venture Capital', 'Event Management', 'Supply Chain Operations',
    'Recruitment', 'Salesmanship', 'Logistics', 'Content Strategy',
    'Product Management', 'Strategy Consulting', 'Financial Analysis',
    'Business Development', 'Operations Management', 'Market Research',
    'Agile Methodologies', 'Scrum', 'Stakeholder Management'
  ]
};

export const softSkills = [
  'Communication', 
  'Teamwork', 
  'Leadership', 
  'Time Management', 
  'Critical Thinking', 
  'Problem Solving', 
  'Adaptability',
  'Interpersonal Skills',
  'Emotional Intelligence',
  'Conflict Resolution'
];

export const getMappedField = (field: string) => {
  const f = (field || '').toLowerCase();
  
  if (f.includes('computer') || f.includes('software') || f.includes('it') || f.includes('info') || f.includes('bca') || f.includes('mca')) return 'Computer Science';
  if (f.includes('electronics') || f.includes('ece') || f.includes('eee') || f.includes('instrumentation')) return 'Electronics';
  if (f.includes('mechanical') || f.includes('mech') || f.includes('automobile') || f.includes('robotics')) return 'Mechanical';
  if (f.includes('civil') || f.includes('structural') || f.includes('construction')) return 'Civil';
  if (f.includes('electrical') || f.includes('power') || f.includes('electric')) return 'Electrical';
  if (f.includes('chemical')) return 'Chemical';
  if (f.includes('manage') || f.includes('business') || f.includes('bba') || f.includes('mba') || f.includes('pgdm')) return 'Management';
  if (f.includes('commer') || f.includes('bcom') || f.includes('account') || f.includes('tax')) return 'Commerce';
  if (f.includes('science') || f.includes('bsc') || f.includes('msc') || f.includes('physic') || f.includes('math')) return 'Science';
  if (f.includes('art') || f.includes('human') || f.includes('ba ') || f.includes('journalism') || f.includes('writing')) return 'Arts';
  if (f.includes('design') || f.includes('fashion') || f.includes('ui') || f.includes('ux')) return 'Design';
  if (f.includes('law') || f.includes('llb')) return 'Law';
  if (f.includes('medical') || f.includes('mbbs') || f.includes('dental') || f.includes('bds')) return 'Medical';
  if (f.includes('pharm')) return 'Pharmacy';
  
  return 'Computer Science';
};
