
import React, { useState, useEffect } from 'react';
import { View, UserState, Grade, Pokemon, Word } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { APP_THEME, POKEMON_DATA, VOCABULARY } from './constants';
import Layout from './components/Layout';
import Quiz from './components/Quiz';

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>(storageService.getUserState());
  const [currentView, setView] = useState<View>('home');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastWonPokemon, setLastWonPokemon] = useState<Pokemon | null>(null);
  const [activeQuizWords, setActiveQuizWords] = useState<Word[]>([]);

  useEffect(() => {
    storageService.saveUserState(userState);
  }, [userState]);

  // 核心逻辑：获取指定年级和关卡的专属单词包（每包5个，绝不重复）
  const getWordsForLevel = (grade: Grade, level: number): Word[] => {
    const gradeWords = VOCABULARY.filter(w => w.grade === grade);
    const startIdx = (level - 1) * 5;
    return gradeWords.slice(startIdx, startIdx + 5);
  };

  const startLevel = (grade: Grade, level: number) => {
    const levelWords = getWordsForLevel(grade, level);
    if (levelWords.length === 0) {
      alert('该关卡内容正在准备中...');
      return;
    }
    setActiveQuizWords(levelWords);
    setUserState(prev => ({ ...prev, currentGrade: grade }));
    setView('quiz');
  };

  const handleQuizFinish = (correctIds: string[], wrongWords: Word[]) => {
    const isLevelClear = wrongWords.length === 0 && correctIds.length === activeQuizWords.length;
    
    const newWrongAnswers = [...userState.wrongAnswers];
    wrongWords.forEach(ww => {
      if (!newWrongAnswers.find(prev => prev.id === ww.id)) {
        newWrongAnswers.push(ww);
      }
    });

    const pointsEarned = correctIds.length * 10;
    
    if (isLevelClear) {
      const currentLevel = userState.gradeProgress[userState.currentGrade] || 0;
      // 更新进度：只有完成当前最高关卡才增加进度
      const levelPlayed = Math.floor(VOCABULARY.filter(w => w.grade === userState.currentGrade).indexOf(activeQuizWords[0]) / 5) + 1;
      const nextLevelProgress = levelPlayed > currentLevel ? levelPlayed : currentLevel;
      
      const randomIdx = Math.floor(Math.random() * POKEMON_DATA.length);
      const wonPokemon = POKEMON_DATA[randomIdx];
      setLastWonPokemon(wonPokemon);

      setUserState(prev => ({
        ...prev,
        points: prev.points + pointsEarned + 50,
        gradeProgress: { ...prev.gradeProgress, [prev.currentGrade]: nextLevelProgress },
        collection: [...prev.collection, wonPokemon],
        completedWords: Array.from(new Set([...prev.completedWords, ...correctIds])),
        wrongAnswers: newWrongAnswers.filter(w => !correctIds.includes(w.id)) // 如果在错题集里做对了，也移除
      }));

      setView('draw-result');
    } else {
      setUserState(prev => ({
        ...prev,
        points: prev.points + pointsEarned,
        completedWords: Array.from(new Set([...prev.completedWords, ...correctIds])),
        wrongAnswers: newWrongAnswers
      }));
      alert(wrongWords.length > 0 ? `闯关结束！有 ${wrongWords.length} 个单词答错啦。全对通关才能获得精灵球哦！` : '请完成所有题目！');
      setView('home');
    }
  };

  const buyPokemon = (pokemon: Pokemon) => {
    if (userState.points >= pokemon.price) {
      setUserState(prev => ({
        ...prev,
        points: prev.points - pokemon.price,
        collection: [...prev.collection, pokemon]
      }));
      alert(`恭喜获得 ${pokemon.name}!`);
    } else {
      alert('积分不足，快去闯关吧！');
    }
  };

  const sellPokemon = (index: number) => {
    const pokemon = userState.collection[index];
    const sellPrice = Math.floor(pokemon.price * 0.8);
    const newCollection = [...userState.collection];
    newCollection.splice(index, 1);
    
    setUserState(prev => ({
      ...prev,
      points: prev.points + sellPrice,
      collection: newCollection
    }));
    alert(`以 ${sellPrice} 积分卖出了 ${pokemon.name}`);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">冒险大地图</h2>
            <p className="text-sm text-gray-500 mb-6">每个关卡包含 5 个专属单词，全对可抽取精灵！</p>
            
            <div className="flex flex-col gap-10 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-100 -translate-x-1/2 -z-10"></div>
              
              {Object.values(Grade).map((grade) => {
                const progress = userState.gradeProgress[grade] || 0;
                const isGradeActive = userState.currentGrade === grade;

                return (
                  <div key={grade} className="flex flex-col items-center">
                    <div className={`px-4 py-1 rounded-full text-xs font-bold mb-4 ${isGradeActive ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>
                      {grade}
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4 max-w-[280px]">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isUnlocked = lvl <= progress + 1;
                        const isCompleted = lvl <= progress;
                        
                        return (
                          <button
                            key={lvl}
                            disabled={!isUnlocked}
                            onClick={() => startLevel(grade, lvl)}
                            className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-md transition-all duo-button
                              ${isCompleted ? 'bg-yellow-400 text-white' : isUnlocked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed'}
                            `}
                          >
                            {isCompleted ? '⭐' : lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'draw-result':
        return (
          <div className="flex flex-col items-center justify-center p-6 h-full text-center min-h-[70vh]">
            <h2 className="text-3xl font-bold text-green-600 mb-4 animate-bounce">完美通关！</h2>
            <p className="text-gray-500 mb-8 font-medium">触发了隐藏的精灵球...</p>
            <div className="relative w-64 h-64 mb-10">
              <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-10"></div>
              <div className="relative z-10 p-6 bg-white rounded-[40px] border-4 border-yellow-400 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500 opacity-5"></div>
                <img 
                  src={lastWonPokemon?.image} 
                  alt="Pokemon" 
                  className="w-full h-full object-contain animate-fade-in"
                />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-800 mb-2">获得新伙伴: {lastWonPokemon?.name}!</div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-8 ${lastWonPokemon?.rarity === 'Legendary' ? 'bg-purple-500' : 'bg-blue-400'}`}>
              {lastWonPokemon?.rarity} 稀有度
            </div>
            <button 
              onClick={() => setView('home')}
              className="w-full max-w-xs py-4 bg-green-500 text-white rounded-2xl font-bold text-xl shadow-lg duo-button"
            >
              继续冒险
            </button>
          </div>
        );

      case 'quiz':
        return <Quiz grade={userState.currentGrade} initialWords={activeQuizWords} onFinish={handleQuizFinish} />;

      case 'store':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">积分商城</h2>
            <div className="grid grid-cols-2 gap-4">
              {POKEMON_DATA.map(p => (
                <div key={p.id} className="p-4 border-2 border-gray-100 rounded-3xl text-center bg-white shadow-sm duo-button">
                  <img src={p.image} alt={p.name} className="w-24 h-24 mx-auto mb-2" />
                  <div className="font-bold text-gray-700">{p.name}</div>
                  <div className="text-yellow-600 font-bold mb-3">💰 {p.price}</div>
                  <button 
                    onClick={() => buyPokemon(p)}
                    className="w-full py-2 text-sm bg-blue-500 text-white rounded-xl font-bold shadow-sm"
                  >
                    购买
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'market':
        return (
          <div className="p-6">
             <h2 className="text-2xl font-bold mb-6">宝可梦集市</h2>
             <p className="text-gray-500 mb-6 text-sm">变现重复的精灵，换取更多积分！</p>
             {userState.collection.length === 0 ? (
               <div className="text-center py-20 text-gray-400">
                 <div className="text-5xl mb-4">🏚️</div>
                 背包里空空如也
               </div>
             ) : (
               <div className="grid grid-cols-2 gap-4">
                 {userState.collection.map((p, idx) => (
                   <div key={idx} className="p-4 border-2 border-gray-100 rounded-3xl text-center bg-white shadow-sm">
                     <img src={p.image} alt={p.name} className="w-20 h-20 mx-auto mb-2" />
                     <div className="font-bold text-gray-800 text-sm mb-1">{p.name}</div>
                     <div className="text-green-600 font-bold text-xs mb-3">回收: {Math.floor(p.price * 0.8)} 积分</div>
                     <button 
                       onClick={() => sellPokemon(idx)}
                       className="w-full py-1.5 text-xs bg-red-400 text-white rounded-lg font-bold shadow-sm"
                     >
                       确认卖出
                     </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        );

      case 'collection':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">我的背包</h2>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">成员: {userState.collection.length}</span>
            </div>
            {userState.collection.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4 opacity-30">🎒</div>
                <p className="text-gray-400 font-bold">还没有收集到精灵哦</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {userState.collection.map((p, idx) => (
                  <div key={idx} className="p-4 bg-white border-2 border-gray-100 rounded-3xl text-center shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-1.5">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full text-white font-bold uppercase ${p.rarity === 'Legendary' ? 'bg-purple-500' : p.rarity === 'Epic' ? 'bg-orange-400' : p.rarity === 'Rare' ? 'bg-blue-400' : 'bg-gray-400'}`}>
                          {p.rarity}
                        </span>
                     </div>
                     <div className="w-24 h-24 mx-auto mb-2 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <img src={p.image} alt={p.name} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300" />
                     </div>
                     <div className="font-bold text-gray-800">{p.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'error-correction':
        if (userState.wrongAnswers.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-5xl mb-6">🌈</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">暂无错题</h3>
              <p className="text-gray-500">所有的单词都已经掌握，你是最棒的！</p>
            </div>
          );
        }
        return (
          <Quiz 
            grade={userState.currentGrade} 
            isCorrectionMode 
            initialWords={userState.wrongAnswers}
            onFinish={(correctIds) => {
               setUserState(prev => ({
                 ...prev,
                 wrongAnswers: prev.wrongAnswers.filter(w => !correctIds.includes(w.id))
               }));
               setView('home');
               alert('纠错完成！错题集已更新。');
            }} 
          />
        );

      case 'summary':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">学习周报</h2>
            <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-[32px] shadow-sm mb-8">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-blue-500 font-bold">AI 老师正在分析数据...</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-blue-900 leading-relaxed font-medium">
                  {summary || "点击下方按钮生成您的专属报告"}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={loadSummary}
                className="flex-1 py-4 bg-white border-2 border-blue-200 text-blue-500 rounded-2xl font-bold hover:bg-blue-50 transition-colors"
              >
                🔄 刷新报告
              </button>
              <button 
                onClick={() => setView('home')}
                className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold duo-button"
              >
                返回大厅
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const loadSummary = async () => {
    setIsLoading(true);
    const text = await geminiService.getLearningSummary(userState);
    setSummary(text);
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentView === 'summary' && !summary) {
      loadSummary();
    }
  }, [currentView]);

  return (
    <Layout userState={userState} currentView={currentView} setView={setView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
