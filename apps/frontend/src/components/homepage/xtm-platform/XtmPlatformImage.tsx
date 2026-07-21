import XtmPlatformDark from '@public/xtm_platform.svg';
import XtmPlatformLight from '@public/xtm_platform_light.svg';

const imageClassName = 'h-auto w-full max-h-60 object-contain';
const imageAriaLabel = 'Display Filigran product ecosystem';

const XtmPlatformImage = () => {
  return (
    <>
      <XtmPlatformDark
        role="img"
        aria-label={imageAriaLabel}
        className={`${imageClassName} hidden dark:block`}
      />
      <XtmPlatformLight
        role="img"
        aria-label={imageAriaLabel}
        className={`${imageClassName} block dark:hidden`}
      />
    </>
  );
};

export default XtmPlatformImage;
