// 生年月日（YYYY-MM-DD）から、基準日時点の満年齢を出す。
export function computeAge(birthDate: string, today: Date = new Date()): number {
  const [year, month, day] = birthDate.split("-").map(Number) as [number, number, number];
  let age = today.getFullYear() - year;
  const beforeBirthday =
    today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age;
}
