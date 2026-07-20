import Image from 'next/image';

const imageClassName = 'h-auto w-full object-contain';

const XtmPlatformImage = () => {
  return (
    <>
      <Image
        src="/xtm_platform.png"
        alt="Display Filigran product ecosystem"
        width={1370}
        height={680}
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`${imageClassName} hidden dark:block`}
        priority
      />
      <Image
        src="/xtm-platform-light.png"
        alt="Display Filigran product ecosystem"
        width={1370}
        height={680}
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`${imageClassName} block dark:hidden`}
        priority
      />
    </>
  );
};

export default XtmPlatformImage;
