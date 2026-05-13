import axios from 'axios';

const testSearch = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/jobs');
    console.log('Jobs received:', res.data.data.jobs.length);
    console.log('Sample job:', res.data.data.jobs[0]?.title);
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
};

testSearch();
