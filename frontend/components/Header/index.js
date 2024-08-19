'use client'

import { Fragment, useState, Suspense, useEffect } from 'react';
import { signIn, useSession } from "next-auth/react"
import Link from 'next/link';
import {  Dialog, Popover, Tab, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import useSWR from 'swr'
import ShoppingCart from './ShoppingCart';
import classNames from 'classnames'
import { UserRoles } from '@/constants';
import { createGuestUser } from '@/app/guestSession';

const navigation = {
  categories: [],
  // categories: [
  //   {
  //     id: 'women',
  //     name: 'Women',
  //     featured: [
  //       {
  //         name: 'New Arrivals',
  //         href: '#',
  //         imageSrc: 'https://tailwindui.com/img/ecommerce-images/mega-menu-category-01.jpg',
  //         imageAlt: 'Models sitting back to back, wearing Basic Tee in black and bone.',
  //       },
  //       {
  //         name: 'Basic Tees',
  //         href: '#',
  //         imageSrc: 'https://tailwindui.com/img/ecommerce-images/mega-menu-category-02.jpg',
  //         imageAlt: 'Close up of Basic Tee fall bundle with off-white, ochre, olive, and black tees.',
  //       },
  //     ],
  //     sections: [
  //       {
  //         id: 'clothing',
  //         name: 'Clothing',
  //         items: [
  //           { name: 'Tops', href: '#' },
  //           { name: 'Dresses', href: '#' },
  //           { name: 'Pants', href: '#' },
  //           { name: 'Denim', href: '#' },
  //           { name: 'Sweaters', href: '#' },
  //           { name: 'T-Shirts', href: '#' },
  //           { name: 'Jackets', href: '#' },
  //           { name: 'Activewear', href: '#' },
  //           { name: 'Browse All', href: '#' },
  //         ],
  //       },
  //       {
  //         id: 'accessories',
  //         name: 'Accessories',
  //         items: [
  //           { name: 'Watches', href: '#' },
  //           { name: 'Wallets', href: '#' },
  //           { name: 'Bags', href: '#' },
  //           { name: 'Sunglasses', href: '#' },
  //           { name: 'Hats', href: '#' },
  //           { name: 'Belts', href: '#' },
  //         ],
  //       },
  //       {
  //         id: 'brands',
  //         name: 'Brands',
  //         items: [
  //           { name: 'Full Nelson', href: '#' },
  //           { name: 'My Way', href: '#' },
  //           { name: 'Re-Arranged', href: '#' },
  //           { name: 'Counterfeit', href: '#' },
  //           { name: 'Significant Other', href: '#' },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     id: 'men',
  //     name: 'Men',
  //     featured: [
  //       {
  //         name: 'New Arrivals',
  //         href: '#',
  //         imageSrc: 'https://tailwindui.com/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg',
  //         imageAlt: 'Drawstring top with elastic loop closure and textured interior padding.',
  //       },
  //       {
  //         name: 'Artwork Tees',
  //         href: '#',
  //         imageSrc: 'https://tailwindui.com/img/ecommerce-images/category-page-02-image-card-06.jpg',
  //         imageAlt:
  //           'Three shirts in gray, white, and blue arranged on table with same line drawing of hands and shapes overlapping on front of shirt.',
  //       },
  //     ],
  //     sections: [
  //       {
  //         id: 'clothing',
  //         name: 'Clothing',
  //         items: [
  //           { name: 'Tops', href: '#' },
  //           { name: 'Pants', href: '#' },
  //           { name: 'Sweaters', href: '#' },
  //           { name: 'T-Shirts', href: '#' },
  //           { name: 'Jackets', href: '#' },
  //           { name: 'Activewear', href: '#' },
  //           { name: 'Browse All', href: '#' },
  //         ],
  //       },
  //       {
  //         id: 'accessories',
  //         name: 'Accessories',
  //         items: [
  //           { name: 'Watches', href: '#' },
  //           { name: 'Wallets', href: '#' },
  //           { name: 'Bags', href: '#' },
  //           { name: 'Sunglasses', href: '#' },
  //           { name: 'Hats', href: '#' },
  //           { name: 'Belts', href: '#' },
  //         ],
  //       },
  //       {
  //         id: 'brands',
  //         name: 'Brands',
  //         items: [
  //           { name: 'Re-Arranged', href: '#' },
  //           { name: 'Counterfeit', href: '#' },
  //           { name: 'Full Nelson', href: '#' },
  //           { name: 'My Way', href: '#' },
  //         ],
  //       },
  //     ],
  //   },
  // ],
  pages: [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Đơn hàng', href: '/orders' },
    { name: 'Theo dõi đơn hàng', href: '/track_orders' },
    { name: 'Quản lý', href: '/platform', protected: true }
  ],
}

const AnonymousAvatar = () => (
  <span className="inline-block h-9 w-9 overflow-hidden rounded-full bg-gray-400">
    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  </span>
);

const getUser = async (url) => {
  const res = await fetch(url);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    // throw new Error('Failed to fetch data')
  }
 
  return res.json();
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  let sessionUser;
  if (session) sessionUser = session.user;
  const isAuthenticated = status === "authenticated" && sessionUser && sessionUser.name;
  const { data: user } = useSWR(isAuthenticated ? "/api/users/me" : null, getUser);

  useEffect(() => {
    if (status === 'unauthenticated') {
      createGuestUser().then(() => {});
    }
  }, [status]);

  return (
    <>
      {/* Mobile menu */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
                <div className="flex px-4 pb-2 pt-5">
                  <button
                    type="button"
                    className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Links */}
                <Tab.Group as="div" className="mt-2">
                  <div className="border-b border-gray-200">
                    <Tab.List className="-mb-px flex space-x-8 px-4">
                      {navigation.categories.map((category) => (
                        <Tab
                          key={category.name}
                          className={({ selected }) =>
                            classNames(
                              selected ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-900',
                              'flex-1 whitespace-nowrap border-b-2 px-1 py-4 text-base font-medium'
                            )
                          }
                        >
                          {category.name}
                        </Tab>
                      ))}
                    </Tab.List>
                  </div>
                  <Tab.Panels as={Fragment}>
                    {navigation.categories.map((category) => (
                      <Tab.Panel key={category.name} className="space-y-10 px-4 pb-8 pt-10">
                        <div className="grid grid-cols-2 gap-x-4">
                          {category.featured.map((item) => (
                            <div key={item.name} className="group relative text-sm">
                              <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                                <img src={item.imageSrc} alt={item.imageAlt} className="object-cover object-center" />
                              </div>
                              <a href={item.href} className="mt-6 block font-medium text-gray-900">
                                <span className="absolute inset-0 z-10" aria-hidden="true" />
                                {item.name}
                              </a>
                              <p aria-hidden="true" className="mt-1">
                                Shop now
                              </p>
                            </div>
                          ))}
                        </div>
                        {category.sections.map((section) => (
                          <div key={section.name}>
                            <p id={`${category.id}-${section.id}-heading-mobile`} className="font-medium text-gray-900">
                              {section.name}
                            </p>
                            <ul
                              role="list"
                              aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                              className="mt-6 flex flex-col space-y-6"
                            >
                              {section.items.map((item) => (
                                <li key={item.name} className="flow-root">
                                  <a href={item.href} className="-m-2 block p-2 text-gray-500">
                                    {item.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>

                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  {navigation.pages.map((page) => {
                    if (page.protected && (
                      !user || user.role !== UserRoles.Admin || user.role !== UserRoles.Employee)
                    ) return;
                    
                    return (
                      <div key={page.name} className="flow-root">
                        <Link href={page.href} className="-m-2 block p-2 font-medium text-gray-900">
                          {page.name}
                        </Link>
                      </div>
                    );
                  })}
                </div>                
                {!isAuthenticated && (
                  <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                    <div className="flow-root">
                      <a href="#" className="-m-2 block p-2 font-medium text-gray-900">
                        Đăng nhập
                      </a>
                    </div>
                    <div className="flow-root">
                      <a href="#" className="-m-2 block p-2 font-medium text-gray-900">
                        Đăng kí
                      </a>
                    </div>
                  </div>
                )}
                

                {isAuthenticated && user && user.role !== UserRoles.Guest && (
                  <a href="/profile" className="space-y-6 border-t border-gray-200 px-4">
                    <span className="sr-only">Your profile</span>
                    <div className="flex items-center">
                      <div>
                        {user.image ? (
                          <img
                            className="inline-block h-9 w-9 rounded-full"
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                          />
                        ) : (
                          <AnonymousAvatar />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{user.name}</p>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">{user.role}</p>
                      </div>
                    </div>
                  </a>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <header className="relative bg-white w-full">
        <nav aria-label="Top" className="px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <button
                type="button"
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
                onClick={() => setOpen(true)}
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <a href="/">
                  <span className="sr-only">Your Company</span>
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                    alt=""
                  />
                </a>
              </div>

              {/* Flyout menus */}
              <Popover.Group className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map((category) => (
                    <Popover key={category.name} className="flex">
                      {({ open }) => (
                        <>
                          <div className="relative flex">
                            <Popover.Button
                              className={classNames(
                                open
                                  ? 'border-indigo-600 text-indigo-600'
                                  : 'border-transparent text-gray-700 hover:text-gray-800',
                                'relative z-10 -mb-px flex items-center border-b-2 pt-px text-sm font-medium transition-colors duration-200 ease-out'
                              )}
                            >
                              {category.name}
                            </Popover.Button>
                          </div>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Popover.Panel className="absolute inset-x-0 top-full z-10 text-sm text-gray-500">
                              {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                              <div className="absolute inset-0 top-1/2 bg-white shadow" aria-hidden="true" />

                              <div className="relative bg-white">
                                <div className="mx-auto max-w-7xl px-8">
                                  <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                                    <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                      {category.featured.map((item) => (
                                        <div key={item.name} className="group relative text-base sm:text-sm">
                                          <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                                            <img
                                              src={item.imageSrc}
                                              alt={item.imageAlt}
                                              className="object-cover object-center"
                                            />
                                          </div>
                                          <a href={item.href} className="mt-6 block font-medium text-gray-900">
                                            <span className="absolute inset-0 z-10" aria-hidden="true" />
                                            {item.name}
                                          </a>
                                          <p aria-hidden="true" className="mt-1">
                                            Shop now
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                                      {category.sections.map((section) => (
                                        <div key={section.name}>
                                          <p id={`${section.name}-heading`} className="font-medium text-gray-900">
                                            {section.name}
                                          </p>
                                          <ul
                                            role="list"
                                            aria-labelledby={`${section.name}-heading`}
                                            className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                          >
                                            {section.items.map((item) => (
                                              <li key={item.name} className="flex">
                                                <a href={item.href} className="hover:text-gray-800">
                                                  {item.name}
                                                </a>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  ))}

                  {navigation.pages.map((page) => {
                    if (page.protected && (
                      !user || ![UserRoles.Admin, UserRoles.Employee].includes(user.role))
                    ) return;
                    
                    return (
                      <Link
                        key={page.name}
                        href={page.href}
                        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                      >
                        {page.name}
                      </Link>
                    );
                  })}
                </div>
              </Popover.Group>

              <div className="ml-auto flex items-center">
                {(!isAuthenticated || user?.role === UserRoles.Guest) && (
                  <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                    <button type="button" onClick={() => signIn()} className="text-sm font-medium text-gray-700 hover:text-gray-800">
                      Sign in
                    </button>
                    <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
                    <Link href="/register" className="text-sm font-medium text-gray-700 hover:text-gray-800">
                      Create account
                    </Link>
                  </div>
                )}

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <Suspense fallback={<div />}>
                    <ShoppingCart />
                  </Suspense>
                </div>

                {/* Avatar */}
                {isAuthenticated && user && user.role !== UserRoles.Guest && (
                  <Link href="/profile" className="ml-4 lg:ml-6 group block flex-shrink-0">
                    <span className="sr-only">Your profile</span>
                    <div className="flex items-center">
                      <div>
                        {user.image ? (
                          <img
                            className="inline-block h-9 w-9 rounded-full"
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                          />
                        ) : (
                          <AnonymousAvatar />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{user.name}</p>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">{user.role}</p>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

    </>
  )
}
