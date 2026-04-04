const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_BASE = 'https://api.sarvam.ai';

async function translateToEnglish(text) {
  if (!SARVAM_API_KEY) {
    console.warn('SARVAM_API_KEY not set, returning original text');
    return text;
  }

  if (!text || typeof text !== 'string') return text;

  try {
    const res = await fetch(`${SARVAM_BASE}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        input: text,
        source_language: 'auto-detect',
        target_language: 'en',
        speaker_gender: 'Male',
        mode: 'formal',
        enable_glossary: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Sarvam translate error:', res.status, errText);
      return text;
    }

    const data = await res.json();
    return data.translated_text || text;
  } catch (err) {
    console.error('Sarvam translate exception:', err.message);
    return text;
  }
}

async function generateVoiceInstruction(step) {
  if (!SARVAM_API_KEY) {
    console.warn('SARVAM_API_KEY not set, returning plain text instruction');
    if (typeof step === 'string') return step;
    return step?.label || step?.instruction || '';
  }

  let instructionText = '';
  if (typeof step === 'string') {
    instructionText = step;
  } else if (step && typeof step === 'object') {
    instructionText = step.instruction || step.label || '';
  }

  if (!instructionText) return '';

  try {
    const res = await fetch(`${SARVAM_BASE}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        inputs: [instructionText],
        target_language_code: 'en-IN',
        speaker: 'meera',
        pitch: 0,
        pace: 1,
        loudness: 1,
        speech_sample_rate: 22050,
        enable_pre_processing: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Sarvam TTS error:', res.status, errText);
      return instructionText;
    }

    const data = await res.json();
    return data.audios?.[0] || instructionText;
  } catch (err) {
    console.error('Sarvam TTS exception:', err.message);
    return instructionText;
  }
}

module.exports = { translateToEnglish, generateVoiceInstruction };
