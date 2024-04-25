const Loader = () => {
  return (
    <div className="absolute inset-0 z-50 m-auto h-20 w-20">
      <svg
        viewBox="0 0 29 29"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <style>
          {`
          .animated-circle {
            animation: expandCircle 3.5s ease-in-out infinite alternate;
          }
          @keyframes expandCircle {
            0% {
              r: 12;
            }
            25%,
            100% {
              r: 14.5;
            }
          }
          .animate-vertical {
            fill: currentColor;
            animation: changeHeight 3.5s ease-in-out infinite alternate;
          }
          @keyframes changeHeight {
            0%,
            20% {
              height: 0;
            }
          }
          .animate-vertical-reverse {
            fill: currentColor;
            transform: scaleY(-1) translateY(-46px);
            animation: changeHeight 3.5s ease-in-out infinite alternate;
          }
          .animate-horizontal {
            fill: currentColor;
            animation: changeWidth 3.5s linear infinite alternate;
          }
          @keyframes changeWidth {
            0%,
            70% {
              width: 0;
            }
          }
        `}
        </style>

        <mask
          id="a"
          width="29"
          height="29"
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: 'alpha' }}>
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M14.5 29C22.508 29 29 22.508 29 14.5S22.508 0 14.5 0 0 6.492 0 14.5 6.492 29 14.5 29Zm0-1.776c7.027 0 12.724-5.697 12.724-12.724 0-7.028-5.697-12.724-12.724-12.724-7.028 0-12.724 5.696-12.724 12.724 0 7.027 5.696 12.724 12.724 12.724Z"
            clipRule="evenodd"
          />
        </mask>
        <g mask="url(#a)">
          <circle
            cx="14.5"
            cy="14.5"
            r="14.5"
            fill="currentColor"
            className="animated-circle"
            strokeWidth="2"
          />
        </g>

        {/* Rectangles */}
        <rect
          className="animate-vertical"
          x="4.48454"
          y="4.18558"
          width="1.79381"
          height="20.6289"
        />
        <rect
          className="animate-vertical"
          x="8.96907"
          y="1.79382"
          width="1.79381"
          height="25.4124"
        />
        <rect
          className="animate-vertical"
          x="13.4536"
          y="0.597931"
          width="1.79381"
          height="26.9072"
        />
        <rect
          className="animate-vertical-reverse"
          x="18.2371"
          y="18.2371"
          width="1.79381"
          height="9.26804"
        />
        <rect
          className="animate-horizontal"
          x="18.2371"
          y="18.2371"
          width="9.26804"
          height="1.79381"
        />
        <rect
          className="animate-horizontal"
          x="18.2371"
          y="21.5258"
          width="3.58763"
          height="1.79381"
        />
        <rect
          className="animate-horizontal"
          x="13.4536"
          y="13.7526"
          width="14.6495"
          height="1.79381"
        />
        <rect
          className="animate-horizontal"
          x="13.4536"
          y="9.26804"
          width="13.4536"
          height="1.79381"
        />
        <rect
          className="animate-horizontal"
          x="13.4536"
          y="4.48453"
          width="11.06"
          height="1.79381"
        />
      </svg>
    </div>
  );
};

export default Loader;
