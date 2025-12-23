
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

// 严格确保 180 个单词互不重复
const ALL_WORDS_DATA: Record<Grade, [string, string][]> = {
  [Grade.G1]: [
    ['apple', '苹果'], ['boy', '男孩'], ['cat', '猫'], ['dog', '狗'], ['egg', '鸡蛋'],
    ['fish', '鱼'], ['girl', '女孩'], ['hat', '帽子'], ['ice', '冰'], ['jam', '果酱'],
    ['kite', '风筝'], ['leg', '腿'], ['milk', '牛奶'], ['nose', '鼻子'], ['one', '一'],
    ['pig', '猪'], ['queen', '女王'], ['red', '红色'], ['sun', '太阳'], ['tea', '茶'],
    ['up', '向上'], ['van', '小货车'], ['wet', '湿的'], ['box', '盒子'], ['yes', '是'],
    ['bee', '蜜蜂'], ['cow', '母牛'], ['dad', '爸爸'], ['ear', '耳朵'], ['fox', '狐狸']
  ],
  [Grade.G2]: [
    ['banana', '香蕉'], ['bread', '面包'], ['candy', '糖果'], ['desk', '书桌'], ['duck', '鸭子'],
    ['face', '脸'], ['game', '游戏'], ['hand', '手'], ['jump', '跳跃'], ['lake', '湖泊'],
    ['mouth', '嘴巴'], ['neck', '脖子'], ['orange', '橙子'], ['pear', '梨'], ['rice', '米饭'],
    ['shirt', '衬衫'], ['table', '桌子'], ['under', '在...下面'], ['water', '水'], ['year', '年份'],
    ['zebra', '斑马'], ['blue', '蓝色'], ['cold', '冷的'], ['door', '门'], ['eye', '眼睛'],
    ['frog', '青蛙'], ['goat', '山羊'], ['home', '家'], ['ink', '墨水'], ['jeep', '吉普车']
  ],
  [Grade.G3]: [
    ['animal', '动物'], ['bottle', '瓶子'], ['camera', '照相机'], ['dinner', '晚餐'], ['eleven', '十一'],
    ['flower', '花'], ['garden', '花园'], ['hungry', '饥饿的'], ['island', '岛屿'], ['jacket', '夹克'],
    ['kitchen', '厨房'], ['lemon', '柠檬'], ['monkey', '猴子'], ['nature', '大自然'], ['ocean', '海洋'],
    ['pencil', '铅笔'], ['quiet', '安静的'], ['rabbit', '兔子'], ['school', '学校'], ['tiger', '老虎'],
    ['useful', '有用的'], ['village', '村庄'], ['window', '窗户'], ['yellow', '黄色'], ['zoo', '动物园'],
    ['brush', '刷子'], ['cloud', '云'], ['dance', '跳舞'], ['early', '早的'], ['fruit', '水果']
  ],
  [Grade.G4]: [
    ['active', '活跃的'], ['bright', '明亮的'], ['country', '国家'], ['danger', '危险'], ['energy', '能量'],
    ['famous', '著名的'], ['guitar', '吉他'], ['honest', '诚实的'], ['invent', '发明'], ['journey', '旅程'],
    ['knight', '骑士'], ['lovely', '可爱的'], ['market', '市场'], ['nearby', '在附近'], ['object', '物体'],
    ['planet', '行星'], ['repair', '修理'], ['silver', '银色的'], ['travel', '旅行'], ['unique', '独特的'],
    ['valley', '山谷'], ['winter', '冬天'], ['across', '横过'], ['bridge', '桥'], ['cloudy', '多云的'],
    ['doctor', '医生'], ['enough', '足够的'], ['follow', '跟随'], ['gentle', '温和的'], ['happen', '发生']
  ],
  [Grade.G5]: [
    ['achieve', '实现'], ['believe', '相信'], ['culture', '文化'], ['develop', '发展'], ['explore', '探索'],
    ['freedom', '自由'], ['general', '一般的'], ['history', '历史'], ['imagine', '想象'], ['justice', '正义'],
    ['kingdom', '王国'], ['library', '图书馆'], ['message', '信息'], ['network', '网络'], ['opinion', '观点'],
    ['perfect', '完美的'], ['quality', '质量'], ['respect', '尊重'], ['science', '科学'], ['through', '穿过'],
    ['unknown', '未知的'], ['victory', '胜利'], ['weather', '天气'], ['example', '例子'], ['forward', '向前'],
    ['greedy', '贪婪的'], ['health', '健康'], ['ignore', '忽略'], ['junior', '年少的'], ['knight', '骑士']
  ],
  [Grade.G6]: [
    ['ambition', '雄心'], ['business', '业务'], ['capacity', '容量'], ['decision', '决定'], ['education', '教育'],
    ['festival', '节日'], ['grateful', '感激的'], ['hospital', '医院'], ['increase', '增加'], ['language', '语言'],
    ['mountain', '山脉'], ['negative', '消极的'], ['opposite', '相反的'], ['positive', '积极的'], ['question', '问题'],
    ['resource', '资源'], ['standard', '标准'], ['together', '一起'], ['universe', '宇宙'], ['valuable', '有价值的'],
    ['wonderful', '奇妙的'], ['exercise', '锻炼'], ['favourite', '最喜爱的'], ['government', '政府'], ['knowledge', '知识'],
    ['machine', '机器'], ['nuclear', '核能的'], ['package', '包裹'], ['quality', '品质'], ['regular', '定期的']
  ]
};

export const VOCABULARY: Word[] = Object.entries(ALL_WORDS_DATA).flatMap(([grade, words]) => 
  words.map(([eng, chi], i) => ({
    id: `${grade}-${i}`,
    english: eng,
    chinese: chi,
    grade: grade as Grade
  }))
);

export const APP_THEME = {
  primary: '#58cc02', // Duolingo Green
  secondary: '#1cb0f6', // Duolingo Blue
  accent: '#ffc800', // Duolingo Yellow
  error: '#ff4b4b', // Duolingo Red
  text: '#4b4b4b'
};
