import { PropsWithChildren } from 'react';

type NexusFormInputGroupProps = PropsWithChildren & {
  label?: string;
};
export default function NexusFormInputGroup({
  label,
  children,
}: NexusFormInputGroupProps): JSX.Element {
  return (
    <label className='w-full lg:w-1/2 flex flex-col space-y-1'>
      {label && <span>{label}</span>}
      {children}
    </label>
  );
}
