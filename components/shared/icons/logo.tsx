export default function Logo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024" className={className}>
      <defs>
        <linearGradient
          id="stub-linear-gradient"
          x1="509.27"
          y1="60.03"
          x2="509.27"
          y2="653.28"
          gradientTransform="translate(869.42 2.63) rotate(90)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#57534e" />
          <stop offset="1" stopColor="#292524" />
        </linearGradient>
        <linearGradient id="stub-linear-gradient-2" x1="424.45" y1="11.76" x2="600.9" y2="1012.46" gradientUnits="userSpaceOnUse">
          <stop offset="0.34" stopColor="#fbbf24" />
          <stop offset="0.62" stopColor="#e48e10" />
          <stop offset="0.79" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <g>
        <rect
          x="216.14"
          y="215.27"
          width="593.24"
          height="593.24"
          transform="translate(-21.68 1001.12) rotate(-87.42)"
          style={{ fill: 'url(#stub-linear-gradient)' }}
        />
        <path
          d="M877.54,522.15c-7.94-16.63-18.31-32.86-33.65-46.79C780.84,418.09,660,434,619.82,440c-80.16,12.05-187.29,57.61-252,63-60,5-138,5.17-147-49-6-36,24-78,69-108,88.52-59,230.09-112.6,318-143L561,305.52a42.38,42.38,0,0,0,77.1,35.19l86.23-188.88a46.62,46.62,0,0,0-23-61.76L512.41,3.84a42.37,42.37,0,0,0-35.19,77.09L579.43,127.6c-49.51,17.19-112.77,41.74-184.61,66.4-134,46-273.3,153-260,260,23,185,252,144,392,98,83-27.28,252.16-64.47,275,11,21.78,72-68.57,147.55-382.35,256.45l46.09-101a42.37,42.37,0,1,0-77.09-35.19L302.24,872.17a46.61,46.61,0,0,0,23,61.76l188.89,86.23a42.37,42.37,0,1,0,35.19-77.09L445.6,895.7C707.41,818.18,851.19,728.52,886.82,616,894.08,580.48,890.27,548.8,877.54,522.15Z"
          style={{ fill: 'url(#stub-linear-gradient-2)' }}
        />
      </g>
    </svg>
  );
}
