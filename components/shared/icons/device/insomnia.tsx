export default function Insomnia({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 34 34"
      version="1.1"
      xmlSpace="preserve"
      style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
      className={className}
    >
      <path
        d="M17,32.187c8.387,0 15.186,-6.8 15.186,-15.187c0,-8.387 -6.799,-15.186 -15.186,-15.186c-8.387,0 -15.187,6.799 -15.187,15.186c0,8.387 6.8,15.187 15.187,15.187Z"
        style={{ fill: '#fff', fillRule: 'nonzero' }}
      />
      <path
        d="M17,1c-8.837,0 -16,7.163 -16,16c0,8.837 7.163,16 16,16c8.837,0 16,-7.163 16,-16c0,-8.837 -7.163,-16 -16,-16Zm0,1.627c7.938,0 14.373,6.435 14.373,14.373c0,7.938 -6.435,14.373 -14.373,14.373c-7.938,0 -14.373,-6.435 -14.373,-14.373c0,-7.938 6.435,-14.373 14.373,-14.373Z"
        style={{ fill: '#4000bf', fillRule: 'nonzero' }}
      />
      <path
        d="M17.181,5.61c6.29,0 11.39,5.1 11.39,11.39c0,6.291 -5.1,11.39 -11.39,11.39c-6.291,0 -11.39,-5.099 -11.39,-11.39c0,-1.537 0.305,-3.004 0.857,-4.342c0.806,1.098 2.106,1.811 3.572,1.811c2.447,0 4.43,-1.983 4.43,-4.429c0,-1.467 -0.713,-2.767 -1.811,-3.573c1.338,-0.552 2.804,-0.857 4.342,-0.857Z"
        style={{ fill: 'url(#_Linear1)' }}
      />
      <defs>
        <linearGradient
          id="_Linear1"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(1.39485e-15,-22.7797,22.7797,1.39485e-15,17.1808,28.3899)"
        >
          <stop offset="0" style={{ stopColor: '#7400e1', stopOpacity: 1 }} />
          <stop offset="1" style={{ stopColor: '#4000bf', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
