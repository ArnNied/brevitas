'use client';

type CustomTextInputProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  value?: string;
};

export default function CustomTextInput({
  id,
  type,
  placeholder,
  onChange,
  value,
}: CustomTextInputProps): JSX.Element {
  return (
    <input
      id={id ?? ''}
      type={type ?? 'text'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className='w-full px-3 py-2 input-base focus:input-primary'
    />
  );
}
