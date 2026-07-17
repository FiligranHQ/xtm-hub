import Image from 'next/image';

const imageStyle = {
  width: 'auto',
  height: '100%',
  maxHeight: '280px',
  objectFit: 'contain' as const,
};

const XtmPlatformImage = () => {
  return (
    <>
      <Image
        src="/xtm_platform.png"
        alt="Display Filigran product ecosystem"
        width={1370}
        height={680}
        sizes="(max-width: 768px) 100vw, 50vw"
        style={imageStyle}
        className="hidden dark:block"
        priority
      />
      <Image
        src="/xtm-platform-light.png"
        alt="Display Filigran product ecosystem"
        width={1370}
        height={680}
        sizes="(max-width: 768px) 100vw, 50vw"
        style={imageStyle}
        className="block dark:hidden"
        priority
      />
    </>
  );
};

export default XtmPlatformImage;
