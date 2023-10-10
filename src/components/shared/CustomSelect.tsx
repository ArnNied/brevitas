import { useFloating, flip, shift, offset } from '@floating-ui/react-dom';
import { Listbox } from '@headlessui/react';
import { clsx } from 'clsx';

type CustomSelectProps<T extends string | number> = {
  id?: string;
  display?: string;
  value: T;
  values: T[] | { value: T; label: string }[];
  setValue: (value: T) => void;
  width?: string;
};

export default function CustomSelect<T extends string | number>({
  id,
  display,
  value,
  values,
  setValue,
  width,
}: CustomSelectProps<T>): JSX.Element {
  const { refs, floatingStyles } = useFloating({
    // 8px == 0.5rem == mt-2
    middleware: [offset(8), flip(), shift()],
  });

  return (
    <Listbox as='div' value={value} onChange={setValue} className='relative'>
      <Listbox.Button
        id={id}
        ref={refs.setReference}
        className={({ open }): string =>
          clsx(
            'w-full h-full p-md text-start rounded input-base capitalize',
            width,
            {
              'input-primary': open,
              'w-full': !width,
            },
          )
        }
      >
        {display ?? value}
      </Listbox.Button>
      <Listbox.Options
        ref={refs.setFloating}
        style={floatingStyles}
        className='absolute w-full max-h-[25rem] bg-white py-1 rounded shadow-md overflow-y-auto z-10'
      >
        {values.map((value, index) => (
          <Listbox.Option
            key={index}
            value={typeof value === 'object' ? value.value : value}
            // className='p-sm hover:bg-gray-200'
            className={({ selected }): string =>
              clsx('p-sm cursor-pointer', {
                'bg-primary-100 text-primary-700': selected,
                'hover:bg-gray-200': !selected,
              })
            }
          >
            {typeof value === 'object' ? value.label : value}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  );
}
