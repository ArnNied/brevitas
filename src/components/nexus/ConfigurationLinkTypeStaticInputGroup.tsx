import { Timestamp } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

import { timestampNow } from '@/lib/utils';

import CustomSelect from '../shared/CustomSelect';

import type {
  NexusExpiryTypeStatic,
  NexusCreateRequestData,
} from '@/types/nexus';
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

type ConfigurationLinkTypeStaticInputGroupProps = {
  type: 'start' | 'end';
  setNexusData: Dispatch<SetStateAction<NexusCreateRequestData>>;
};

export default function ConfigurationLinkTypeStaticInputGroup({
  type,
  setNexusData,
}: ConfigurationLinkTypeStaticInputGroupProps): JSX.Element {
  const now = useMemo(() => new Date(), []);

  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth());
  const [day, setDay] = useState<number>(now.getDate());
  const [hour, setHour] = useState<number>(now.getHours());
  const [minute, setMinute] = useState<number>(now.getMinutes());

  const monthList = useMemo(() => getMonthList(), []);
  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  useEffect(() => {
    const dt = new Date(year, month, day, hour, minute);

    setNexusData((prev) => {
      return {
        ...prev,
        expiry: {
          ...(prev.expiry as NexusExpiryTypeStatic),
          [type]: timestampNow(dt.getTime()).toJSON(),
        },
      };
    });
  }, [year, month, day, hour, minute, setNexusData, type]);

  return (
    <fieldset className='w-full'>
      <legend className='font-semibold'>
        {type === 'start' ? 'Start Date' : 'End Date'}
      </legend>
      <div className='flex flex-row space-x-2'>
        <div className='w-full'>
          <label
            className='block'
            htmlFor={`link-configuration-static-${type}-year`}
          >
            Year
          </label>
          <CustomSelect
            id={`link-configuration-static-${type}-year`}
            value={year}
            values={Array.from({ length: 7 }, (_, index) => {
              return now.getFullYear() + index - 2;
            })}
            setValue={setYear}
          />
        </div>
        <div className='w-full'>
          <label
            className='block'
            id={`link-configuration-static-${type}-month`}
          >
            Month
          </label>
          <CustomSelect
            id={`link-configuration-static-${type}-month`}
            display={monthList[month]}
            value={month}
            values={monthList.map((month, index) => {
              return {
                value: index,
                label: month,
              };
            })}
            setValue={setMonth}
          />
        </div>
        <div className='w-full'>
          <label className='block' id={`link-configuration-static-${type}-day`}>
            Day
          </label>
          <CustomSelect
            id={`link-configuration-static-${type}-day`}
            value={day}
            values={Array.from({ length: daysInMonth }, (_, index) => {
              return index + 1;
            })}
            setValue={setDay}
          />
        </div>
      </div>
      <div className='flex flex-row mt-2 space-x-2'>
        <div className='w-full'>
          <label
            className='block'
            id={`link-configuration-static-${type}-hour`}
          >
            Hour
          </label>
          <CustomSelect
            id={`link-configuration-static-${type}-hour`}
            display={hour.toString().padStart(2, '0')}
            value={hour}
            values={Array.from({ length: 24 }, (_, index) => {
              return {
                value: index,
                label: index.toString().padStart(2, '0'),
              };
            })}
            setValue={setHour}
          />
        </div>
        <div className='w-full'>
          <label
            className='block'
            id={`link-configuration-static-${type}-minute`}
          >
            Minute
          </label>
          <CustomSelect
            id={`link-configuration-static-${type}-minute`}
            display={minute.toString().padStart(2, '0')}
            value={minute}
            values={Array.from({ length: 60 }, (_, index) => {
              return {
                value: index,
                label: index.toString().padStart(2, '0'),
              };
            })}
            setValue={setMinute}
          />
        </div>
      </div>
    </fieldset>
  );
}
