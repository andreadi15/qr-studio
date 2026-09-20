import type { Hex } from './types';

export interface Preset {
  name: string;
  fg: Hex;
  fg2: Hex;
  gradient: boolean;
  bg: Hex;
  eyeSame: boolean;
  eye: Hex;
}

export const PRESETS: Preset[] = [
  {
    name: 'Tinta',
    fg: '#151A2C',
    fg2: '#2B4BFF',
    gradient: false,
    bg: '#FFFFFF',
    eyeSame: true,
    eye: '#151A2C',
  },
  {
    name: 'Kobalt',
    fg: '#2340E0',
    fg2: '#2B4BFF',
    gradient: false,
    bg: '#FFFFFF',
    eyeSame: false,
    eye: '#0B1B7A',
  },
  {
    name: 'Hutan',
    fg: '#1B6B3A',
    fg2: '#2B4BFF',
    gradient: false,
    bg: '#F1F8EC',
    eyeSame: false,
    eye: '#0B3B1E',
  },
  {
    name: 'Senja',
    fg: '#D6249F',
    fg2: '#3A3FE0',
    gradient: true,
    bg: '#FFFFFF',
    eyeSame: true,
    eye: '#151A2C',
  },
  {
    name: 'Kunyit',
    fg: '#7A3E00',
    fg2: '#2B4BFF',
    gradient: false,
    bg: '#FFF3D1',
    eyeSame: true,
    eye: '#7A3E00',
  },
];
