import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Image } from '@components/Image';
import { useDebounce } from '@hooks/useDebounce';

import styles from './PicturesSlider.module.scss';

type Props = {
  className?: string;
  pictures: string[];
};

const ANIMATION_DURATION = 300;

export const PicturesSlider: React.FC<Props> = ({ className, pictures }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const pictureRefs = useRef<(HTMLImageElement | null)[]>([]);

  const startX = useRef(0);
  const startSliderPos = useRef(0);
  const [sliderPos, setSliderPos] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const [isWheeling, setIsWheeling] = useState(false);

  const stopAnimationCallback = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const [stopAnimation] = useDebounce(
    stopAnimationCallback,
    ANIMATION_DURATION,
  );

  const changeImage = useCallback(
    (index: number) => {
      if (isAnimating) {
        return;
      }

      const item = pictureRefs.current[index];

      if (sliderRef.current && item) {
        stopAnimation();
        setIsAnimating(true);
        setSliderPos(-item.offsetLeft);
      }
    },
    [isAnimating, stopAnimation],
  );

  useEffect(() => {
    if (sliderRef.current && activeImage !== 0) {
      changeImage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pictures]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const firstVifibleRef = entries.filter(
          entry => entry.isIntersecting,
        )[0];

        if (!firstVifibleRef) {
          return;
        }

        const index = pictureRefs.current.indexOf(
          firstVifibleRef.target as HTMLImageElement,
        );

        if (index !== -1) {
          setActiveImage(index);
        }
      },
      {
        threshold: 0.5,
        root: sliderRef.current,
      },
    );

    pictureRefs.current.forEach(pictureRef => {
      if (pictureRef) {
        observer.observe(pictureRef);
      }
    });
  }, [pictures]);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.pointerEvents = isAnimating ? 'none' : 'auto';
    }
  }, [isAnimating]);

  const stopWheelingCallback = useCallback(() => {
    setIsWheeling(false);
    changeImage(activeImage);
  }, [activeImage, changeImage]);

  const [stopWheeling] = useDebounce(stopWheelingCallback, 100);

  useEffect(() => {
    if (!sliderRef.current) {
      return;
    }

    const slider = sliderRef.current;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isAnimating) {
        return;
      }

      let res = 0;

      if (e.deltaX !== 0) {
        res = -e.deltaX;
      } else if (e.shiftKey && e.deltaY !== 0) {
        res = -e.deltaY;
      }

      res = res > 100 ? 100 : res;
      res = res < -100 ? -100 : res;

      stopWheeling();
      setIsWheeling(true);

      setSliderPos(prev => {
        const newPos = prev + res;

        const scrollWidth =
          -slider.offsetWidth * (pictureRefs.current.length - 1);

        return Math.min(0, Math.max(newPos, scrollWidth));
      });
    };

    slider.addEventListener('wheel', handleWheel, {
      passive: false,
    });

    return () => {
      slider.removeEventListener('wheel', handleWheel);
    };
  }, [isAnimating, stopWheeling]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      startSliderPos.current = sliderPos;
      startX.current = e.touches[0].pageX;

      setIsTouching(true);
    },
    [sliderPos],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isAnimating) {
        return;
      }

      const touchEndX = e.touches[0].pageX;
      const delta = touchEndX - startX.current;
      let res = startSliderPos.current + delta * 2.5;

      if (res > 0) {
        startX.current = touchEndX;
        startSliderPos.current = 0;

        res = 0;
      } else if (sliderRef.current) {
        const scrollWidth =
          -sliderRef.current.offsetWidth * (pictureRefs.current.length - 1);

        if (res < scrollWidth) {
          startX.current = touchEndX;
          startSliderPos.current = scrollWidth;

          res = scrollWidth;
        }
      }

      setSliderPos(res);
    },
    [isAnimating],
  );

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
    changeImage(activeImage);
  }, [activeImage, changeImage]);

  return (
    <article
      aria-label="Pictures Slider"
      className={classNames(className, styles['pictures-slider'])}
    >
      <div
        ref={sliderRef}
        className={styles['pictures-slider__slider']}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Pictures"
      >
        {pictures.map((picture, i) => (
          <Image
            key={picture}
            src={picture}
            className={styles['pictures-slider__picture']}
            style={{
              transform: `translateX(${sliderPos}px)`,
              transition:
                isTouching || isWheeling
                  ? 'none'
                  : `transform ${ANIMATION_DURATION / 1000}s`,
            }}
            alt={`Picture ${i + 1}`}
            ref={(el: HTMLImageElement) => (pictureRefs.current[i] = el)}
          />
        ))}
      </div>

      <div aria-label="Contols" className={styles['pictures-slider__controls']}>
        {pictures.map((picture, i) => (
          <Image
            key={picture}
            src={picture}
            className={classNames(styles['pictures-slider__control'], {
              [styles['pictures-slider__control--active']]: i === activeImage,
            })}
            onClick={() => changeImage(i)}
            role="button"
            aria-label={`Picture ${i + 1} of ${pictures.length}`}
          />
        ))}
      </div>
    </article>
  );
};
