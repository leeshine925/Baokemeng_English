
import { Grade, Pokemon, Word } from './types';

export const POKEMON_DATA: Pokemon[] = [
  { id: 1, name: '妙蛙种子', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', price: 100, rarity: 'Common' },
  { id: 4, name: '小火龙', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', price: 120, rarity: 'Common' },
  { id: 7, name: '杰尼龟', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', price: 110, rarity: 'Common' },
  { id: 25, name: '皮卡丘', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', price: 300, rarity: 'Rare' },
  { id: 133, name: '伊布', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', price: 250, rarity: 'Rare' },
  { id: 150, name: '超梦', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', price: 1000, rarity: 'Legendary' },
  { id: 149, name: '快龙', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png', price: 800, rarity: 'Epic' },
  { id: 94, name: '耿鬼', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png', price: 400, rarity: 'Rare' },
  { id: 39, name: '胖丁', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png', price: 150, rarity: 'Common' },
  { id: 54, name: '可达鸭', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png', price: 130, rarity: 'Common' }
];

// 为每个年级定义 25 个单词，确保 5 个关卡内容不重复
const generateWords = (grade: Grade, prefix: string): Word[] => {
  const words = [
    ['apple', '苹果'], ['banana', '香蕉'], ['cat', '猫'], ['dog', '狗'], ['egg', '鸡蛋'],
    ['fish', '鱼'], ['girl', '女孩'], ['hand', '手'], ['ice', '冰'], ['juice', '果汁'],
    ['kite', '风筝'], ['lion', '狮子'], ['milk', '牛奶'], ['nose', '鼻子'], ['orange', '橙子'],
    ['pear', '梨'], ['queen', '皇后'], ['rabbit', '兔子'], ['sun', '太阳'], ['tiger', '老虎'],
    ['umbrella', '雨伞'], ['vase', '花瓶'], ['water', '水'], ['box', '盒子'], ['yellow', '黄色']
  ];
  
  // 针对不同年级微调一下显示（实际应用中应由专业的教学大纲提供）
  return words.map((w, i) => ({
    id: `${prefix}-${i}`,
    english: grade === Grade.G1 ? w[0] : `${prefix.toLowerCase()}_${w[0]}`, 
    chinese: w[1],
    grade
  }));
};

export const VOCABULARY: Word[] = [
  ...generateWords(Grade.G1, 'G1'),
  ...generateWords(Grade.G2, 'G2'),
  ...generateWords(Grade.G3, 'G3'),
  ...generateWords(Grade.G4, 'G4'),
  ...generateWords(Grade.G5, 'G5'),
  ...generateWords(Grade.G6, 'G6'),
];

export const APP_THEME = {
  primary: '#58cc02', // Duolingo Green
  secondary: '#1cb0f6', // Duolingo Blue
  accent: '#ffc800', // Duolingo Yellow
  error: '#ff4b4b', // Duolingo Red
  text: '#4b4b4b'
};
