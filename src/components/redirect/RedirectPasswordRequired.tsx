'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { HTTPStatusCode } from '@/types/response';

import type { TNexus } from '@/types/nexus';
import type { ResponseData } from '@/types/shared';

type RedirectPasswordRequiredProps = {
  nexusId: string;
};

export default function RedirectPasswordRequired({
  nexusId,
}: RedirectPasswordRequiredProps): JSX.Element {
  const router = useRouter();

  const [password, setPassword] = useState<string>('');

  const onSubmitHandler = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        const req = await fetch(`/api/nexus/${nexusId}/`, {
          method: 'POST',
          body: JSON.stringify({ password }),
        });
        const res: ResponseData & TNexus = await req.json();

        if (req.status === HTTPStatusCode.OK) {
          router.push(res.destination);
        } else if (req.status === HTTPStatusCode.UNAUTHORIZED) {
          router.refresh();
        } else {
          alert('Something went wrong');
        }
      } catch (error) {
        alert(error);
      }
    },
    [nexusId, password, router],
  );

  return (
    <>
      <form onSubmit={onSubmitHandler} className='w-full space-y-4'>
        <header className=''>
          <h2 className='font-semibold text-4xl text-center'>
            <span className='text-primary-500'>brevitas.id</span>/{nexusId}
          </h2>
          <p className='text-lg text-center'>Enter a passphrase to continue</p>
        </header>
        <div className='max-w-xs mx-auto space-y-2'>
          <input
            type='password'
            value={password}
            onChange={(e): void => setPassword(e.target.value)}
            className='w-full p-md input-base focus:input-primary'
          />
          <button className='w-full p-md bg-primary-500 text-white rounded'>
            Continue
          </button>
        </div>
      </form>
      <div className='text-sm text-gray-700 text-center'>
        <p>
          This link is generated user content and be carefull for
          phishing/scam/malware. We never ask for your information details.
        </p>
        <p>
          If you received this link within a suspicious email, phone calls, or
          other messages. Please do not go further.
        </p>
        <p>
          <span className='text-primary-500 underline'>Report link</span> if you
          think this link is suspicious.
        </p>
      </div>
    </>
  );
}
