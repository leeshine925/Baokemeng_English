
import React, { useState, useEffect } from 'react';
import { Word, Grade } from '../types';
import { VOCABULARY, APP_THEME } from '../constants';

interface QuizProps {
  grade: Grade;
  onFinish: (correctIds: string[], wrongWords: Word[]) => void;
  isCorrectionMode?: boolean;
  initialWords: Word[];
}

const Quiz: React.FC<QuizProps> = ({ grade, onFinish, isCorrectionMode, initialWords }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [options, setOptions] = useState<string[]>([]);

  const currentWord = initialWords[currentIdx];
  const isCorrect = selectedOption === currentWord?.chinese;

  useEffect(() => {
    if (currentWord) {
      const otherWords = VOCABULARY.filter(w => w.id !== currentWord.id);
      const distractors = otherWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.chinese);
      
      const allOptions = [...distractors, currentWord.chinese].sort(() => 0.5 - Math.random());
      setOptions(allOptions);
      setSelectedOption(null);
      setIsAnswered(false);
      playAudio(currentWord.english);
    }
  }, [currentWord]);

  const playAudio = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    setIsAnswered(true);
    
    if (isCorrect) {
      setCorrectIds(prev => [...prev, currentWord.id]);
      // @ts-ignore
      if (typeof confetti !== 'undefined') {
        // @ts-ignore
        confetti({
          particleCount: 80,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#58cc02', '#ffffff']
        });
      }
    } else {
      setWrongWords(prev => [...prev, currentWord]);
      if (window.navigator.vibrate) window.navigator.vibrate(200);
    }
  };

  const handleNext = () => {
    if (currentIdx < initialWords.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onFinish(correctIds, wrongWords);
    }
  };

  if (!currentWord) return null;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* 答题核心区域 */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
           <button 
             onClick={() => { if(confirm('确定要退出当前挑战吗？')) onFinish(correctIds, wrongWords); }} 
             className="text-gray-300 hover:text-gray-500 p-2 -ml-2"
           >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </button>
           <div className="flex-1 mx-4">
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="bg-green-500 h-full transition-all duration-500" 
                  style={{ width: `${((currentIdx + 1) / initialWords.length) * 100}%` }}
                />
              </div>
           </div>
           <span className="text-xs font-black text-gray-400 tabular-nums">{currentIdx + 1} / {initialWords.length}</span>
        </div>

        <div className="flex flex-col items-center mb-10 mt-2">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">{currentWord.english}</h2>
            <button
              onClick={() => playAudio(currentWord.english)}
              className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
          </div>
          <p className="text-sm font-bold text-gray-400">请选择正确的中文含义</p>
        </div>

        <div className="grid gap-3 mb-8">
          {options.map((opt, i) => {
            let stateClass = 'border-gray-200 hover:border-gray-300';
            if (isAnswered) {
              if (opt === currentWord.chinese) {
                stateClass = 'border-green-500 bg-green-50 text-green-700';
              } else if (opt === selectedOption) {
                stateClass = 'border-red-500 bg-red-50 text-red-700';
              } else {
                stateClass = 'border-gray-100 opacity-50';
              }
            } else if (selectedOption === opt) {
              stateClass = 'border-blue-400 bg-blue-50 text-blue-600';
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => setSelectedOption(opt)}
                className={`p-5 border-2 rounded-2xl text-lg font-bold transition-all text-left duo-button ${stateClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部交互反馈条 - 确保完整显示 */}
      <div className={`p-6 pb-10 transition-all duration-300 border-t-2 z-50 ${
        isAnswered 
          ? (isCorrect ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200') 
          : 'bg-white border-gray-100'
      }`}>
        {isAnswered ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                {isCorrect ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                )}
              </div>
              <div>
                <h3 className={`font-black text-2xl ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '太棒了！答对了' : '下次加油！'}
                </h3>
                {!isCorrect && <p className="text-red-600 font-bold text-sm">正确答案：{currentWord.chinese}</p>}
              </div>
            </div>
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-black text-xl duo-button shadow-lg ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
            >
              {currentIdx < initialWords.length - 1 ? '继续' : '查看结果'}
            </button>
          </div>
        ) : (
          <button
            disabled={!selectedOption}
            onClick={handleCheck}
            className={`w-full py-4 rounded-2xl font-black text-xl duo-button transition-all ${
              selectedOption 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            检查答案
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
