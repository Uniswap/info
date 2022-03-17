import React from 'react'

const TwitterIcon = ({ width, height, color }) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={width || 15} height={height || 13} viewBox='0 0 15 13'>
      <g fill='none' fillRule='evenodd'>
        <g>
          <g>
            <g>
              <g>
                <path
                  d='M0 0L16 0 16 16 0 16z'
                  transform='translate(-29 -971) translate(28 800) translate(0 169) rotate(-90 8 8)'
                />
                <path
                  stroke={color || '#fff'}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1'
                  d='M13.7 6.235c0 4.53-2.6 7.765-7.15 7.765-2.6 0-3.642-1.35-4.55-2.588m0 0c.02-.004 1.95-.647 1.95-.647C1.779 8.58 1.614 5.344 3.3 3c.8 1.48 2.292 2.846 3.9 3.235C7.262 4.366 8.535 3 10.45 3c1.304 0 2.07.495 2.6 1.294H15l-1.3 1.941'
                  transform='translate(-29 -971) translate(28 800) translate(0 169)'
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

export default TwitterIcon
