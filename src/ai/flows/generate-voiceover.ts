'use server';

import { z } from 'zod';
import { googleVoiceOptions, type GoogleVoiceOption, voiceOptions, type VoiceOption } from '@/lib/types';
import { translateText } from './translate-text';

const GenerateVoiceoverInputSchema = z.object({
  text: z.string().min(1).max(4000).describe('The text to be converted to speech.'),
  voice: z.string().describe('Voice name (Algenib, Antares, Arcturus, etc. or Google TTS voice)'),
  languageCode: z.string().default('en-US').describe('BCP-47 language code'),
  autoTranslate: z.boolean().default(true).describe('Automatically translate text to target language'),
});
export type GenerateVoiceoverInput = z.infer<typeof GenerateVoiceoverInputSchema>;

const GenerateVoiceoverOutputSchema = z.object({
  audioUrl: z.string().describe('Base64 encoded audio data URL'),
  mimeType: z.string().describe('Audio format'),
  duration: z.number().optional(),
  translatedText: z.string().optional().describe('The text that was converted to speech (may be translated)'),
});
export type GenerateVoiceoverOutput = z.infer<typeof GenerateVoiceoverOutputSchema>;

// Map friendly voice names to Google TTS voices based on language
const toGoogleVoice = (voice: string, languageCode: string): string => {
  if (googleVoiceOptions.includes(voice as GoogleVoiceOption)) return voice;
  
  // Language-specific voice mappings for ALL supported languages
  const languageVoiceMap: Record<string, Record<string, string>> = {
    'en-US': { // English (US)
      Algenib: 'en-US-Studio-O',
      Vega: 'en-US-Studio-O',
      Capella: 'en-US-Studio-O',
      Antares: 'en-US-Studio-O',
      Spica: 'en-US-Studio-O',
      Canopus: 'en-US-Studio-O',
      Rigel: 'en-US-Studio-M',
      Arcturus: 'en-US-Studio-M',
      Sirius: 'en-US-Studio-M',
      Deneb: 'en-US-Studio-M',
      Pollux: 'en-US-Studio-M',
      Regulus: 'en-US-Studio-M',
    },
    'hi-IN': { // Hindi (India)
      Algenib: 'hi-IN-Wavenet-A',
      Vega: 'hi-IN-Wavenet-D',
      Capella: 'hi-IN-Wavenet-A',
      Antares: 'hi-IN-Wavenet-D',
      Spica: 'hi-IN-Wavenet-A',
      Canopus: 'hi-IN-Wavenet-D',
      Rigel: 'hi-IN-Wavenet-B',
      Arcturus: 'hi-IN-Wavenet-C',
      Sirius: 'hi-IN-Wavenet-B',
      Deneb: 'hi-IN-Wavenet-C',
      Pollux: 'hi-IN-Wavenet-B',
      Regulus: 'hi-IN-Wavenet-C',
    },
    'bn-IN': { // Bengali (India)
      Algenib: 'bn-IN-Wavenet-A',
      Vega: 'bn-IN-Wavenet-A',
      Capella: 'bn-IN-Wavenet-A',
      Antares: 'bn-IN-Wavenet-A',
      Spica: 'bn-IN-Wavenet-A',
      Canopus: 'bn-IN-Wavenet-A',
      Rigel: 'bn-IN-Wavenet-B',
      Arcturus: 'bn-IN-Wavenet-B',
      Sirius: 'bn-IN-Wavenet-B',
      Deneb: 'bn-IN-Wavenet-B',
      Pollux: 'bn-IN-Wavenet-B',
      Regulus: 'bn-IN-Wavenet-B',
    },
    'gu-IN': { // Gujarati (India)
      Algenib: 'gu-IN-Wavenet-A',
      Vega: 'gu-IN-Wavenet-A',
      Capella: 'gu-IN-Wavenet-A',
      Antares: 'gu-IN-Wavenet-A',
      Spica: 'gu-IN-Wavenet-A',
      Canopus: 'gu-IN-Wavenet-A',
      Rigel: 'gu-IN-Wavenet-B',
      Arcturus: 'gu-IN-Wavenet-B',
      Sirius: 'gu-IN-Wavenet-B',
      Deneb: 'gu-IN-Wavenet-B',
      Pollux: 'gu-IN-Wavenet-B',
      Regulus: 'gu-IN-Wavenet-B',
    },
    'kn-IN': { // Kannada (India)
      Algenib: 'kn-IN-Wavenet-A',
      Vega: 'kn-IN-Wavenet-A',
      Capella: 'kn-IN-Wavenet-A',
      Antares: 'kn-IN-Wavenet-A',
      Spica: 'kn-IN-Wavenet-A',
      Canopus: 'kn-IN-Wavenet-A',
      Rigel: 'kn-IN-Wavenet-B',
      Arcturus: 'kn-IN-Wavenet-B',
      Sirius: 'kn-IN-Wavenet-B',
      Deneb: 'kn-IN-Wavenet-B',
      Pollux: 'kn-IN-Wavenet-B',
      Regulus: 'kn-IN-Wavenet-B',
    },
    'ml-IN': { // Malayalam (India)
      Algenib: 'ml-IN-Wavenet-A',
      Vega: 'ml-IN-Wavenet-D',
      Capella: 'ml-IN-Wavenet-A',
      Antares: 'ml-IN-Wavenet-D',
      Spica: 'ml-IN-Wavenet-A',
      Canopus: 'ml-IN-Wavenet-D',
      Rigel: 'ml-IN-Wavenet-B',
      Arcturus: 'ml-IN-Wavenet-C',
      Sirius: 'ml-IN-Wavenet-B',
      Deneb: 'ml-IN-Wavenet-C',
      Pollux: 'ml-IN-Wavenet-B',
      Regulus: 'ml-IN-Wavenet-C',
    },
    'mr-IN': { // Marathi (India)
      Algenib: 'mr-IN-Wavenet-A',
      Vega: 'mr-IN-Wavenet-A',
      Capella: 'mr-IN-Wavenet-A',
      Antares: 'mr-IN-Wavenet-A',
      Spica: 'mr-IN-Wavenet-A',
      Canopus: 'mr-IN-Wavenet-A',
      Rigel: 'mr-IN-Wavenet-B',
      Arcturus: 'mr-IN-Wavenet-C',
      Sirius: 'mr-IN-Wavenet-B',
      Deneb: 'mr-IN-Wavenet-C',
      Pollux: 'mr-IN-Wavenet-B',
      Regulus: 'mr-IN-Wavenet-C',
    },
    'ta-IN': { // Tamil (India)
      Algenib: 'ta-IN-Wavenet-A',
      Vega: 'ta-IN-Wavenet-D',
      Capella: 'ta-IN-Wavenet-A',
      Antares: 'ta-IN-Wavenet-D',
      Spica: 'ta-IN-Wavenet-A',
      Canopus: 'ta-IN-Wavenet-D',
      Rigel: 'ta-IN-Wavenet-B',
      Arcturus: 'ta-IN-Wavenet-C',
      Sirius: 'ta-IN-Wavenet-B',
      Deneb: 'ta-IN-Wavenet-C',
      Pollux: 'ta-IN-Wavenet-B',
      Regulus: 'ta-IN-Wavenet-C',
    },
    'te-IN': { // Telugu (India)
      Algenib: 'te-IN-Wavenet-A',
      Vega: 'te-IN-Wavenet-A',
      Capella: 'te-IN-Wavenet-A',
      Antares: 'te-IN-Wavenet-A',
      Spica: 'te-IN-Wavenet-A',
      Canopus: 'te-IN-Wavenet-A',
      Rigel: 'te-IN-Wavenet-B',
      Arcturus: 'te-IN-Wavenet-B',
      Sirius: 'te-IN-Wavenet-B',
      Deneb: 'te-IN-Wavenet-B',
      Pollux: 'te-IN-Wavenet-B',
      Regulus: 'te-IN-Wavenet-B',
    },
    'es-ES': { // Spanish (Spain)
      Algenib: 'es-ES-Standard-A',
      Vega: 'es-ES-Wavenet-C',
      Capella: 'es-ES-Standard-A',
      Antares: 'es-ES-Wavenet-C',
      Spica: 'es-ES-Standard-A',
      Canopus: 'es-ES-Wavenet-C',
      Rigel: 'es-ES-Standard-B',
      Arcturus: 'es-ES-Wavenet-B',
      Sirius: 'es-ES-Standard-B',
      Deneb: 'es-ES-Wavenet-B',
      Pollux: 'es-ES-Standard-B',
      Regulus: 'es-ES-Wavenet-B',
    },
    'fr-FR': { // French (France)
      Algenib: 'fr-FR-Wavenet-A',
      Vega: 'fr-FR-Wavenet-C',
      Capella: 'fr-FR-Wavenet-E',
      Antares: 'fr-FR-Wavenet-C',
      Spica: 'fr-FR-Wavenet-A',
      Canopus: 'fr-FR-Wavenet-E',
      Rigel: 'fr-FR-Wavenet-B',
      Arcturus: 'fr-FR-Wavenet-D',
      Sirius: 'fr-FR-Wavenet-B',
      Deneb: 'fr-FR-Wavenet-D',
      Pollux: 'fr-FR-Wavenet-B',
      Regulus: 'fr-FR-Wavenet-D',
    },
    'de-DE': { // German
      Algenib: 'de-DE-Wavenet-A',
      Vega: 'de-DE-Wavenet-C',
      Capella: 'de-DE-Wavenet-F',
      Antares: 'de-DE-Wavenet-C',
      Spica: 'de-DE-Wavenet-A',
      Canopus: 'de-DE-Wavenet-F',
      Rigel: 'de-DE-Wavenet-B',
      Arcturus: 'de-DE-Wavenet-D',
      Sirius: 'de-DE-Wavenet-E',
      Deneb: 'de-DE-Wavenet-D',
      Pollux: 'de-DE-Wavenet-B',
      Regulus: 'de-DE-Wavenet-E',
    },
    'it-IT': { // Italian
      Algenib: 'it-IT-Wavenet-A',
      Vega: 'it-IT-Wavenet-B',
      Capella: 'it-IT-Wavenet-A',
      Antares: 'it-IT-Wavenet-B',
      Spica: 'it-IT-Wavenet-A',
      Canopus: 'it-IT-Wavenet-B',
      Rigel: 'it-IT-Wavenet-C',
      Arcturus: 'it-IT-Wavenet-D',
      Sirius: 'it-IT-Wavenet-C',
      Deneb: 'it-IT-Wavenet-D',
      Pollux: 'it-IT-Wavenet-C',
      Regulus: 'it-IT-Wavenet-D',
    },
    'ja-JP': { // Japanese
      Algenib: 'ja-JP-Wavenet-A',
      Vega: 'ja-JP-Wavenet-B',
      Capella: 'ja-JP-Wavenet-A',
      Antares: 'ja-JP-Wavenet-B',
      Spica: 'ja-JP-Wavenet-A',
      Canopus: 'ja-JP-Wavenet-B',
      Rigel: 'ja-JP-Wavenet-C',
      Arcturus: 'ja-JP-Wavenet-D',
      Sirius: 'ja-JP-Wavenet-C',
      Deneb: 'ja-JP-Wavenet-D',
      Pollux: 'ja-JP-Wavenet-C',
      Regulus: 'ja-JP-Wavenet-D',
    },
    'ko-KR': { // Korean
      Algenib: 'ko-KR-Wavenet-A',
      Vega: 'ko-KR-Wavenet-B',
      Capella: 'ko-KR-Wavenet-A',
      Antares: 'ko-KR-Wavenet-B',
      Spica: 'ko-KR-Wavenet-A',
      Canopus: 'ko-KR-Wavenet-B',
      Rigel: 'ko-KR-Wavenet-C',
      Arcturus: 'ko-KR-Wavenet-D',
      Sirius: 'ko-KR-Wavenet-C',
      Deneb: 'ko-KR-Wavenet-D',
      Pollux: 'ko-KR-Wavenet-C',
      Regulus: 'ko-KR-Wavenet-D',
    },
    'pt-BR': { // Portuguese (BR)
      Algenib: 'pt-BR-Wavenet-A',
      Vega: 'pt-BR-Wavenet-C',
      Capella: 'pt-BR-Wavenet-A',
      Antares: 'pt-BR-Wavenet-C',
      Spica: 'pt-BR-Wavenet-A',
      Canopus: 'pt-BR-Wavenet-C',
      Rigel: 'pt-BR-Wavenet-B',
      Arcturus: 'pt-BR-Wavenet-B',
      Sirius: 'pt-BR-Wavenet-B',
      Deneb: 'pt-BR-Wavenet-B',
      Pollux: 'pt-BR-Wavenet-B',
      Regulus: 'pt-BR-Wavenet-B',
    },
  };

  // Try language-specific mapping
  if (languageVoiceMap[languageCode]?.[voice]) {
    return languageVoiceMap[languageCode][voice];
  }

  // Fallback to en-US
  return languageVoiceMap['en-US'][voice] || 'en-US-Studio-O';
};

