
import { GoogleGenAI, Type } from "@google/genai";
import { UserState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async getLearningSummary(state: UserState): Promise<string> {
    const wrongWords = state.wrongAnswers.map(w => w.english).join(', ');
    const completedCount = state.completedWords.length;
    
    const prompt = `
      作为一个温柔可亲的英语老师，请根据以下学生的学习数据生成一段激励性的总结：
      - 已掌握单词数：${completedCount}
      - 遇到困难的单词：${wrongWords}
      - 当前宝可梦收集数：${state.collection.length}
      - 积分：${state.points}
      请用中文撰写，语气要像对待小学生一样，给予肯定并针对错题给出简单的记忆小贴士。
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "太棒了！继续努力，你正在成为英语大师的路上！";
    } catch (error) {
      console.error("Gemini summary error:", error);
      return "你的表现非常出色！每一颗汗水都是成长的勋章。";
    }
  }
};
