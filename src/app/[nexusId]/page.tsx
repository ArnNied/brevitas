'use client';

import { ResponseData } from '@/types/shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type NexusRedirectPageProps = {
  params: { nexusId: string };
};
export default function NexusRedirectPage({
  params,
}: NexusRedirectPageProps): JSX.Element {
  const router = useRouter();

  console.log(params.nexusId);

  useEffect(() => {
    async function fetchNexus(): Promise<void> {
      try {
        const req = await fetch(`/api/nexus/${params.nexusId}`);

        if (req.status === 200) {
          const { destination }: ResponseData & { destination: string } =
            await req.json();

          router.push(destination);
        } else {
          const { message }: ResponseData = await req.json();

          alert(message);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchNexus().catch((err) => {
      console.error(err);
    });
  }, []);

  return <div>redirecting...</div>;
}
