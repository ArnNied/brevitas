import { Timestamp } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

import { NexusExpiryType } from '@/types/nexus';

import type { NexusExpiryTypeStatic, TNexus } from '@/types/nexus';
import type { Dispatch, SetStateAction } from 'react';
import NexusFormInputGroup from './NexusFormInputGroup';

type TExpireStaticInputGroupProps = {
  onChange: Dispatch<
    SetStateAction<
      Pick<TNexus, 'shortened' | 'destination' | 'expiry' | 'password'>
    >
  >;
};

export default function ExpireStaticInputGroup({
  onChange,
}: TExpireStaticInputGroupProps): JSX.Element {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  // https://stackoverflow.com/a/28149561/13359128
  // This is because the input type datetime-local value must be in ISO string format
  // And the ISO string format is in UTC, which is different from the local time of the client
  // So we need to offset the date by the timezone offset
  const startDateISOStringWithOffset = useMemo(() => {
    const tzoffset = startDate.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localISOTime = new Date(startDate.getTime() - tzoffset)
      .toISOString()
      .slice(0, 16);

    return localISOTime;
  }, [startDate]);

  const endDateISOStringWithOffset = useMemo(() => {
    const tzoffset = endDate.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localISOTime = new Date(endDate.getTime() - tzoffset)
      .toISOString()
      .slice(0, 16);

    return localISOTime;
  }, [endDate]);

  useEffect(() => {
    // Set initial values on component mount
    onChange((prev) => {
      return {
        ...prev,
        expiry: {
          type: NexusExpiryType.STATIC,
          start: new Timestamp(
            Math.floor(startDate.getTime() / 1000),
            startDate.getMilliseconds() * 1000000,
          ).toJSON(),
          end: new Timestamp(
            Math.floor(endDate.getTime() / 1000),
            endDate.getMilliseconds() * 1000000,
          ).toJSON(),
        },
      };
    });

    // Reset the expiry type to endless on component unmount as a fallback
    return () => {
      onChange((prev) => {
        return {
          ...prev,
          expiry: {
            type: NexusExpiryType.ENDLESS,
          },
        };
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onDateChange(
    e: React.ChangeEvent<HTMLInputElement>,
    position: 'start' | 'end',
  ): void {
    e.preventDefault();

    const value = e.target.value;

    // Get the date and time from the input since it's in ISO string format
    const [date, time] = value.split('T');
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');

    // Create a new date object with the values from the input
    const dateValue = new Date(
      parseInt(year),
      parseInt(month),
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
    );

    // Create a new timestamp object with the values from the date object
    const timestampSeconds = Math.floor(dateValue.getTime() / 1000);
    const timestampNanoSeconds = dateValue.getMilliseconds() * 1000000;
    const timestampValue = new Timestamp(
      timestampSeconds,
      timestampNanoSeconds,
    ).toJSON();

    const expiryData: Partial<NexusExpiryTypeStatic> = {
      type: NexusExpiryType.STATIC,
    };

    // Insert the new values into the state and the nexus data
    if (position === 'start') {
      setStartDate(dateValue);
      expiryData.start = timestampValue;
    } else if (position === 'end') {
      setEndDate(dateValue);
      expiryData.end = timestampValue;
    }

    onChange((prev) => {
      return {
        ...prev,
        expiry: { ...prev.expiry, ...expiryData },
      };
    });
  }

  return (
    <div className='w-full lg:w-1/2 flex flex-row space-x-4'>
      <NexusFormInputGroup label='Start Date'>
        <input
          type='datetime-local'
          value={startDateISOStringWithOffset}
          onChange={(e): void => onDateChange(e, 'start')}
          className='w-full px-2 py-1 border border-gray-500 rounded-lg'
        />
      </NexusFormInputGroup>
      <NexusFormInputGroup label='End Date'>
        <input
          type='datetime-local'
          value={endDateISOStringWithOffset}
          onChange={(e): void => onDateChange(e, 'end')}
          className='w-full px-2 py-1 border border-gray-500 rounded-lg'
        />
      </NexusFormInputGroup>
    </div>
  );
}
