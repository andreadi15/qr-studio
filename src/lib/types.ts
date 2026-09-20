export type ModuleShape = 'square' | 'smooth' | 'dots';
export type EyeShape = 'square' | 'rounded' | 'circle';
export type LogoShape = 'original' | 'rounded' | 'circle';
export type Hex = `#${string}`;

export interface Settings {
  // logo
  logoSize: number; // 10..30 (persen)
  logoShape: LogoShape;
  logoPlate: boolean;
  // warna
  fg: Hex;
  fg2: Hex;
  gradient: boolean;
  bg: Hex;
  transparent: boolean;
  eyeSame: boolean;
  eye: Hex;
  // bentuk
  module: ModuleShape;
  eyeShape: EyeShape;
  margin: 2 | 3 | 4;
  // ekspor
  exportSize: 512 | 1024 | 2048;
}

export interface RenderInput {
  matrix: boolean[][]; // matrix[row][col] = modul gelap
  settings: Settings;
  logo: HTMLImageElement | null;
}
