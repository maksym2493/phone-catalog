import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Product } from '@sTypes/Product';
import { IconButtonType } from '@sTypes/IconButtonType';

import { IconButton } from '@components/IconButton';
import { SliderList } from '@components/SliderList';

import { useScrollAnimation } from '@hooks/useScrollAnimation';

import styles from './ProductsSlider.module.scss';

type ItemVisibility = {
  item: HTMLElement;
  visibilityRate: number;
};

const findLastInvisibleItem = (
  items: ItemVisibility[],
): [number, ItemVisibility] | void => {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];

    if (item.visibilityRate) {
      if (item.visibilityRate > 0.99) {
        return [i + 1, items[i + 1]];
      }

      return [i, item];
    }
  }
};

const findPrevInvisibleItem = (
  items: ItemVisibility[],
): [number, ItemVisibility] | void => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.visibilityRate) {
      if (item.visibilityRate > 0.99) {
        return [i - 1, items[i - 1]];
      }

      return [i, item];
    }
  }
};

type Props = {
  className?: string;

  title: string;
  products: Product[];
  hidePrevPrice?: boolean;
};

export const ProductsSlider: React.FC<Props> = React.memo(
  function ProductsSlider({
    className,

    title,
    products,
    hidePrevPrice,
  }) {
    const itemsRef = useRef<HTMLElement[]>([]);
    const sliderRef = useRef<HTMLDivElement>(null);

    const scrollTo = useScrollAnimation(300);
    const [itemsVisibility, setItemsVisibility] = useState<ItemVisibility[]>(
      [],
    );

    useEffect(() => {
      if (products.length) {
        const observer = new IntersectionObserver(
          newEntries => {
            setItemsVisibility(prevItems => {
              const newItemsVisibility = [...prevItems];

              for (const entry of newEntries) {
                const target = entry.target;

                const foundItem = newItemsVisibility.find(
                  item => item.item === target,
                );

                foundItem!.visibilityRate = entry.intersectionRatio;
              }

              return newItemsVisibility;
            });
          },
          { root: sliderRef.current, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
        );

        const newItemsVisibility: ItemVisibility[] = [];

        itemsRef.current.forEach(item => {
          observer.observe(item);
          newItemsVisibility.push({ item, visibilityRate: 0 });
        });

        setItemsVisibility(newItemsVisibility);

        return () => {
          observer.disconnect();
        };
      }

      return;
    }, [products.length]);

    const scrollRight = useCallback(() => {
      setItemsVisibility(prevItems => {
        const lastVisibleItem = findLastInvisibleItem(prevItems);

        if (lastVisibleItem && sliderRef.current) {
          const item = prevItems[lastVisibleItem[0]].item;

          scrollTo(sliderRef.current, item);
        }

        return prevItems;
      });
    }, [scrollTo]);

    const scrollLeft = useCallback(() => {
      setItemsVisibility(prevItems => {
        const lastVisibleItem = findPrevInvisibleItem(prevItems);

        if (lastVisibleItem && sliderRef.current) {
          const item = prevItems[lastVisibleItem[0]].item;

          scrollTo(sliderRef.current, item, false);
        }

        return prevItems;
      });
    }, [scrollTo]);

    const leftArrow =
      itemsVisibility.length !== 0
        ? itemsVisibility[0].visibilityRate >= 0.99
        : true;

    const rightArrow =
      itemsVisibility.length !== 0
        ? itemsVisibility.at(-1)!.visibilityRate >= 0.99
        : true;

    return (
      <section
        aria-label={title}
        className={classNames(className, styles['products-slider'])}
      >
        <div className={styles['products-slider__header']}>
          <h2>{title}</h2>

          <div className={styles['products-slider__control-buttons']}>
            <IconButton
              type={IconButtonType.arrowLeft}
              disabled={leftArrow}
              ariaLabel="Previous Page"
              onClick={!leftArrow ? scrollLeft : undefined}
            />

            <IconButton
              type={IconButtonType.arrowRight}
              disabled={rightArrow}
              ariaLabel="Next Page"
              onClick={!rightArrow ? scrollRight : undefined}
            />
          </div>
        </div>

        <SliderList
          title={title}
          sliderRef={sliderRef}
          itemsRef={itemsRef}
          products={products}
          hidePrevPrice={hidePrevPrice}
        />
      </section>
    );
  },
);
