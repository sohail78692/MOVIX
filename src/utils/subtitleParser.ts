import { Subtitle } from '@/types';
import { parseTimeToSeconds, getFileExtension } from './helpers';

export async function parseSubtitleFile(file: File): Promise<Subtitle[]> {
  const text = await file.text();
  const extension = getFileExtension(file.name);

  switch (extension) {
    case 'srt':
      return parseSRT(text);
    case 'vtt':
      return parseVTT(text);
    case 'ass':
    case 'ssa':
      return parseASS(text);
    default:
      throw new Error('Unsupported subtitle format');
  }
}

function parseSRT(text: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const content = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = content.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const timeLine = lines[1];
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/);

    if (!timeMatch) continue;

    const startTime = parseTimeToSeconds(timeMatch[1]);
    const endTime = parseTimeToSeconds(timeMatch[2]);
    const subtitleText = lines.slice(2).join('\n').trim();

    if (subtitleText) {
      subtitles.push({
        startTime,
        endTime,
        text: cleanSubtitleText(subtitleText),
      });
    }
  }

  return subtitles;
}

function parseVTT(text: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const content = text.replace(/^WEBVTT.*?\n\n/i, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = content.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    let timeLineIndex = 0;
    if (!lines[0].includes('-->')) {
      timeLineIndex = 1;
    }

    const timeLine = lines[timeLineIndex];
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}[\.]\d{3}|\d{2}:\d{2}[\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[\.]\d{3}|\d{2}:\d{2}[\.]\d{3})/);

    if (!timeMatch) continue;

    const startTime = parseTimeToSeconds(timeMatch[1]);
    const endTime = parseTimeToSeconds(timeMatch[2]);
    const subtitleText = lines.slice(timeLineIndex + 1).join('\n').trim();

    if (subtitleText) {
      subtitles.push({
        startTime,
        endTime,
        text: cleanVTTTags(subtitleText),
      });
    }
  }

  return subtitles;
}

function parseASS(text: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const lines = text.split(/\r?\n/);
  let inEvents = false;
  let formatOrder: string[] = [];

  for (const line of lines) {
    if (line.startsWith('[Events]')) {
      inEvents = true;
      continue;
    }

    if (line.startsWith('[') && inEvents) {
      break;
    }

    if (inEvents && line.startsWith('Format:')) {
      formatOrder = line.substring(7).split(',').map(s => s.trim().toLowerCase());
      continue;
    }

    if (inEvents && line.startsWith('Dialogue:')) {
      const values = parseASSDialogue(line.substring(9), formatOrder.length);
      const data: Record<string, string> = {};

      for (let i = 0; i < formatOrder.length && i < values.length; i++) {
        data[formatOrder[i]] = values[i];
      }

      const startTime = parseTimeToSeconds(data.start);
      const endTime = parseTimeToSeconds(data.end);
      const subtitleText = cleanASSText(data.text || '');

      if (subtitleText) {
        subtitles.push({
          startTime,
          endTime,
          text: subtitleText,
        });
      }
    }
  }

  return subtitles;
}

function parseASSDialogue(line: string, fieldCount: number): string[] {
  const values: string[] = [];
  let current = '';
  let count = 0;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === ',' && count < fieldCount - 1) {
      values.push(current.trim());
      current = '';
      count++;
    } else {
      current += line[i];
    }
  }
  values.push(current.trim());

  return values;
}

function cleanASSText(text: string): string {
  return text
    .replace(/\{[^}]*\}/g, '')
    .replace(/\\N/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\h/g, ' ')
    .trim();
}

function cleanVTTTags(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

function cleanSubtitleText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\{[^}]+\}/g, '')
    .trim();
}

export function getSubtitleAtTime(subtitles: Subtitle[], time: number): Subtitle | null {
  for (const sub of subtitles) {
    if (time >= sub.startTime && time <= sub.endTime) {
      return sub;
    }
  }
  return null;
}
