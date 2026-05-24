export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

export const products: Product[] = [
  {
    id: "1",
    slug: "aurora-silk-blazer",
    name: "Aurora Silk Blazer",
    description:
      "Tailored from Italian silk with a subtle sheen. Perfect for evening occasions.",
    price: 489,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
    category: "Outerwear",
  },
  {
    id: "2",
    slug: "obsidian-leather-tote",
    name: "Obsidian Leather Tote",
    description:
      "Hand-stitched full-grain leather with brushed gold hardware.",
    price: 620,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",
    category: "Accessories",
  },
  {
    id: "3",
    slug: "noir-cashmere-scarf",
    name: "Noir Cashmere Scarf",
    description: "Ultra-soft Mongolian cashmere in deep charcoal.",
    price: 195,
    image: "https://images.unsplash.com/photo-1520903928313-86fa9d60a839?w=600&h=800&fit=crop",
    category: "Accessories",
  },
  {
    id: "4",
    slug: "velvet-midnight-dress",
    name: "Velvet Midnight Dress",
    description: "Floor-length velvet with architectural draping.",
    price: 780,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    category: "Dresses",
  },
  {
    id: "5",
    slug: "platinum-chronograph",
    name: "Platinum Chronograph",
    description: "Swiss movement with sapphire crystal and alligator strap.",
    price: 2450,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop",
    category: "Watches",
  },
  {
    id: "6",
    slug: "champagne-pearl-earrings",
    name: "Champagne Pearl Earrings",
    description: "South Sea pearls set in 18k rose gold.",
    price: 890,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop",
    category: "Jewelry",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
