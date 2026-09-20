/**
 * Deklarasi minimal untuk `qrcode-generator`.
 * Dipakai agar `stringToBytes` bisa ditimpa (lihat `lib/qr.ts`), karena tipe
 * bawaan paket tidak selalu memuatnya.
 */
declare module 'qrcode-generator' {
  interface QRCode {
    addData(data: string): void;
    make(): void;
    getModuleCount(): number;
    isDark(row: number, col: number): boolean;
  }

  interface QRCodeFactory {
    (typeNumber: number, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'): QRCode;
    stringToBytes?: (s: string) => number[];
  }

  const qrcode: QRCodeFactory;
  export default qrcode;
}
