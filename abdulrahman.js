import { GoogleGenAI } from '@google/genai';
import { ElevenLabsClient } from '@elevenlabs/client';
import fs from 'fs';

// إعداد المفاتيح والمعرفات (تم دمج مفتاح الأصوات الجديد)
const GEMINI_API_KEY = 'AQ.Ab8RN6IPUjG91QyYh-wk4wr_-kYNAMAS3vnCJ20MhDna_whY_w';
const ELEVENLABS_API_KEY = 'Sk_44aca2308fa73e10e856545669974728a8c3544abaea1be6';
const VOICE_ID = 'KfYUTAF49N2CPU3iKuMi'; // صوت محمد (السعودي الهادئ)

// تهيئة العملاء
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

/**
 * دالة التعامل مع محادثات عبدالرحمن (سواء نص أو صوت)
 * @param {string} userInput - ما كتبته أو قلته لعبدالرحمن
 * @param {boolean} wantAudio - هل ترغب في أن يكون الرد صوتياً؟ (true للصوت، false للكتابة فقط)
 */
async function chatWithAbdulrahman(userInput, wantAudio = false) {
    try {
        console.log(`المستخدم قال: "${userInput}"`);

        // 1. توليد الرد الذكي باستخدام Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [`أنت مساعد ذكي ومخاطبك يتحدث معك. أجب بأسلوب طبيعي ومناسب باسم عبدالرحمن: ${userInput}`],
        });

        const replyText = response.text;
        console.log(`رد عبدالرحمن (كتابة): ${replyText}`);

        // إذا كان الطلب كتابة فقط، نعيد النص مباشرة
        if (!wantAudio) {
            return { type: 'text', content: replyText };
        }

        // 2. إذا كان الطلب صوتياً، نقوم بتحويل رد عبدالرحمن إلى صوت باستخدام ElevenLabs والمفتاح الجديد
        console.log("جاري تحويل الرد إلى صوت بصوت محمد السعودي...");
        const audioStream = await elevenlabs.generate({
            voice: VOICE_ID,
            text: replyText,
            model_id: 'eleven_multilingual_v2',
        });

        // حفظ الملف الصوتي للاستماع إليه
        const outputFileName = 'abdulrahman_response.mp3';
        const fileStream = fs.createWriteStream(outputFileName);
        
        for await (const chunk of audioStream) {
            fileStream.write(chunk);
        }
        fileStream.end();

        console.log(`تم حفظ الملف الصوتي بنجاح باسم: ${outputFileName}`);
        return { type: 'audio', content: replyText, filePath: outputFileName };

    } catch (error) {
        console.error("حدث خطأ أثناء المعالجة:", error);
    }
}

// --- أمثلة على الاستخدام ---

// تجربة الرد الصوتي بالمفتاح المحدث:
chatWithAbdulrahman("قول لي حكمة جميلة بصوتك", true);
