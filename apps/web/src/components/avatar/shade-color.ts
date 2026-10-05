// 色を黒（amount > 0）または白（amount < 0）に寄せる。パーツの輪郭線や影の色を、塗り色から作るのに使う。
export function shadeColor(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const target = amount > 0 ? 0 : 255;
  const ratio = Math.abs(amount);
  const channel = (shift: number) => {
    const c = (value >> shift) & 0xff;
    return Math.round(c + (target - c) * ratio);
  };
  return `rgb(${channel(16)} ${channel(8)} ${channel(0)})`;
}
