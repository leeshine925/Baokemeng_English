
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
    const totalCount = activeQuizWords.length;
    // 只要完成了题目，不论对错都解锁进度（为了学习连贯性），或者根据需求要求全对才解锁
    // 此处设定：完成本关即解锁下一关
    const isLevelClear = wrongWords.length === 0 && correctIds.length === totalCount;
    const pointsEarned = correctIds.length * 10;
    
    setUserState(prev => {
      const existingWrongIds = new Set(prev.wrongAnswers.map(w => w.id));
      const newWrongAnswers = [...prev.wrongAnswers];
      
      wrongWords.forEach(w => {
        if (!existingWrongIds.has(w.id)) {
          newWrongAnswers.push(w);
        }
      });

      let nextGradeProgress = { ...prev.gradeProgress };
      let nextCollection = [...prev.collection];
      let bonusPoints = 0;

      // 计算当前玩的是第几关
      const allGradeWords = VOCABULARY.filter(w => w.grade === prev.currentGrade);
      const playedLevelIndex = Math.floor(allGradeWords.findIndex(w => w.id === activeQuizWords[0].id) / 5) + 1;
      
      // 更新进度：只有完成当前最高进度关卡时才推进
      if (playedLevelIndex > (prev.gradeProgress[prev.currentGrade] || 0)) {
        nextGradeProgress[prev.currentGrade] = playedLevelIndex;
      }

      if (isLevelClear) {
        bonusPoints = 50;
        const won = POKEMON_DATA[Math.floor(Math.random() * POKEMON_DATA.length)];
        setLastWonPokemon(won);
        nextCollection.push(won);
      }

      return {
        ...prev,
        points: prev.points + pointsEarned + bonusPoints,
        gradeProgress: nextGradeProgress,
        collection: nextCollection,
        completedWords: Array.from(new Set([...prev.completedWords, ...correctIds])),
        wrongAnswers: newWrongAnswers
      };
    });

    if (isLevelClear) {
      setView('draw-result');
    } else {
      alert(`挑战结束！获得了 ${pointsEarned} 积分。\n错题已加入错题本，完成该关卡后下一关已解锁！`);
      setView('home');
    }
  };

  const openEgg = () => {
    if (userState.points < 50) return;
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
    alert(`卖出成功，回笼积分 ${sellPrice}！`);
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
              <div className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1">当前余额</div>
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
              <span className="text-[10px] font-black">50 积分</span>
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
                            className={`w-16 h-16 rounded-full font-black text-xl flex items-center justify-center transition-all duo-button relative
                              ${isCompleted ? 'bg-yellow-400 text-white' : isUnlocked ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-300 opacity-60'}
                            `}
                          >
                            {isCompleted ? '⭐' : lvl}
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
          <h2 className="text-4xl font-black text-green-500 mb-2 animate-bounce">真棒！</h2>
          <p className="text-gray-400 font-bold mb-10">你发现了一位新的伙伴</p>
          
          <div className="relative mb-12">
            <div className="bg-white p-10 rounded-[50px] shadow-2xl border-4 border-yellow-400 relative z-10 scale-110">
              <img src={lastWonPokemon.image} className="w-48 h-48 object-contain" alt={lastWonPokemon.name} />
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl font-black text-gray-800 mb-1">{lastWonPokemon.name}</h3>
            <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase text-white
              ${lastWonPokemon.rarity === 'Legendary' ? 'bg-purple-500' : 'bg-green-500'}
            `}>
              {lastWonPokemon.rarity}
            </span>
          </div>

          <button onClick={() => setView('home')} className="w-full max-w-xs py-5 bg-green-500 text-white rounded-[24px] font-black text-xl duo-button">继续挑战</button>
        </div>
      )}

      {currentView === 'store' && (
        <div className="p-6 pb-20">
          <h2 className="text-2xl font-black mb-6">精灵商店</h2>
          <div className="grid grid-cols-2 gap-4">
             {POKEMON_DATA.map(p => (
               <div key={p.id} className="bg-white border-2 border-gray-100 p-4 rounded-3xl flex flex-col items-center text-center">
                 <img src={p.image} className="w-20 h-20 mb-2" alt={p.name} />
                 <div className="font-bold text-gray-800">{p.name}</div>
                 <div className="text-yellow-600 font-black mb-3">💰 {p.price}</div>
                 <button 
                   onClick={() => {
                     if (userState.points >= p.price) {
                       setUserState(prev => ({...prev, points: prev.points - p.price, collection: [...prev.collection, p]}));
                       alert(`购买成功！`);
                     } else {
                       alert('积分不足哦');
                     }
                   }}
                   className="w-full bg-blue-500 text-white py-2 rounded-xl font-bold text-xs duo-button"
                 >购买</button>
               </div>
             ))}
          </div>
        </div>
      )}

      {currentView === 'market' && (
        <div className="p-6 pb-20">
          <h2 className="text-2xl font-black mb-6">精灵集市</h2>
          {userState.collection.length === 0 ? <p className="text-center text-gray-400 py-20">这里空荡荡的...</p> : (
            <div className="grid grid-cols-2 gap-4">
              {userState.collection.map((p, i) => (
                <div key={i} className="bg-white border-2 border-gray-100 p-4 rounded-3xl flex flex-col items-center">
                  <img src={p.image} className="w-16 h-16 mb-2" alt={p.name} />
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="text-green-600 text-[10px] font-bold mb-3">💰 {Math.floor(p.price * 0.7)}</div>
                  <button onClick={() => sellPokemon(i)} className="bg-red-400 text-white px-4 py-1.5 rounded-xl text-[10px] font-bold shadow-sm">确认售出</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'collection' && (
        <div className="p-6 pb-20">
          <h2 className="text-2xl font-black mb-6">我的背包</h2>
          <div className="grid grid-cols-3 gap-4">
             {userState.collection.map((p, i) => (
               <div key={i} className="bg-gray-50 rounded-[24px] p-3 flex flex-col items-center border-2 border-transparent hover:border-yellow-400">
                 <img src={p.image} className="w-14 h-14" alt={p.name} />
                 <span className="text-[10px] font-bold text-gray-600 truncate w-full text-center">{p.name}</span>
               </div>
             ))}
          </div>
        </div>
      )}

      {currentView === 'error-correction' && (
        <div className="p-6 pb-20">
          <h2 className="text-2xl font-black mb-2">错题宝典</h2>
          <p className="text-gray-400 text-xs font-bold mb-6">攻克难点，变身英语学霸！</p>
          {userState.wrongAnswers.length === 0 ? <p className="text-center text-gray-400 py-20">目前没有错题，太棒了！</p> : (
            <div className="space-y-3">
               {userState.wrongAnswers.map(w => (
                 <div key={w.id} className="bg-white border-2 border-gray-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                   <div>
                     <div className="text-xl font-black text-blue-500">{w.english}</div>
                     <div className="text-gray-400 font-bold text-sm">{w.chinese}</div>
                   </div>
                   <button 
                     onClick={() => {
                        const ut = new SpeechSynthesisUtterance(w.english);
                        ut.lang = 'en-US';
                        ut.rate = 0.8;
                        window.speechSynthesis.speak(ut);
                     }}
                     className="bg-blue-50 text-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center font-bold"
                   >📢</button>
                 </div>
               ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'summary' && (
        <div className="p-6">
          <h2 className="text-2xl font-black mb-6">AI 学习总结</h2>
          <div className="bg-blue-50 p-6 rounded-[32px] border-4 border-blue-100 mb-8">
            {isLoading ? <p className="text-center py-10 animate-pulse font-bold text-blue-400">AI 老师分析中...</p> : (
              <p className="leading-relaxed text-blue-900 font-bold italic">{summary || "点击下方按钮获取 AI 老师的专业评价！"}</p>
            )}
          </div>
          <button onClick={loadSummary} className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black text-lg duo-button">生成智能总结</button>
        </div>
      )}
    </Layout>
  );
};

export default App;
