import { RadioGroup } from '@headlessui/react';

const userTypeOptions = [
  {
    name: 'User',
    description: 'Can only interact with projects they are involved in.',
    value: 'user'
  },
  {
    name: 'Admin',
    description: 'Can create projects.',
    value: 'admin'
  }
];

interface UserTypeRadioGroupProps {
  value: string;
  errors?: string[];
  onChange?(value: string): any;
}

export default function UserTypeRadioGroup({ value, onChange, errors }: UserTypeRadioGroupProps) {
  return (
    <div>
      <RadioGroup value={userTypeOptions.find((o) => o.value === value)} onChange={(o) => onChange(o.value)}>
        <RadioGroup.Label className="block text-sm font-medium text-gray-700">User Type</RadioGroup.Label>
        <div className="space-y-2 mt-1">
          {userTypeOptions.map((opt) => (
            <RadioGroup.Option
              key={opt.value}
              value={opt}
              className={({ active, checked }) =>
                `${active ? 'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-300' : ''}
                ${checked ? 'bg-amber-600 bg-opacity-75 text-white' : 'bg-white'}
                  relative flex cursor-pointer rounded-lg px-5 py-3 shadow focus:outline-none`
              }
            >
              {({ checked }) => (
                <>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <RadioGroup.Label as="p" className={`font-medium  ${checked ? 'text-white' : 'text-gray-900'}`}>
                          {opt.name}
                        </RadioGroup.Label>
                        {opt.description && (
                          <RadioGroup.Description as="span" className={`inline ${checked ? 'text-amber-100' : 'text-gray-500'}`}>
                            {opt.description}
                          </RadioGroup.Description>
                        )}
                      </div>
                    </div>
                    {checked && (
                      <div className="shrink-0 text-white">
                        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                          <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
                          <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
      {errors && <p className="text-red-700 text-sm">{errors.join(', ')}</p>}
    </div>
  );
}
