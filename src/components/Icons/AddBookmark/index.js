import React from 'react'

const AddBookmark = ({ width, height }) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={width || 21} height={height || 23} viewBox='0 0 21 23'>
      <g fill='none' fillRule='evenodd'>
        <g>
          <g>
            <path d='M0 0H30.733V30.733H0z' transform='translate(-936 -109) translate(931 105)' />
            <path
              stroke='#A7B6BD'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.5'
              d='M6.403 24.97V8.964c0-2.122 1.72-3.842 3.841-3.842H20.49c2.121 0 3.841 1.72 3.841 3.842V24.97c0 .24-.134.46-.347.57-.214.11-.47.091-.666-.048l-7.578-5.415c-.223-.159-.522-.159-.745 0L7.416 25.49c-.195.14-.452.159-.665.05-.214-.11-.348-.33-.348-.57zM12 12.5L19 12.5M15.5 9L15.5 16'
              transform='translate(-936 -109) translate(931 105)'
            />
          </g>
        </g>
      </g>
    </svg>
  )
}

export default AddBookmark
