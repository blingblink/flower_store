'use client'

import { Fragment, useState, useEffect } from 'react'
import { useSession } from "next-auth/react";
import {
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';
import classNames from 'classnames';


const renderPrimaryCell = (val, column) => {
  if (column.displayConverter)
    return column.displayConverter(val);
  return val;
}

const renderCell = (val, column) => {
  let renderedValue = column.displayConverter ? column.displayConverter(val) : val;
  if (val === null || val === undefined || val === '') renderedValue = '-';
  if (typeof val === 'boolean') {
    if (val) renderedValue = (
      <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
    );
    else renderedValue = (
      <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
    );
  }

  return renderedValue;
};

const SmallList = (props) => {
  const {
    tableName,
    rows,
    columns,
  } = props;

  return (
    <div className="mt-6 sm:hidden">
      <div className="px-4 sm:px-6">
        <h2 className="text-sm font-medium text-gray-900">{tableName}</h2>
      </div>
      <ul role="list" className="mt-3 divide-y divide-gray-100 border-t border-gray-200">
        {rows.map((row, rowIdx) => (
          <li key={`small-breakpoint-list-row-${rowIdx}`}>
            <div
              className="group w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 sm:px-6"
            >
              <span className="truncate text-sm font-medium leading-6">
                {/* {row[columns[0].key]} */}
                {columns[0].href ? (
                  <a href={columns[0].href(row)} className="truncate hover:text-gray-600">
                    {renderPrimaryCell(row[columns[0].key], columns[0])}
                  </a>
                ) : renderPrimaryCell(row[columns[0].key], columns[0])}

                <span className="truncate font-normal text-gray-500">
                  {columns.filter((col, idx) => idx > 0).map(col => (
                    (row[col.key] === null || row[col.key] === undefined) ? '' : (
                      <span className="mx-1" key={`smallest-breakpoint-row-${rowIdx}-cell-${col.key}`}>{renderCell(row[col.key], col)}</span>
                    )
                  ))}
                </span>
              </span>
              <ChevronRightIcon
                className="ml-4 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function ReadOnlyList(props) {
  const {
    pageTitle,
    smallPageTableName,
    columns,
    values,
    children,
    mutate,
    actionButton,
  } = props;

  return (
    <main className="flex-1">
      {pageTitle && (
        <div
          className={classNames(
            "px-4 sm:px-6",
            "border-b border-gray-200 py-4 sm:flex sm:items-center sm:justify-between"
          )}
        >
          {pageTitle && (
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-medium leading-6 text-gray-900 sm:truncate">{pageTitle}</h1>
            </div>
          )}
        </div>
      )}

      {children}

      {/* List (smallest breakpoint only) */}
      <SmallList
        tableName={smallPageTableName}
        rows={values}
        columns={columns}
      />

      {/* Table (small breakpoint and up) */}
      <div className="hidden sm:block">
        <div className="inline-block min-w-full border-b border-gray-200 align-middle">
          <table className="min-w-full">
            <thead>
              <tr className="border-t border-b border-gray-200">
                <th
                  className="bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-900"
                  scope="col"
                >
                  {columns[0].label}
                </th>
                {columns.slice(1).filter(col => !col.hideOnRead).map(col => (
                  <th
                    key={`table-column-key-${col.key}`}
                    className="bg-gray-50 px-6 py-3 text-right text-sm font-semibold text-gray-900"
                    scope="col"
                  >
                    {col.label}
                  </th>
                ))}
                {actionButton && (
                  <th
                    className="bg-gray-50 px-6 py-3 text-right text-sm font-semibold text-gray-900"
                    scope="col"
                  >
                    Hành động
                  </th>
                )}          
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {values.map((row, rowIdx) => (
                <tr key={`table-row-${rowIdx}`} className="bg-white">
                  <td className="w-full max-w-0 whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {columns[0].href ? (
                      <a href={columns[0].href(row)} className="truncate hover:text-gray-600">
                        {renderPrimaryCell(row[columns[0].key], columns[0])}
                      </a>
                    ) : renderPrimaryCell(row[columns[0].key], columns[0])}
                  </td>
                  {columns.filter((col, idx) => idx > 0).map((col) => (
                    <td
                      key={`table-row-${rowIdx}-column-${col.key}`}
                      className={classNames(
                        "px-6 py-4 text-right text-sm text-gray-500",
                      )}
                    >
                      {col.href ? (
                        <a href={col.href(row)} className="truncate hover:text-gray-600">
                          {renderCell(row[col.key], col)}
                        </a>
                      ) : renderCell(row[col.key], col)}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium">
                    {actionButton && actionButton({ order: row, mutate })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}