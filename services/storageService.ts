
import { UserState, Grade } from '../types';

const STORAGE_KEY = 'pokemon_english_app_v1';

const INITIAL_STATE: UserState = {
  points: 0,
  currentGrade: Grade.G1,
  gradeProgress: {
    '一年级': 0,
    '二年级': 0,
    '三年级': 0,
    '四年级': 0,
    '五年级': 0,
    '六年级': 0
  },
  collection: [],
  wrongAnswers: [],
  completedWords: []
};

export const storageService = {
  getUserState: (): UserState => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_STATE;
  },
  saveUserState: (state: UserState): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};
