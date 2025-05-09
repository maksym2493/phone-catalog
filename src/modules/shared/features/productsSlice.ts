/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Product } from '@sTypes/Product';
import { ProductCategory } from '@sTypes/ProductCategory';
import { getProducts } from '@services/products';

export const NAME = 'products';

interface Phone extends Product {
  category: ProductCategory.phones;
}

interface Tablet extends Product {
  category: ProductCategory.tablets;
}

interface Accessory extends Product {
  category: ProductCategory.accessories;
}

export interface Products {
  phones: Phone[];
  tablets: Tablet[];
  accessories: Accessory[];
}

type State = {
  error: string;
  isLoaded: boolean;
  isLoading: boolean;

  products: Products;
};

const getEmptyProducts = (): Products => ({
  phones: [],
  tablets: [],
  accessories: [],
});

const initialState: State = {
  error: '',
  isLoaded: false,
  isLoading: false,

  products: getEmptyProducts(),
};

export const loadProducts = createAsyncThunk(`${NAME}/loadProducts`, () => {
  return getProducts();
});

const productsSlice = createSlice({
  name: NAME,
  initialState,
  reducers: {},

  extraReducers(builder) {
    builder.addCase(loadProducts.pending, state => {
      state.error = '';
      state.isLoading = true;
    });

    builder.addCase(
      loadProducts.fulfilled,
      (state, action: PayloadAction<Product[]>) => {
        state.isLoaded = true;
        state.isLoading = false;
        state.products = getEmptyProducts();

        for (const product of action.payload) {
          switch (product.category) {
            case ProductCategory.phones:
              state.products.phones.push(product as Phone);
              break;

            case ProductCategory.tablets:
              state.products.tablets.push(product as Tablet);
              break;

            case ProductCategory.accessories:
              state.products.accessories.push(product as Accessory);
              break;
          }
        }
      },
    );

    builder.addCase(loadProducts.rejected, state => {
      state.isLoading = false;
      state.error = 'Something went wrong!';
    });
  },
});

export default productsSlice.reducer;
