import { getShops } from '@/lib/data';
import { ShopSearch } from '@/components/shop-search';

export default async function HomePage() {
  const shops = await getShops();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl text-primary">
          Find Local Shops & Services
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover what's available in your village. Check open status, product availability, and connect with local businesses instantly.
        </p>
      </section>

      <ShopSearch shops={shops} />
    </div>
  );
}
