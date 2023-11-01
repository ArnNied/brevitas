import { Transition, Dialog } from '@headlessui/react';
import { clsx } from 'clsx';
import { Fragment } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

type ModalProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  subtitle: string;
  open: boolean;
  onClose: () => void;
  primary?: boolean;
};

export function Modal({
  children,
  title,
  subtitle,
  open,
  onClose,
  primary,
}: ModalProps): JSX.Element {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/25 backdrop-blur-[2px]' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel
                className={clsx(
                  'relative w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all',
                  primary ? 'p-6' : 'p-4',
                )}
              >
                <button
                  onClick={onClose}
                  className='absolute top-0 right-0 m-4'
                >
                  <AiOutlineClose size={25} />
                </button>
                <header>
                  <Dialog.Title
                    as='h3'
                    className={clsx(
                      'font-bold',
                      primary && 'w-fit mx-auto text-gradient',
                      primary ? 'text-4xl' : 'text-xl',
                    )}
                  >
                    {title}
                  </Dialog.Title>
                  <Dialog.Description
                    className={clsx(
                      'mt-1 mb-4',
                      primary && 'text-center text-gray-500',
                    )}
                  >
                    {subtitle}
                  </Dialog.Description>
                </header>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
