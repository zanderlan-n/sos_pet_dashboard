import { useState, useEffect } from 'react';

export const useIsMobile = (screen = 600) => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (window.innerWidth < screen) setIsMobile(true);
    else setIsMobile(false);
    const handleResize = () => {
      if (window.innerWidth < screen) setIsMobile(true);
      else setIsMobile(false);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [screen]);

  return isMobile;
};
