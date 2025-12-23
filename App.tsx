
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

  const getWordsForLevel = (grade: Grade, level: number): Word[] => {
    // 核心逻辑：根据年级和关卡物理切分词池，确保绝不重复
    const gradeWords = VOCABULARY.filter(w => w.grade === grade);
    const startIdx = (level - 1) * 5; // 每关5个词
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
    const pointsEarned = correctIds.length * 10;
    
    if (correctIds.length > 0) {
      // @ts-ignore - 触发全屏烟花
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [APP_THEME.primary, APP_THEME.accent, APP_THEME.secondary]
      });
    }

    if (isLevelClear) {
      const currentLevel = userState.gradeProgress[userState.currentGrade] || 0;
      // 这里的逻辑确保只有完成当前最高关卡才推进进度
      const levelIndex = Math.floor(VOCABULARY.filter(w => w.grade === userState.currentGrade).indexOf(activeQuizWords[0]) / 5) + 1;
      const nextLevelProgress = levelIndex > currentLevel ? levelIndex : currentLevel;
      
      const randomIdx = Math.floor(Math.random() * POKEMON_DATA.length);
      const wonPokemon = POKEMON_DATA[randomIdx];
      setLastWonPokemon(wonPokemon);

      setUserState(prev => ({
        ...prev,
        points: prev.points + pointsEarned + 50, // 通关额外奖励
        gradeProgress: { ...prev.gradeProgress, [prev.currentGrade]: nextLevelProgress },
        collection: [...prev.collection, wonPokemon],
        completedWords: Array.from(new Set([...prev.completedWords, ...correctIds])),
        wrongAnswers: prev.wrongAnswers.filter(w => !correctIds.includes(w.id)) 
      }));
      setView('draw-result');
    } else {
      setUserState(prev => {
        const uniqueWrong = [...prev.wrongAnswers];
        wrongWords.forEach(ww => {
          if (!uniqueWrong.find(pa => pa.id === ww.id)) uniqueWrong.push(ww);
        });
        return {
          ...prev,
          points: prev.points + pointsEarned,
          completedWords: Array.from(new Set([...prev.completedWords, ...correctIds])),
          wrongAnswers: uniqueWrong
        };
      });
      alert(`闯关结束！获得了 ${pointsEarned} 积分。全对通关才能开启精灵球宝箱哦！`);
      setView('home');
    }
  };

  const openEgg = () => {
    if (userState.points < 50) return; // 逻辑锁，配合按钮 disabled
    
    const won = POKEMON_DATA[Math.floor(Math.random() * POKEMON_DATA.length)];
    setLastWonPokemon(won);
    setUserState(prev => ({
      ...prev,
      points: prev.points - 50,
      collection: [...prev.collection, won]
    }));
    setView('draw-result');
  };

  const sellPokemon = (index: number) => {
    const pokemon = userState.collection[index];
    const sellPrice = Math.floor(pokemon.price * 0.7);
    const newColl = [...userState.collection];
    newColl.splice(index, 1);
    setUserState(prev => ({
      ...prev,
      points: prev.points + sellPrice,
      collection: newColl
    }));
    alert(`成功卖出 ${pokemon.name}，回收了 ${sellPrice} 积分！`);
  };

  const loadSummary = async () => {
    setIsLoading(true);
    const text = await geminiService.getLearningSummary(userState);
    setSummary(text);
    setIsLoading(false);
  };

  return (
    <Layout userState={userState} currentView={currentView} setView={setView}>
      {currentView === 'home' && (
        <div className="p-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100 mb-8 flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">我的钱包</div>
              <div className="text-3xl font-black text-gray-800 flex items-center gap-2">
                <span className="text-yellow-400">💰</span> {userState.points}
              </div>
            </div>
            <button 
              onClick={openEgg} 
              disabled={userState.points < 50}
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all duo-button
                ${userState.points >= 50 ? 'bg-yellow-400 text-white shadow-lg' : 'bg-gray-100 text-gray-300 opacity-50 cursor-not-allowed'}
              `}
            >
              <span className="text-3xl mb-1">🥚</span>
              <span className="text-[10px] font-black uppercase">50 积分</span>
            </button>
          </div>

          <div className="space-y-12 pb-10">
            {Object.values(Grade).map(grade => {
              const progress = userState.gradeProgress[grade] || 0;
              return (
                <div key={grade} className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-0.5 flex-1 bg-gray-100"></div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">{grade}</h3>
                    <div className="h-0.5 flex-1 bg-gray-100"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 px-2">
                    {[1, 2, 3, 4, 5, 6].map(lvl => {
                      const isUnlocked = lvl <= progress + 1;
                      const isCompleted = lvl <= progress;
                      return (
                        <div key={lvl} className="flex flex-col items-center">
                          <button
                            disabled={!isUnlocked}
                            onClick={() => startLevel(grade, lvl)}
                            className={`w-20 h-20 rounded-full font-black text-2xl flex items-center justify-center transition-all duo-button relative
                              ${isCompleted ? 'bg-yellow-400 text-white' : isUnlocked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-300 opacity-60'}
                            `}
                          >
                            {isCompleted ? '⭐' : lvl}
                            {isUnlocked && !isCompleted && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></div>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentView === 'quiz' && (
        <Quiz 
          grade={userState.currentGrade} 
          initialWords={activeQuizWords} 
          onFinish={handleQuizFinish} 
        />
      )}

      {currentView === 'draw-result' && lastWonPokemon && (
        <div className="flex flex-col items-center justify-center p-10 text-center min-h-[70vh] bg-white">
          <h2 className="text-4xl font-black text-green-500 mb-2 animate-bounce">太棒了！</h2>
          <p className="text-gray-400 font-bold mb-10">你发现了一位新的伙伴</p>
          
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="bg-white p-10 rounded-[50px] shadow-2xl border-4 border-yellow-400 relative z-10 scale-110">
              <img src={lastWonPokemon.image} className="w-48 h-48 object-contain" alt={lastWonPokemon.name} />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-1 rounded-full text-sm font-black">
                No. {lastWonPokemon.id}
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl font-black text-gray-800 mb-1">{lastWonPokemon.name}</h3>
            <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase text-white shadow-sm
              ${lastWonPokemon.rarity === 'Legendary' ? 'bg-purple-500' : lastWonPokemon.rarity === 'Epic' ? 'bg-orange-500' : lastWonPokemon.rarity === 'Rare' ? 'bg-blue-500' : 'bg-green-500'}
            `}>
              {lastWonPokemon.rarity} 稀有度
            </span>
          </div>

          <button 
            onClick={() => setView('home')} 
            className="w-full max-w-xs py-5 bg-green-500 text-white rounded-[24px] font-black text-xl shadow-lg duo-button"
          >
            继续冒险
          </button>
        </div>
      )}

      {currentView === 'store' && (
        <div className="p-6">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-black text-gray-800">精灵商店</h2>
            <div className="bg-yellow-50 px-4 py-1 rounded-full text-yellow-600 font-black text-sm border border-yellow-100">
              💰 {userState.points}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
             {POKEMON_DATA.map(p => (
               <div key={p.id} className="bg-white border-2 border-gray-100 p-5 rounded-[32px] flex flex-col items-center text-center shadow-sm hover:border-blue-200 transition-colors group">
                 <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <img src={p.image} className="w-20 h-20 object-contain" alt={p.name} />
                 </div>
                 <div className="font-black text-gray-800 mb-1">{p.name}</div>
                 <div className="text-yellow-600 font-black mb-4 flex items-center gap-1">
                   <span className="text-sm">💰</span> {p.price}
                 </div>
                 <button 
                   onClick={() => {
                     if (userState.points >= p.price) {
                       setUserState(prev => ({...prev, points: prev.points - p.price, collection: [...prev.collection, p]}));
                       alert(`购买成功！${p.name}加入你的队伍。`);
                     } else {
                       alert('积分不足，快去闯关攒积分吧！');
                     }
                   }}
                   className="w-full bg-blue-500 text-white py-3 rounded-2xl font-black text-sm duo-button"
                 >购买</button>
               </div>
             ))}
          </div>
        </div>
      )}

      {currentView === 'market' && (
        <div className="p-6">
          <h2 className="text-3xl font-black text-gray-800 mb-2">精灵集市</h2>
          <p className="text-gray-400 font-bold mb-8 text-sm">卖出重复的精灵，换取积分开启更多挑战！</p>
          
          {userState.collection.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-6">🏚️</div>
              <p className="text-gray-400 font-black">集市摊位空空如也...</p>
              <button onClick={() => setView('home')} className="mt-6 text-green-500 font-black hover:underline">去抓几只宝可梦再来？</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {userState.collection.map((p, i) => (
                <div key={i} className="bg-white border-2 border-gray-100 p-5 rounded-[32px] flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-bl-2xl">
                    70% 回收
                  </div>
                  <img src={p.image} className="w-20 h-20 mb-3 group-hover:rotate-12 transition-transform" alt={p.name} />
                  <div className="font-black text-gray-800 mb-1">{p.name}</div>
                  <div className="text-green-600 text-sm font-black mb-4 flex items-center gap-1">
                    <span>💰</span> {Math.floor(p.price * 0.7)}
                  </div>
                  <button onClick={() => sellPokemon(i)} className="w-full bg-red-400 text-white py-2.5 rounded-2xl text-xs font-black shadow-sm duo-button">确认卖出</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'collection' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-gray-800">我的背包</h2>
            <div className="bg-gray-100 px-4 py-1 rounded-full text-gray-500 text-xs font-black uppercase">
              数量: {userState.collection.length}
            </div>
          </div>
          
          {userState.collection.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-6 grayscale opacity-30">🎒</div>
              <p className="text-gray-400 font-black">还没有收集到精灵哦</p>
              <button onClick={() => setView('home')} className="mt-6 bg-green-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg duo-button">立即出发冒险</button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
               {userState.collection.map((p, i) => (
                 <div key={i} className="bg-gray-50 rounded-[30px] p-3 border-2 border-transparent hover:border-yellow-400 transition-all flex flex-col items-center group shadow-sm">
                   <div className="w-full aspect-square bg-white rounded-2xl flex items-center justify-center mb-2">
                     <img src={p.image} className="w-14 h-14 object-contain group-hover:scale-125 transition-transform" alt={p.name} />
                   </div>
                   <span className="text-[11px] font-black text-gray-700 truncate w-full text-center">{p.name}</span>
                 </div>
               ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'error-correction' && (
        <div className="p-6">
          <h2 className="text-3xl font-black text-gray-800 mb-2">错题宝典</h2>
          <p className="text-gray-400 font-bold mb-8 text-sm">温故而知新，攻克这些难关吧！</p>
          
          {userState.wrongAnswers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-6">🏆</div>
              <p className="text-gray-400 font-black">你是英语小天才！暂时没有错题。</p>
            </div>
          ) : (
            <div className="space-y-4">
               {userState.wrongAnswers.map(w => (
                 <div key={w.id} className="bg-white border-2 border-gray-100 p-6 rounded-[32px] flex justify-between items-center shadow-sm hover:border-blue-300 transition-all group">
                   <div>
                     <div className="text-2xl font-black text-blue-500 mb-1 group-hover:tracking-wider transition-all">{w.english}</div>
                     <div className="text-gray-400 font-bold">{w.chinese}</div>
                   </div>
                   <button 
                     onClick={() => {
                        const ut = new SpeechSynthesisUtterance(w.english);
                        ut.lang = 'en-US';
                        ut.rate = 0.8;
                        window.speechSynthesis.speak(ut);
                     }}
                     className="bg-blue-50 text-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center font-bold shadow-sm hover:bg-blue-100 active:scale-90 transition-all"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                   </button>
                 </div>
               ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'summary' && (
        <div className="p-6">
          <h2 className="text-3xl font-black text-gray-800 mb-2">学习报告</h2>
          <p className="text-gray-400 font-bold mb-8 text-sm">AI 老师为你深度分析最近的学习表现。</p>
          
          <div className="bg-blue-50 p-8 rounded-[40px] border-4 border-blue-100 mb-8 relative">
            <div className="absolute -top-4 -left-2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase shadow-md">AI Insights</div>
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-500 font-black animate-pulse">正在批改作业中...</p>
              </div>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed text-blue-900 font-bold italic">
                {summary || "点击下方按钮，唤起 AI 老师为你总结。"}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={loadSummary} 
              disabled={isLoading}
              className="w-full py-5 bg-blue-500 text-white rounded-[24px] font-black text-xl shadow-lg duo-button disabled:opacity-50"
            >
              ✨ 智能生成总结
            </button>
            <button 
              onClick={() => setView('home')} 
              className="w-full py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-[24px] font-black text-lg"
            >
              返回大本营
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
