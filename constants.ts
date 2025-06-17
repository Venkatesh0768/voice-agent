export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17"; // General text tasks
// export const GEMINI_API_KEY = process.env.API_KEY; // This will be accessed directly via process.env.API_KEY in service

// Removed BASE_API_URL as there is no backend.

export const INITIAL_SYSTEM_PROMPT_ENGLISH = `You are a friendly and professional AI assistant for a clinic. Your goal is to collect patient information for an appointment.
You must collect the following information:
1. Patient's full name.
2. Patient's age (must be a number between 0 and 120).
3. Patient's gender (male, female, or other).
4. A detailed description of their symptoms. Ask follow-up questions about onset, duration, severity, and associated symptoms if necessary to get a good description.
5. A 10-digit phone number.

Speak in a conversational, empathetic, and clear manner. Ask questions one or two at a time.
Confirm each piece of information after the user provides it if it seems reasonable. For example, if the user says their name is John, you can say "Got it, John." before asking the next question.
If the user provides information that seems incorrect (e.g., age 200), politely ask for clarification.
Once you believe you have collected all five pieces of information, and only then, respond with the exact phrase: "ALL_INFO_COLLECTED". Do not add any other words or punctuation to this specific message.
If the user wants to correct information later, acknowledge their request and ask for the correct details for that specific field.
Start by greeting the user and asking for their name. Once the user provides their name, acknowledge it and then immediately ask for their age.
Speak in English.`;

export const INITIAL_SYSTEM_PROMPT_HINDI = `आप एक मैत्रीपूर्ण और पेशेवर एआई सहायक हैं जो एक क्लिनिक के लिए काम कर रहे हैं। आपका लक्ष्य अपॉइंटमेंट के लिए रोगी की जानकारी एकत्र करना है।
आपको निम्नलिखित जानकारी एकत्र करनी होगी:
1. रोगी का पूरा नाम।
2. रोगी की आयु (0 से 120 के बीच एक संख्या होनी चाहिए)।
3. रोगी का लिंग (पुरुष, महिला, या अन्य)।
4. उनके लक्षणों का विस्तृत विवरण। यदि आवश्यक हो तो अच्छी जानकारी प्राप्त करने के लिए शुरुआत, अवधि, गंभीरता और संबंधित लक्षणों के बारे में अनुवर्ती प्रश्न पूछें।
5. एक 10 अंकों का फ़ोन नंबर।

बातचीत करने वाले, सहानुभूतिपूर्ण और स्पष्ट तरीके से बोलें। एक या दो प्रश्न एक बार में पूछें।
यदि उपयोगकर्ता द्वारा दी गई जानकारी उचित लगती है तो प्रत्येक जानकारी की पुष्टि करें। उदाहरण के लिए, यदि उपयोगकर्ता कहता है कि उसका नाम जॉन है, तो आप अगला प्रश्न पूछने से पहले "समझ गया, जॉन।" कह सकते हैं।
यदि उपयोगकर्ता ऐसी जानकारी प्रदान करता है जो गलत लगती है (उदाहरण के लिए, आयु 200), तो कृपया स्पष्टीकरण मांगें।
एक बार जब आपको विश्वास हो जाए कि आपने सभी पाँच जानकारी एकत्र कर ली है, और केवल तभी, इस सटीक वाक्यांश के साथ उत्तर दें: "ALL_INFO_COLLECTED"। इस विशिष्ट संदेश में कोई अन्य शब्द या विराम चिह्न न जोड़ें।
यदि उपयोगकर्ता बाद में जानकारी सही करना चाहता है, तो उनके अनुरोध को स्वीकार करें और उस विशिष्ट फ़ील्ड के लिए सही विवरण मांगें।
उपयोगकर्ता का अभिवादन करके और उनका नाम पूछकर शुरुआत करें। जब उपयोगकर्ता अपना नाम बता दे, तो उसे स्वीकार करें और फिर तुरंत उनकी उम्र पूछें।
हिंदी में बोलें।`;

export const EXTRACT_DATA_PROMPT = `Based on the following conversation, extract the patient's name, age, gender, symptoms, and phone number.
Respond ONLY with a JSON object in the format: {"name": "...", "age": ..., "gender": "...", "symptoms": "...", "phone": "..."}.
The age should be a number. Gender should be "male", "female", or "other". Phone should be a string of exactly 10 digits (e.g., "1234567890"). If a phone number is provided, DO NOT use null for its value. If any other information is missing or unclear from the conversation, use null for its value in the JSON.
Ensure the JSON is valid.

Conversation:
---
{{CHAT_HISTORY}}
---
JSON Response:`;

export const YES_NO_CONFIRMATION_PROMPT_ENGLISH = (patientInfoSummary: string) =>
`I have the following information for you:
${patientInfoSummary}
Is this information correct? Please say Yes or No.`;

export const YES_NO_CONFIRMATION_PROMPT_HINDI = (patientInfoSummary: string) =>
`मेरे पास आपके लिए निम्नलिखित जानकारी है:
${patientInfoSummary}
क्या यह जानकारी सही है? कृपया हाँ या नहीं में उत्तर दें।`;

export const CORRECTION_REQUEST_PROMPT_ENGLISH = "Okay, what information is incorrect or needs to be changed? For example, you can say 'change my name' or 'my symptoms are different'.";
export const CORRECTION_REQUEST_PROMPT_HINDI = "ठीक है, कौन सी जानकारी गलत है या बदलने की आवश्यकता है? उदाहरण के लिए, आप कह सकते हैं 'मेरा नाम बदलो' या 'मेरे लक्षण अलग हैं'।";

export const LanguageNotSupportedByBrowserTTS = "Your browser does not support speech synthesis for the selected language. Displaying text only.";
export const LanguageNotSupportedByBrowserSTT = "Speech recognition for the selected language is not supported by your browser.";
export const MicrophoneAccessDeniedMessage = "Microphone access was denied. Please enable it in your browser settings to use voice input.";
export const GenericErrorMessage = "An unexpected error occurred. Please try again.";
export const GeminiErrorMesssage = "Sorry, I'm having trouble connecting to the AI. Please try again later.";
export const SpeechRecognitionNotSupportedMessage = "Speech recognition is not supported by your browser. Please type your responses.";
export const SpeechSynthesisNotSupportedMessage = "Speech synthesis is not supported by your browser. AI responses will be text-only.";

export const SpeechRecognitionNetworkError = "A network error occurred during speech recognition. Please check your internet connection and try again.";
export const NoSpeechDetectedError = "No speech was detected. Please make sure your microphone is unmuted and try speaking again.";
export const AudioCaptureError = "Audio capture failed. Please ensure your microphone is selected, unmuted, and working correctly.";

export const HINDI_VOICE_NAME_KEYWORD = "hindi"; // A common keyword in Hindi voice names
export const ENGLISH_VOICE_NAME_KEYWORD = "english";