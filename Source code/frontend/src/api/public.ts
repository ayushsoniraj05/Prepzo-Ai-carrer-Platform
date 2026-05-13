import api from './axios';

export interface PublicStats {
  students: number;
  jobs: number;
  companies: number;
  assessments: number;
  readinessSignal: number;
  mentorGuidance: string;
}

export const getPublicStats = async (): Promise<PublicStats> => {
  const response = await api.get('/public/stats');
  return response.data;
};
