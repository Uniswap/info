import React from "react";

const AddLiquidity = props => (
  <svg width={24} height={24} fill="none" {...props}>
    <rect
      opacity={0.2}
      x={0.5}
      y={0.5}
      width={23}
      height={23}
      rx={11.5}
      stroke="#27AE60"
    />
    <path
      d="M12.875 7h-1.75v4.125H7v1.75h4.125V17h1.75v-4.125H17v-1.75h-4.125V7z"
      fill="#27AE60"
    />
  </svg>
);

const RemoveLiquidity = props => (
  <svg width={24} height={24} fill="none" {...props}>
    <rect
      opacity={0.2}
      x={0.5}
      y={0.5}
      width={23}
      height={23}
      rx={11.5}
      stroke="#FF6871"
    />
    <path stroke="#FF6871" strokeWidth={2} d="M7 12h10" />
  </svg>
);

const TokenSwap = props => (
  <svg width={24} height={24} fill="none" {...props}>
    <rect
      opacity={0.2}
      x={0.5}
      y={0.5}
      width={23}
      height={23}
      rx={11.5}
      stroke="#DC6BE5"
    />
    <g filter="url(#prefix__filter0_d)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.94 9.874a.513.513 0 0 1-.724-.018l-.53-.557a2.051 2.051 0 0 0-2.9-.071l-3.56 3.39 3.375.082a.513.513 0 0 1-.025 1.025l-4.614-.113a.513.513 0 0 1-.5-.525l.114-4.614a.513.513 0 0 1 1.025.025l-.083 3.376 3.56-3.389a3.077 3.077 0 0 1 4.35.107l.53.557a.513.513 0 0 1-.017.725z"
        fill="url(#prefix__paint0_linear)"
      />
    </g>
    <g filter="url(#prefix__filter1_d)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.06 14.641a.513.513 0 0 1 .724.018l.53.557c.782.82 2.08.853 2.9.072l3.56-3.39-3.375-.083a.513.513 0 1 1 .025-1.025l4.614.113a.513.513 0 0 1 .5.526l-.114 4.613a.513.513 0 0 1-1.025-.025l.083-3.376-3.56 3.39a3.077 3.077 0 0 1-4.35-.108l-.53-.557a.513.513 0 0 1 .017-.725z"
        fill="url(#prefix__paint1_linear)"
      />
    </g>
    <defs>
      <filter
        id="prefix__filter0_d"
        x={0}
        y={2}
        width={20.312}
        height={20.238}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={2} />
        <feGaussianBlur stdDeviation={2} />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.13 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
      <filter
        id="prefix__filter1_d"
        x={3.688}
        y={6.277}
        width={20.312}
        height={20.238}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={2} />
        <feGaussianBlur stdDeviation={2} />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.13 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
      <linearGradient
        id="prefix__paint0_linear"
        x1={8.34}
        y1={13.903}
        x2={20.391}
        y2={4.929}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#DC6BE5" />
        <stop offset={1} stopColor="#DC6BE5" stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="prefix__paint1_linear"
        x1={15.66}
        y1={10.613}
        x2={3.609}
        y2={19.586}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#DC6BE5" />
        <stop offset={1} stopColor="#DC6BE5" stopOpacity={0} />
      </linearGradient>
    </defs>
  </svg>
);

const TransactionType = ({ event }) => {
  switch (event) {
    case "AddLiquidity":
      return <AddLiquidity />;
    case "RemoveLiquidity":
      return <RemoveLiquidity />;
    case "Token Swap":
      return <TokenSwap />;
    case "EthPurchase":
      return <TokenSwap />;
    case "TokenPurchase":
      return <TokenSwap />;
    default:
      return null;
  }
};

export default TransactionType;
export { TokenSwap, AddLiquidity, RemoveLiquidity };
