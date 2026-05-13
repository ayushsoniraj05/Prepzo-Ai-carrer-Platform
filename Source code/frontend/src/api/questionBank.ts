import API from './axios';

export interface InterviewQuestion {
  _id: string;
  questionId: string;
  category: string;
  subSkill: string;
  question: string;
  answer: string;
  difficulty: string;
  keywords: string[];
}

export interface CategoryData {
  category: string;
  subSkills: string[];
}

export const getCategories = async (): Promise<{ data: CategoryData[], totalQuestions: number }> => {
  const response = await API.get(`/question-bank/categories?t=${Date.now()}`);
  console.log('Full getCategories Response:', response);
  return {
    data: response.data.data,
    totalQuestions: response.data.totalQuestions
  };
};

export const getQuestions = async (params: {
  category?: string;
  subSkill?: string;
  difficulty?: string;
  search?: string;
  limit?: number;
}): Promise<InterviewQuestion[]> => {
  const response = await API.get(`/question-bank/questions?t=${Date.now()}`, { params });
  return response.data.data;
};
