// Groq AI 食譜生成（測試版）
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export const isGroqConfigured = () => Boolean(process.env.EXPO_PUBLIC_GROQ_API_KEY);

export const generateRecipeWithGroq = async ({ type, ingredients, time, notes }) => {
    const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('尚未設定 Groq API Key，請在 .env 檔案中設定 EXPO_PUBLIC_GROQ_API_KEY。');
    }

    const prompt = `你是一位專業烘焙師，請根據以下資訊設計一份食譜，並只回傳 JSON（不要加任何其他文字或說明）：
- 想做的甜點類型：${type}
- 手邊現有食材：${ingredients}
- 預計花費時間：${time}
- 其他需求：${notes || '無'}

請回傳以下格式的 JSON：
{
  "title": "食譜名稱",
  "category": "蛋糕、麵包、餅乾、其他 其中一個",
  "ingredients": ["食材1 份量", "食材2 份量"],
  "steps": ["步驟一", "步驟二", "步驟三"],
  "heatTimeText": "烤溫及時間，例如：180度 25分鐘",
  "note": "簡短備註或小提示"
}`;

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.8,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API 錯誤（${response.status}）：${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('Groq 未回傳任何內容，請稍後再試一次。');
    }

    return JSON.parse(content);
};
