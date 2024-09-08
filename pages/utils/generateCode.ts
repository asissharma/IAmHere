export function generateValidationCode(offset: number = 0): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + offset); // Adjust for offset

  const minutes = now.getMinutes();
  const dayOfMonth = now.getDate();
  const lastDigitOfDay = dayOfMonth % 10;
  const hour = now.getHours();
  const sumOfHourAndMinute = (hour + minutes);

  return `${minutes}-${lastDigitOfDay}-${sumOfHourAndMinute}`;
}