export async function generateVoiceover(input: GenerateVoiceoverInput): Promise<GenerateVoiceoverOutput> {
  try {
    let textToSpeak = input.text;

    // Force autoTranslate to true if not explicitly set to false
    const shouldTranslate = input.autoTranslate !== false;

    // Translate text if language is not English and autoTranslate is enabled
    if (shouldTranslate && input.languageCode !== 'en-US') {
      console.log(`Translating text to ${input.languageCode}...`);
      try {
        const translation = await translateText({
          text: input.text,
          targetLanguage: input.languageCode,
        });
        textToSpeak = translation.translatedText;
        console.log(`Translated: ${textToSpeak.substring(0, 100)}...`);
      } catch (translationError: any) {
        console.error('Translation failed, using original text:', translationError.message);
        // Continue with original text if translation fails
      }
    }

    const voiceName = toGoogleVoice(input.voice, input.languageCode);
    const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API key not found. Set GOOGLE_TTS_API_KEY or GEMINI_API_KEY in your environment.');
    }

    console.log(`Generating TTS: ${input.voice} → ${voiceName} (${input.languageCode})`);

    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input: { text: textToSpeak },
        voice: {
          languageCode: input.languageCode,
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TTS API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    if (!audioContent) {
      throw new Error('No audio content returned from TTS API');
    }

    const wordCount = textToSpeak.split(/\s+/).length;
    const estimatedDuration = Math.ceil(wordCount / 2.5);

    return {
      audioUrl: `data:audio/mp3;base64,${audioContent}`,
      mimeType: 'audio/mp3',
      duration: estimatedDuration,
      translatedText: textToSpeak,
    };
  } catch (error: any) {
    console.error('TTS Generation Error:', error);
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error('TTS quota exceeded. Please wait or upgrade your plan.');
    }
    if (error.message?.includes('billing') || error.message?.includes('403')) {
      throw new Error('TTS requires billing to be enabled on your Google Cloud project. Visit: https://console.cloud.google.com/billing');
    }
    
    throw new Error(`Failed to generate voiceover: ${error.message || 'Unknown error'}`);
  }
}