import { Timestamp } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

import type { NexusExpiryTypeStatic, TNexusRequestData } from '@/types/nexus';
import type { Dispatch, SetStateAction } from 'react';

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

  return Array.from({ length: 12 }, (_, m) =>
    format(new Date(Date.UTC(2023, m % 12))),
  );
}

export function getDaysInMonth(year: number, monthIndex: number): number {
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
  return daysInMonth[monthIndex];
}

type DatetimeValue = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

type ConfigurationLinkTypeStaticInputGroupProps = {
  type: 'start' | 'end';
  setNexusData: Dispatch<SetStateAction<TNexusRequestData>>;
};

export default function ConfigurationLinkTypeStaticInputGroup({
  type,
  setNexusData,
}: ConfigurationLinkTypeStaticInputGroupProps): JSX.Element {
  const now = useMemo(() => new Date(), []);

  const [datetime, setDatetime] = useState<DatetimeValue>({
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  });

  const monthList = useMemo(() => getMonthList(), []);
  const daysInMonth = useMemo(
    () => getDaysInMonth(datetime.year, datetime.month),
    [datetime.year, datetime.month],
  );

  useEffect(() => {
    const dt = new Date(
      datetime.year,
      datetime.month,
      datetime.day,
      datetime.hour,
      datetime.minute,
    );

    setNexusData((prev) => {
      return {
        ...prev,
        expiry: {
          ...(prev.expiry as NexusExpiryTypeStatic),
          [type]: new Timestamp(dt.getTime() / 1000, 0).toJSON(),
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datetime]);

  return (
    <fieldset className='w-full space-y-2'>
      <legend className='font-semibold'>
        {type === 'start' ? 'Start Date' : 'End Date'}
      </legend>
      <div className='flex flex-row space-x-2'>
        <label className='w-full'>
          <span className='block'>Year</span>
          <select
            value={datetime.year}
            onChange={(e): void => {
              setDatetime((prev) => ({
                ...prev,
                year: parseInt(e.target.value),
              }));
            }}
            className='w-full p-md bg-transparent appearance-none input-base focus:input-primary rounded'
          >
            {Array.from({ length: 5 }, (_, index) => (
              <option key={index}>{now.getFullYear() + index}</option>
            ))}
          </select>
        </label>
        <label className='w-full'>
          <span className='block'>Month</span>
          <select
            value={datetime.month}
            onChange={(e): void => {
              setDatetime((prev) => ({
                ...prev,
                month: parseInt(e.target.value),
              }));
            }}
            className='w-full p-md bg-transparent appearance-none input-base focus:input-primary rounded'
          >
            {monthList.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </label>
        <label className='w-full'>
          <span className='block'>Day</span>
          <select
            value={datetime.day}
            onChange={(e): void => {
              setDatetime((prev) => ({
                ...prev,
                day: parseInt(e.target.value),
              }));
            }}
            className='w-full p-md bg-transparent appearance-none input-base focus:input-primary rounded'
          >
            {Array.from({ length: daysInMonth }, (_, index) => (
              <option key={index}>{index + 1}</option>
            ))}
          </select>
        </label>
      </div>
      <div className='flex flex-row space-x-2'>
        <label className='w-full'>
          <span className='block'>Hour</span>
          <select
            value={datetime.hour}
            onChange={(e): void => {
              setDatetime((prev) => ({
                ...prev,
                hour: parseInt(e.target.value),
              }));
            }}
            className='w-full p-md bg-transparent appearance-none input-base focus:input-primary rounded'
          >
            {Array.from({ length: 24 }, (_, index) => (
              <option key={index} value={index}>
                {index.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </label>
        <label className='w-full'>
          <span className='block'>Minute</span>
          <select
            value={datetime.minute}
            onChange={(e): void => {
              setDatetime((prev) => ({
                ...prev,
                minute: parseInt(e.target.value),
              }));
            }}
            className='w-full p-md bg-transparent appearance-none input-base focus:input-primary rounded'
          >
            {Array.from({ length: 60 }, (_, index) => (
              <option key={index} value={index}>
                {index.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}
