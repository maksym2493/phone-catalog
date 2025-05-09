import classNames from 'classnames';
import { useCallback, useEffect } from 'react';

import { IconType } from '@sTypes/IconType';

import { MenuNav } from '../MenuNav';
import { Icon } from '@components/Icon';
import { NavLinkItem } from '@components/NavLinkItem';

import { menuActions } from '@features/menuSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Counter } from '../Counter';

import styles from './Menu.module.scss';
import { Theme } from '@sTypes/Theme';

export const Menu = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.theme);
  const isMenuOpen = useAppSelector(state => state.menu);

  const favorites = useAppSelector(state => state.favorites);
  const shoppingCart = useAppSelector(state => state.cart);

  // disable scrolling while menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.style.overflowY = 'hidden';
    } else {
      document.documentElement.style.overflowY = '';
    }
  }, [isMenuOpen]);

  const changePage = useCallback(() => {
    dispatch(menuActions.set(false));
  }, [dispatch]);

  return (
    <aside
      className={classNames(styles.menu, {
        [styles['menu--open']]: isMenuOpen,
        [styles['menu--dark']]: theme === Theme.dark,
      })}
    >
      <div className={styles.menu__content}>
        <MenuNav className={styles.menu__top} />

        <div className={styles.menu__bottom}>
          <NavLinkItem
            to="./favorites"
            aria-label="Favorites"
            className={styles['menu__user-icon']}
            onClick={changePage}
          >
            <Icon type={IconType.favorite} wide />
            <Counter count={favorites.length} />
          </NavLinkItem>

          <NavLinkItem
            to="./cart"
            aria-label="Shopping Bag"
            className={styles['menu__user-icon']}
            onClick={changePage}
          >
            <Icon type={IconType.shoppingBag} wide />
            <Counter count={shoppingCart.length} />
          </NavLinkItem>
        </div>
      </div>
    </aside>
  );
};
