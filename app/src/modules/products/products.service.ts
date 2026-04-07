import { logger } from '../../core/logger/index.js';

/**
 * Product service – abstraction layer for SHOPLINE Product API.
 * When live credentials are available, replace mock implementations
 * with actual SHOPLINE Admin API calls.
 */

interface ShoplineProduct {
  id: string;
  title: string;
  handle: string;
  status: string;
  variants: ShoplineVariant[];
  image?: { src: string };
}

interface ShoplineVariant {
  id: string;
  title: string;
  price: string;
  sku: string;
  inventoryQuantity: number;
}

export const productService = {
  /**
   * Fetch products from SHOPLINE Admin API.
   * TODO: Replace with real API call when credentials are available.
   */
  async listProducts(_shopDomain: string, _accessToken: string): Promise<ShoplineProduct[]> {
    logger.warn('productService.listProducts: Using mock data – no live SHOPLINE API configured');

    // Mock data for development
    return [
      {
        id: 'prod_mock_001',
        title: 'Mystery Figure Series A',
        handle: 'mystery-figure-a',
        status: 'active',
        variants: [
          { id: 'var_001', title: 'Default', price: '29.99', sku: 'MFA-001', inventoryQuantity: 100 },
        ],
        image: { src: 'https://placehold.co/400x400?text=Mystery+Box+A' },
      },
      {
        id: 'prod_mock_002',
        title: 'Mystery Figure Series B',
        handle: 'mystery-figure-b',
        status: 'active',
        variants: [
          { id: 'var_002', title: 'Default', price: '49.99', sku: 'MFB-001', inventoryQuantity: 50 },
        ],
        image: { src: 'https://placehold.co/400x400?text=Mystery+Box+B' },
      },
      {
        id: 'prod_mock_003',
        title: 'Collectible Blind Bag',
        handle: 'collectible-blind-bag',
        status: 'active',
        variants: [
          { id: 'var_003', title: 'Default', price: '14.99', sku: 'CBB-001', inventoryQuantity: 200 },
        ],
        image: { src: 'https://placehold.co/400x400?text=Blind+Bag' },
      },
    ];
  },

  /**
   * Fetch a single product by ID from SHOPLINE.
   */
  async getProduct(_shopDomain: string, _accessToken: string, productId: string): Promise<ShoplineProduct | null> {
    logger.warn('productService.getProduct: Using mock data');
    const products = await this.listProducts(_shopDomain, _accessToken);
    return products.find((p) => p.id === productId) ?? null;
  },
};
