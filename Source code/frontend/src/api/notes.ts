import API from './axios';

export interface Note {
  _id: string;
  noteId: string;
  title: string;
  category: string;
  subSkill: string;
  summary: string;
  content: string; // Will store the PDF URL
  difficulty: string;
  readTimeMinutes: number;
  tags: string[];
  createdAt: string;
}

export interface NoteCategoryData {
  category: string;
  subSkills: { name: string; noteCount: number }[];
  totalNotes: number;
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'note';
  pageNumber: number;
  rects: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  }[];
  color: string;
  content?: string;
  comment?: string;
  createdAt?: string;
}

export const getNoteCategories = async (): Promise<{ data: NoteCategoryData[], totalNotes: number }> => {
  const response = await API.get(`/notes/categories?t=${Date.now()}`);
  return {
    data: response.data.data,
    totalNotes: response.data.totalNotes
  };
};

export const getNotes = async (params: {
  category?: string;
  subSkill?: string;
  difficulty?: string;
  search?: string;
}): Promise<Note[]> => {
  const response = await API.get(`/notes?t=${Date.now()}`, { params });
  return response.data.data;
};

export const getNoteById = async (noteId: string): Promise<Note> => {
  const response = await API.get(`/notes/${noteId}?t=${Date.now()}`);
  return response.data.data;
};

export const getNoteAnnotations = async (noteId: string): Promise<Annotation[]> => {
  const response = await API.get(`/notes/${noteId}/annotations?t=${Date.now()}`);
  return response.data.data;
};

export const saveNoteAnnotations = async (noteId: string, annotations: Annotation[]): Promise<Annotation[]> => {
  const response = await API.post(`/notes/${noteId}/annotations`, { annotations });
  return response.data.data;
};
