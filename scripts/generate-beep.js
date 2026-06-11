// 產生計時器提示音效 (assets/sounds/*.wav)，供烘焙定時器倒數結束時播放使用
const fs = require('fs');
const path = require('path');

const sampleRate = 44100;

const writeWav = (filename, samples) => {
  const dataSize = samples.length * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(value * 32767), 44 + i * 2);
  }

  const outDir = path.join(__dirname, '..', 'assets', 'sounds');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, filename), buffer);
  console.log(`${filename} generated`);
};

// 清脆「叮」聲：高頻 + 泛音，快速起音、指數衰減
const generateBell = (frequency = 2200, durationSeconds = 0.14) => {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const samples = new Array(numSamples);
  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 18);
    const tone = Math.sin(2 * Math.PI * frequency * t) * 0.7
      + Math.sin(2 * Math.PI * frequency * 2 * t) * 0.3;
    samples[i] = tone * decay;
  }
  return samples;
};

// 經典短嗶聲（原本的音效）
const generateClassic = (frequency = 1000, durationSeconds = 0.18) => {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const samples = new Array(numSamples);
  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const fade = Math.min(1, (numSamples - i) / (sampleRate * 0.02));
    samples[i] = Math.sin(2 * Math.PI * frequency * t) * 0.6 * fade;
  }
  return samples;
};

// 柔和提示音：低頻、較長淡入淡出
const generateSoft = (frequency = 700, durationSeconds = 0.3) => {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const samples = new Array(numSamples);
  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const fadeIn = Math.min(1, i / (sampleRate * 0.03));
    const fadeOut = Math.min(1, (numSamples - i) / (sampleRate * 0.08));
    samples[i] = Math.sin(2 * Math.PI * frequency * t) * 0.5 * fadeIn * fadeOut;
  }
  return samples;
};

writeWav('beep.wav', generateBell());
writeWav('beep-classic.wav', generateClassic());
writeWav('beep-soft.wav', generateSoft());
