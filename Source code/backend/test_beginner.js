import axios from 'axios';

const testAPI = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/question-bank/questions', {
      params: { difficulty: 'beginner' }
    });
    const questions = response.data.data;
    console.log('Total Questions (beginner):', questions.length);
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
};

testAPI();
