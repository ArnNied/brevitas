export function generateString(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
}

function isLeapYear(year: number): 0 | 1 {
  // Leap years are divisible by 4, except for years divisible by 100 but not by 400.
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    return 1;
  } else {
    return 0;
  }
}

export function getMonthList(
  localeName = 'en-US',
  monthFormat: Intl.DateTimeFormatOptions['month'] = 'long',
): string[] {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat })
    .format;

  return [...Array(12).keys()].map((m) =>
    format(new Date(Date.UTC(2021, (m + 1) % 12))),
  );
}

export function getDaysInMonth(year: number, monthIndex: number): number[] {
  // Ensure the monthIndex is within the valid range (0-11)
  if (monthIndex < 0 || monthIndex > 11) {
    throw new Error(
      'Invalid month index. Month index should be between 0 and 11.',
    );
  }

  // Create an array with the number of days in each month (0-based)
  const daysInMonth = [
    31,
    28 + isLeapYear(year),
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  // Return the array for the specified month
  return Array.from(
    { length: daysInMonth[monthIndex] },
    (_, index) => index + 1,
  );
}
