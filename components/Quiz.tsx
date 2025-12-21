
import React, { useState, useEffect } from 'react';
import { Word, Grade, UserState } from '../types';
import { VOCABULARY, APP_THEME } from '../constants';

interface QuizProps {
  grade: Grade;
  onFinish: (correctIds: string[], wrongWords: Word[]) => void;
  isCorrectionMode?: boolean;
  initialWords: Word[]; // 必须传入初始化单词，确保关卡逻辑受控
}

const Quiz: React.FC<QuizProps> = ({ grade, onFinish, isCorrectionMode, initialWords }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [options, setOptions] = useState<string[]>([]);

  const currentWord = initialWords[currentIdx];

  useEffect(() => {
    if (currentWord) {
      // 干扰项从整个库中随机抽取，只要不是当前词即可
      const otherWords = VOCABULARY.filter(w => w.id !== currentWord.id);
      const distractors = otherWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.chinese);
      
      const allOptions = [...distractors, currentWord.chinese].sort(() => 0.5 - Math.random());
      setOptions(allOptions);
      setSelectedOption(null);
      setIsAnswered(false);
      
      // 切换新单词时播报一次
      playAudio(currentWord.english);
    }
  }, [currentWord]);

  const playAudio = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // 为小学生调慢语速
    window.speechSynthesis.speak(utterance);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    setIsAnswered(true);
    const isCorrect = selectedOption === currentWord.chinese;
    
    if (isCorrect) {
      setCorrectIds(prev => [...prev, currentWord.id]);
      // @ts-ignore
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#58cc02', '#ffc800', '#1cb0f6']
      });
    } else {
      setWrongWords(prev => [...prev, currentWord]);
    }
  };

  const handleNext = () => {
    if (currentIdx < initialWords.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onFinish(correctIds, wrongWords);
    }
  };

  if (!currentWord) return (
    <div className="p-10 text-center h-full flex flex-col justify-center items-center">
      <div className="text-7xl mb-6">✨</div>
      <h2 className="text-2xl font-black text-gray-800 mb-6">挑战完成！</h2>
      <button 
        onClick={() => onFinish(correctIds, wrongWords)} 
        className="px-10 py-4 bg-green-500 text-white rounded-2xl font-bold text-lg duo-button"
      >
        领取结算奖励
      </button>
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
           <button 
             onClick={() => { if(confirm('确定要退出当前挑战吗？')) onFinish(correctIds, wrongWords); }} 
             className="text-gray-300 hover:text-gray-500 transition-colors"
           >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </button>
           <div className="flex-1 mx-6">
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="bg-green-500 h-full transition-all duration-700 ease-out" 
                  style={{ width: `${((currentIdx + 1) / initialWords.length) * 100}%` }}
                />
              </div>
           </div>
           <span className="text-sm font-black text-gray-400 tabular-nums">{currentIdx + 1} / {initialWords.length}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center mb-8">
        <div className="text-xs font-black text-blue-500 mb-2 tracking-[0.2em] uppercase opacity-60">
          Listening & Reading
        </div>
        <div className="flex items-center gap-5 mb-2">
          <h2 className="text-5xl font-black text-gray-800 tracking-tight">{currentWord.english}</h2>
          <button
            onClick={() => playAudio(currentWord.english)}
            className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 active:scale-90 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
        </div>
        <div className="h-1 w-12 bg-gray-100 rounded-full mt-4"></div>
      </div>

      <div className="grid gap-3.5">
        {options.map((opt, i) => {
          let stateClass = 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
          if (isAnswered) {
            if (opt === currentWord.chinese) {
              stateClass = 'border-green-500 bg-green-50 text-green-700 shadow-[0_4px_0_0_rgba(34,197,94,0.2)]';
            } else if (opt === selectedOption) {
              stateClass = 'border-red-500 bg-red-50 text-red-700 shadow-[0_4px_0_0_rgba(239,68,68,0.2)]';
            } else {
              stateClass = 'border-gray-100 opacity-40';
            }
          } else if (selectedOption === opt) {
            stateClass = 'border-blue-400 bg-blue-50 text-blue-600 shadow-[0_4px_0_0_rgba(59,130,246,0.1)]';
          }

          return (
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => setSelectedOption(opt)}
              className={`p-5 border-2 rounded-3xl text-xl font-bold transition-all text-left flex items-center gap-4 duo-button ${stateClass}`}
            >
              <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-black">{i + 1}</span>
              {opt}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-10">
        {!isAnswered ? (
          <button
            onClick={handleCheck}
            disabled={!selectedOption}
            style={{ backgroundColor: selectedOption ? APP_THEME.primary : '#e5e5e5' }}
            className="w-full py-5 rounded-[24px] text-white font-black text-xl shadow-lg duo-button disabled:shadow-none transition-all"
          >
            检查答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{ backgroundColor: selectedOption === currentWord.chinese ? APP_THEME.primary : APP_THEME.error }}
            className="w-full py-5 rounded-[24px] text-white font-black text-xl shadow-lg duo-button animate-pulse-subtle"
          >
            {currentIdx < initialWords.length - 1 ? '继续挑战' : '查看评价'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
