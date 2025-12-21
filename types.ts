
export enum Grade {
  G1 = '一年级',
  G2 = '二年级',
  G3 = '三年级',
  G4 = '四年级',
  G5 = '五年级',
  G6 = '六年级'
}

export interface Word {
  id: string;
  english: string;
  chinese: string;
  grade: Grade;
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  price: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface UserState {
  points: number;
  currentGrade: Grade;
  // 记录每个年级当前完成到第几关 (0-5)
  gradeProgress: Record<string, number>;
  collection: Pokemon[];
  wrongAnswers: Word[];
  completedWords: string[]; 
}

export type View = 'home' | 'quiz' | 'store' | 'market' | 'collection' | 'summary' | 'error-correction' | 'draw-result';
