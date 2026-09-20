import { DEFAULTS } from './defaults';
import type { EyeShape, Hex, LogoShape, ModuleShape, Settings } from './types';

const KEY = 'qr-studio:v1';
const HEX = /^#[0-9a-fA-F]{6}$/;

const MODULES: ModuleShape[] = ['square', 'smooth', 'dots'];
const EYES: EyeShape[] = ['square', 'rounded', 'circle'];
const LOGO_SHAPES: LogoShape[] = ['original', 'rounded', 'circle'];

function isHex(v: unknown): v is Hex {
  return typeof v === 'string' && HEX.test(v);
}

function isBool(v: unknown): v is boolean {
  return typeof v === 'boolean';
}

function numIn(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[]): v is T {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v);
}

/**
 * Menyaring objek tak dikenal menjadi `Partial<Settings>`.
 * Setiap field divalidasi (enum, rentang, format hex); yang tidak valid dibuang
 * sehingga jatuh ke default saat digabung dengan `DEFAULTS`.
 */
export function pickKnown(raw: unknown): Partial<Settings> {
  const out: Partial<Settings> = {};
  if (!raw || typeof raw !== 'object') return out;
  const o = raw as Record<string, unknown>;

  if (numIn(o.logoSize, 10, 30)) out.logoSize = o.logoSize;
  if (oneOf(o.logoShape, LOGO_SHAPES)) out.logoShape = o.logoShape;
  if (isBool(o.logoPlate)) out.logoPlate = o.logoPlate;

  if (isHex(o.fg)) out.fg = o.fg;
  if (isHex(o.fg2)) out.fg2 = o.fg2;
  if (isBool(o.gradient)) out.gradient = o.gradient;
  if (isHex(o.bg)) out.bg = o.bg;
  if (isBool(o.transparent)) out.transparent = o.transparent;
  if (isBool(o.eyeSame)) out.eyeSame = o.eyeSame;
  if (isHex(o.eye)) out.eye = o.eye;

  if (oneOf(o.module, MODULES)) out.module = o.module;
  if (oneOf(o.eyeShape, EYES)) out.eyeShape = o.eyeShape;
  if (o.margin === 2 || o.margin === 3 || o.margin === 4) out.margin = o.margin;

  if (o.exportSize === 512 || o.exportSize === 1024 || o.exportSize === 2048) {
    out.exportSize = o.exportSize;
  }

  return out;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...pickKnown(JSON.parse(raw)) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* penyimpanan diblokir (mode privat) → abaikan */
  }
}

export function clearSettings() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* abaikan */
  }
}
