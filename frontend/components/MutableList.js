'use client'

import { Fragment, useState, useEffect } from 'react'
import { useSession } from "next-auth/react";
import {
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';
import classNames from 'classnames';
import EditorSlideOver from './EditorSlideOver';

const SmallList = (props) => {
  const {
    tableName,
    rows,
    columns,
    setIsCreate,
    setRowValue,
    setSlideOverOpen,
  } = props;

  return (
    <div className="mt-6 sm:hidden">
      <div className="px-4 sm:px-6">
        <h2 className="text-sm font-medium text-gray-900">{tableName}</h2>
      </div>
      <ul role="list" className="mt-3 divide-y divide-gray-100 border-t border-gray-200">
        {rows.map((row, rowIdx) => (
          <li key={`small-breakpoint-list-row-${rowIdx}`}>
            <button
              className="group w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 sm:px-6"
              onClick={() => {
                setIsCreate(false);
                setRowValue(value);
                setSlideOverOpen(true);
              }}
            >
              <span className="flex items-center space-x-3 truncate">
                <span
                  className="w-2.5 h-2.5 flex-shrink-0 rounded-full"
                  aria-hidden="true"
                />
                <span className="truncate text-sm font-medium leading-6">
                  {row[columns[0].key]}
                  <span className="truncate font-normal text-gray-500">
                    {columns.filter((col, idx) => idx > 0 && !col.hideOnRead).map(col => (
                      (row[col.key] === null || row[col.key] === undefined) ? '' : (
                        <span className="mx-1" key={`smallest-breakpoint-row-${rowIdx}-cell-${col.key}`}>{row[col.key]}</span>
                      )
                    ))}
                  </span>
                </span>
              </span>
              <ChevronRightIcon
                className="ml-4 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const formatValues = (values, columns) => {
  columns.forEach(col => {
    if (col.formatter) {
      values.forEach((row, idx) => {
        console.log({ col, row })
        row[col.key] = col.formatter(row[col.key]);
      })
    }
  })
  return values;
}

export default function MutableList(props) {
  const {
    pageTitle,
    smallPageTableName,
    smallPageComponents,
    columns,
    values,
    createButtonText,
    onCreate,
    onUpdate,
    onDelete,
    validationSchema,
    resource,
    children,
  } = props;
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [mutableRows, setMutableRows] = useState(formatValues(values, columns));
  const [rowValue, setRowValue] = useState({});

  const { data: session } = useSession();
  const isSignedIn = !!(session);
  const { user } = session || {};
//   const hasWriteAccess = hasPermission({ user, resource: resource, action: 'write' });
//   const hasReadAccess = hasPermission({ user, resource: resource, action: 'read' });
  const hasWriteAccess = true;
  const hasReadAccess = true;

  useEffect(() => {
    setMutableRows(values);
  }, [values]);

  if (!hasReadAccess) return;
  if (!mutableRows) return;

  const onRowUpdate = async (rowValue) => {
    if (!onUpdate) return;

    // Update the display table
    const newRows = [...mutableRows];
    const rowIdx = newRows.findIndex(row => row.id === rowValue.id);
    newRows[rowIdx] = rowValue;
    setMutableRows(newRows);

    await onUpdate(rowValue);
    setSlideOverOpen(false);
    setRowValue({});
  }

  const onRowCreate = async (rowValue) => {
    if (!onCreate) return;

    // Update the display table
    setMutableRows([...mutableRows, rowValue]);

    await onCreate(rowValue);
    setSlideOverOpen(false);
    setRowValue({});
  }

  const onRowDelete = async (rowValue) => {
    if (!onDelete) return;

    // Update the display table
    setMutableRows(mutableRows.filter(row => row.id !== rowValue.id));

    await onDelete(rowValue);
    setSlideOverOpen(false);
    setRowValue({});
  }

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
    if (column.type === 'multi-checkbox') {
      // Note: `val`, for this type, is an array of IDs.
      renderedValue = (
        <div className="min-w-max">
          <ul role="list">
            {val.map((singleValue) => {
              const labelIdx = column.acceptableValues.findIndex(acceptableValue => acceptableValue.value === singleValue);
              return (
                <li key={singleValue}>
                  {column.acceptableValues[labelIdx].label}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return renderedValue;
  };

  return (
    <main className="flex-1">
      {(pageTitle || (hasWriteAccess && createButtonText)) && (
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
          {hasWriteAccess && createButtonText && onCreate && (
            <div className="mt-4 flex sm:mt-0 sm:ml-4">
              <button
                type="button"
                className="order-0 inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:order-1 sm:ml-3"
                onClick={() => {
                  setIsCreate(true);
                  setRowValue({});
                  setSlideOverOpen(true);
                }}
              >
                {createButtonText}
              </button>
            </div>
          )}
        </div>
      )}

      {children}

      {/* List (smallest breakpoint only) */}
      <SmallList
        tableName={smallPageTableName}
        rows={mutableRows}
        columns={columns}
        setIsCreate={setIsCreate}
        setRowValue={setRowValue}
        setSlideOverOpen={setSlideOverOpen}
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
                {hasWriteAccess && (
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
              {mutableRows.map((row, rowIdx) => (
                <tr key={`table-row-${rowIdx}`} className="bg-white">
                  <td className="w-full max-w-0 whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {columns[0].href ? (
                      <a href={columns[0].href(row)} className="truncate hover:text-gray-600">
                        {renderPrimaryCell(row[columns[0].key], columns[0])}
                      </a>
                    ) : renderPrimaryCell(row[columns[0].key], columns[0])}
                  </td>
                  {columns.filter((col, idx) => idx > 0 && !col.hideOnRead).map((col) => (
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
                  {hasWriteAccess && (
                    <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium">
                      <button
                        type="button"
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          setIsCreate(false);
                          setRowValue(row);
                          setSlideOverOpen(true);
                        }}
                      >
                        Chỉnh sửa
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <EditorSlideOver
        open={isSlideOverOpen}
        isCreate={isCreate}
        setOpen={setSlideOverOpen}
        onUpdate={onRowUpdate}
        onCreate={onRowCreate}
        onDelete={onRowDelete}
        columns={columns}
        rowValue={rowValue}
        validationSchema={validationSchema}
      />
    </main>
  );
}