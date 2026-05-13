import axios from 'axios';

const testAPI = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/question-bank/categories');
    console.log('Categories Response:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
};

testAPI();
