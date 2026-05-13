import axios from 'axios';

const testAPI = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/question-bank/questions');
    const questions = response.data.data;
    console.log('Total Questions from API:', questions.length);
    if (questions.length > 0) {
      console.log('First Question:', questions[0].question);
    }
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
};

testAPI();
