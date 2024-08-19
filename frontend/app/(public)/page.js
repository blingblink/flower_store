'use client'

import useSWR from 'swr';
import { formatCurrency } from '@/app/utils';

// Linh:
// - Storefront
// - ShoppingCart
// - OrderDetails

// With expandable product details
// With large images and filters sidebar
// With order summary sidebar
// With invoice panels


const collections = [
  {
    name: "Xmas",
    href: '#',
    imageSrc: 'https://chauvinparis.com/wp-content/uploads/elementor/thumbs/ERIC-CHAUVIN-ROUGE-DORE-min-1-oyp29o1ykfsnx8qx9djcdu7vkjzr8zmbb9k9szvi8g.jpg',
    imageAlt: 'Woman wearing a comfortable cotton t-shirt.',
  },
  {
    name: "Sinh nhật",
    href: '#',
    imageSrc: 'https://lzd-img-global.slatic.net/g/p/7cdfd1daa2853e5d1f5d35353491dc8e.jpg_960x960q80.jpg_.webp',
    imageAlt: 'Man wearing a comfortable and casual cotton t-shirt.',
  },
  {
    name: 'Tình yêu',
    href: '#',
    imageSrc: 'https://chauvinparis.com/wp-content/uploads/2020/11/La-Brassee-Genereux-Hiver-600x600.jpg',
    imageAlt: 'Person sitting at a wooden desk with paper note organizer, pencil and tablet.',
  },
]
async function getData(url) {
  const res = await fetch(url);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
 
  return res.json();
}

export default function Home() {
  const { data: trendingProducts} = useSWR(`/api/products/popular`, getData);
  const { data: topSellingProducts } = useSWR(`/api/products/good_selling`, getData);

  return (
    <div className="bg-white">
      <main>
        {/* Hero section */}
        <div className="relative">
          {/* Background image and overlap */}
          <div aria-hidden="true" className="absolute inset-0 hidden sm:flex sm:flex-col">
            <div className="relative w-full flex-1 bg-gray-800">
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src="https://image.plo.vn/1200x630/Uploaded/2023/ymzmf/2023_03_08/hoa-138.jpg.webp"
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="absolute inset-0 bg-gray-900 opacity-50" />
            </div>
            <div className="h-32 w-full bg-white md:h-40 lg:h-48" />
          </div>

          <div className="relative mx-auto max-w-3xl px-4 pb-96 text-center sm:px-6 sm:pb-0 lg:px-8">
            {/* Background image and overlap */}
            <div aria-hidden="true" className="absolute inset-0 flex flex-col sm:hidden">
              <div className="relative w-full flex-1 bg-gray-800">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src="https://tailwindui.com/img/ecommerce-images/home-page-04-hero-full-width.jpg"
                    alt=""
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="absolute inset-0 bg-gray-900 opacity-50" />
              </div>
              <div className="h-48 w-full bg-white" />
            </div>
            <div className="relative py-32">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">BLOOM & WILD</h1>
              <div className="mt-4 sm:mt-6">
                <a
                  href="\products"
                  className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
                >
                  Mua Ngay
                </a>
              </div>
            </div>
          </div>

          <section aria-labelledby="collection-heading" className="relative -mt-96 sm:mt-0">
            <h2 id="collection-heading" className="sr-only">
              Collections
            </h2>
            <div className="mx-auto grid max-w-md grid-cols-1 gap-y-6 px-4 sm:max-w-7xl sm:grid-cols-3 sm:gap-x-6 sm:gap-y-0 sm:px-6 lg:gap-x-8 lg:px-8">
              {collections.map((collection) => (
                <div
                  key={collection.name}
                  className="group relative h-96 rounded-lg bg-white shadow-xl sm:aspect-h-5 sm:aspect-w-4 sm:h-auto"
                >
                  <div>
                    <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="absolute inset-0 overflow-hidden group-hover:opacity-75">
                        <img
                          src={collection.imageSrc}
                          alt={collection.imageAlt}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
                    </div>
                    <div className="absolute inset-0 flex items-end rounded-lg p-6">
                      <div>
                        <p aria-hidden="true" className="text-sm text-white">
                          Chúc mừng
                        </p>
                        <h3 className="mt-1 font-semibold text-white">
                          <a href={collection.href}>
                            <span className="absolute inset-0" />
                            {collection.name}
                          </a>
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section aria-labelledby="trending-heading">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:pt-32">
            <div className="md:flex md:items-center md:justify-between">
              <h2 id="favorites-heading" className="text-2xl font-bold tracking-tight text-gray-900">
                HOT
              </h2>
              <a href="\products" className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block">
                Xem thêm
                <span aria-hidden="true"> &rarr;</span>
              </a>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
              {trendingProducts?.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="h-56 w-full overflow-hidden rounded-md group-hover:opacity-75 lg:h-72 xl:h-80">
                    <img
                      src={product.images[0].src}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <h3 className="mt-4 text-sm text-gray-700">
                    <a href={`/products/${product.id}`}>
                      <span className="absolute inset-0" />
                      {product.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm font-medium text-gray-900">{formatCurrency(product.price)}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-sm md:hidden">
              <a href="\products" className="font-medium text-indigo-600 hover:text-indigo-500">
                Xem thêm
                <span aria-hidden="true"> &rarr;</span>
              </a>
            </div>
          </div>
        </section>

        <section aria-labelledby="trending-heading">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:pt-1">
            <div className="md:flex md:items-center md:justify-between">
              <h2 id="favorites-heading" className="text-2xl font-bold tracking-tight text-gray-900">
              Sản phẩm bán chạy
              </h2>
              <a href="\products" className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block">
                Xem thêm
                <span aria-hidden="true"> &rarr;</span>
              </a>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
              {topSellingProducts?.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="h-56 w-full overflow-hidden rounded-md group-hover:opacity-75 lg:h-72 xl:h-80">
                    <img
                      src={product.images[0].src}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <h3 className="mt-4 text-sm text-gray-700">
                    <a href={`/products/${product.id}`}>
                      <span className="absolute inset-0" />
                      {product.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm font-medium text-gray-900">{formatCurrency(product.price)}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-sm md:hidden">
              <a href="\products" className="font-medium text-indigo-600 hover:text-indigo-500">
                Shop the collection
                <span aria-hidden="true"> &rarr;</span>
              </a>
            </div>
          </div>
        </section>

        
      </main>
    </div>
  )
}
