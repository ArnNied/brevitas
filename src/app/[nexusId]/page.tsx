import { updateDoc, serverTimestamp } from 'firebase/firestore';
import { redirect } from 'next/navigation';

import RedirectPasswordRequired from '@/components/redirect/RedirectPasswordRequired';
import { getAndValidateNexus } from '@/lib/nexus';
import { NexusResponse } from '@/types/response';

type NexusRedirectPageProps = {
  params: { nexusId: string };
};

export default async function NexusRedirectPage({
  params: { nexusId },
}: NexusRedirectPageProps): Promise<JSX.Element> {
  let status: NexusResponse;
  let message: string = '';
  let subMessage: string[] = [];

  let docUpdateError = false;

  const validatedNexus = await getAndValidateNexus(nexusId);

  if (!validatedNexus.success) {
    status = validatedNexus.message;

    if (status === NexusResponse.NOT_FOUND) {
      message = 'Link Not Found';
      subMessage = [
        'The link you are trying to access does not exist.',
        'Please check the link and try again or contact the owner if you think this is a mistake.',
      ];
    } else if (status === NexusResponse.STATUS_INACTIVE) {
      message = 'Link Inactive';
      subMessage = [
        'The link you are trying to access is inactive.',
        'Please contact the owner if you think this is a mistake.',
      ];
    } else if (status === NexusResponse.TOO_EARLY) {
      message = 'Too Early';
      subMessage = [
        'The link is not active yet.',
        'Please try again later or contact the owner if you think this is a mistake.',
      ];
    } else if (status === NexusResponse.EXPIRED) {
      message = 'Link Expired';
      subMessage = [
        'The link you are trying to access has expired.',
        'Please contact the owner if you think this is a mistake.',
      ];
    } else {
      message = 'Something went wrong';
      subMessage = ['Something went wrong while trying to access the link.'];
    }
  } else if (validatedNexus.nexusData.password) {
    status = NexusResponse.PASSWORD_REQUIRED;
  } else {
    status = NexusResponse.FOUND;
    const { nexusData, nexusDocRef } = validatedNexus;

    try {
      await updateDoc(nexusDocRef, {
        lastVisited: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);

      docUpdateError = true;
    }

    if (!docUpdateError) {
      redirect(nexusData.destination);
    } else {
      message = 'Something went wrong';
      subMessage = ['Something went wrong while trying to access the link.'];
    }
  }

  return (
    <section className='grid items-center mt-12 px-8 py-16 bg-white space-y-4 shadow-md rounded container'>
      {status === NexusResponse.PASSWORD_REQUIRED && (
        <RedirectPasswordRequired nexusId={nexusId} />
      )}
      {(!validatedNexus.success || docUpdateError) && (
        <header className='text-center'>
          <h2 className='mb-2 font-bold text-5xl text-primary-500'>
            {message}
          </h2>
          {subMessage.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </header>
      )}
    </section>
  );
  // return <div>{message}</div>;
}
