import Link from 'next/link'
import classNames from "classnames";
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid'

const normalPageNumberClass = "inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700";
const selectedPageNumberClass = "inline-flex items-center border-t-2 border-indigo-500 px-4 pt-4 text-sm font-medium text-indigo-600";
const ellipsisClass = "inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"

const Paginator = ({
  className,
  currentPage,
  numPages,
  pathname,
  pageParam='page',
  pageWindow = 3,
  scroll = true,
  queryParams = {},
}) => {
  if (numPages < 1) return;
  const pageNumbers = [];
  const differences = Math.floor(pageWindow / 2);
  const lowerWindow = currentPage <= pageWindow ? 1 : currentPage - differences;
  const upperWindow = currentPage >= numPages - pageWindow ? numPages : Math.max(currentPage + differences, pageWindow);

  for (let i = lowerWindow; i <= upperWindow; i++) {
    if (i >= 1 && i <= numPages) pageNumbers.push(i.toString());
  }
  if (!pageNumbers.includes('1')) {
    pageNumbers.unshift('1', '...');
  }
  if (!pageNumbers.includes(numPages.toString())) {
    pageNumbers.push('...');
    pageNumbers.push(numPages);
  }

  const newQueryParams = {...queryParams};
  delete newQueryParams[pageParam];

  return (
    <div className="w-full flex justify-center ">
        <nav
        className={classNames(
          "w-full flex items-center justify-center md:justify-between border-t border-gray-200 px-4 sm:px-0",
          className,
        )}
      >
        <div className="hidden w-0 md:-mt-px md:flex md:flex-1">
          {currentPage == 1 ? (
            <a
              href="#"
              className="pointer-events-none cursor-default inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
              Trang trước
            </a>
          ) : (
            <Link
              href={{
                pathname,
                query: {
                  ...newQueryParams,
                  [pageParam]: currentPage - 1,
                },
              }}
              className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              scroll={scroll}
            >
              <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
              Trang trước
            </Link>
          )}
        </div>
        <div className="-mt-px flex">
          {pageNumbers.map((pageNumber, index) => (
            <Link
              key={`link-${pageParam}-${pageNumber}-${index}`}
              href={{
                pathname,
                query: {
                  [pageParam]: pageNumber,
                  ...newQueryParams,
                },
              }}
              className={classNames(
                pageNumber === currentPage.toString() && selectedPageNumberClass,
                pageNumber === '...' && ellipsisClass,
                pageNumber !== currentPage.toString() && pageNumber !== '...' && normalPageNumberClass,
              )}
              prefetch={false}
              scroll={scroll}
            >
              {pageNumber}
            </Link>
          ))}
        </div>
        <div className="hidden w-0 md:-mt-px md:flex md:flex-1 md:justify-end">
          {currentPage >= numPages ? (
            <a
              href="#"
              className="pointer-events-none cursor-default	inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              Trang kế
              <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
            </a>
          ) : (
            <Link
              href={{
                pathname,
                query: {
                  [pageParam]: currentPage + 1,
                  ...newQueryParams,
                },
              }}
              className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              scroll={scroll}
            >
              Trang kế
              <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Paginator;