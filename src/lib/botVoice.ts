// Tiny speech-synthesis helper for the Helper Bot.
const KEY = "membrance_bot_voice";

export const isBotVoiceOn = () => {
  try { return localStorage.getItem(KEY) === "true"; } catch { return false; }
};

export const setBotVoice = (on: boolean) => {
  try { localStorage.setItem(KEY, String(on)); } catch { /* ignore */ }
  if (!on) stopBotSpeech();
};

export const stopBotSpeech = () => {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
};

/** Speaks text only when the user enabled bot voice in Settings. */
export const botSpeak = (text: string, force = false) => {
  if (!force && !isBotVoiceOn()) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, "").slice(0, 320));
    u.rate = 1.02;
    u.pitch = 1.25;
    u.volume = 0.9;
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
};
