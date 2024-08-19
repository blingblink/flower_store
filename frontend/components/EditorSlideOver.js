import { Fragment } from 'react'
import { useFormik } from 'formik';
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Dropdown from './Dropdown';

const DynamicInput = (props) => {
	const {
		label,
		type,
		inputKey,
		value,
    acceptableValues,
		onChange,
    isCreate,
    disabled,
    onBlur,
    touched,
    errors,
    setFieldValue,  // formik's function
	} = props;
  let disabledBoolean = false;
  if (typeof disabled === 'boolean') disabledBoolean = disabled;
  else if (disabled === 'create' && isCreate) disabledBoolean = true;
  else if (disabled === 'edit' && !isCreate) disabledBoolean = true;

	if (type === 'checkbox') return (
		<div className="relative flex items-start">
      <div className="min-w-0 flex-1 text-sm">
        <label htmlFor={inputKey} className="select-none font-medium text-gray-700">
        	{label}
        </label>
      </div>
      <div className="ml-3 flex h-5 items-center">
        <input
          type="checkbox"
          name={inputKey}
          id={inputKey}
          defaultChecked={value}
          onChange={onChange}
          className="h-6 w-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
          disabled={disabledBoolean}
          onBlur={onBlur}
        />
      </div>
      {touched[inputKey] && errors[inputKey] && (
        <div className="mt-2 max-w-xl text-sm text-red-500">
          <p>{errors[inputKey]}</p>
        </div>
      )}
    </div>
	);
  else if (type === 'multi-checkbox') return (
    <fieldset>
      <legend className="text-lg font-medium text-gray-900">{label}</legend>
      <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
        {acceptableValues.map((acceptableValue) => (
          <div key={acceptableValue.value} className="relative flex items-start py-4">
            <div className="min-w-0 flex-1 text-sm">
              <label htmlFor={`acceptable-values-${acceptableValue.label}`} className="select-none font-medium text-gray-700">
                {acceptableValue.label}
              </label>
            </div>
            <div className="ml-3 flex h-5 items-center">
              <input
                id={`acceptable-values-${acceptableValue.label}`}
                name={`acceptable-values-${acceptableValue.label}`}
                type="checkbox"
                defaultChecked={value.includes(acceptableValue.value)}
                onChange={() => {
                  const newValues = [...value];

                  // If the value is in the array, remove it
                  const index = value.indexOf(acceptableValue.value);
                  if (index > -1) {
                    newValues.splice(index, 1);
                  }
                  // Otherwises, append it to the end
                  else newValues.push(acceptableValue.value);

                  setFieldValue(inputKey, newValues);
                }}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={disabledBoolean}
                onBlur={onBlur}
              />
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
  else if (type === 'dropdown') return (
    <fieldset>
      <legend className="text-lg font-medium text-gray-900">{label}</legend>
      <div className="mt-4">
        <Dropdown
          options={acceptableValues}
          onSelect={(selected) => setFieldValue(inputKey, selected)}
          selectedOption={value}
        />
      </div>
    </fieldset>
  );
  else if (type === 'images') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-900">
          {label}
        </label>
        <ul role="list" className="mt-1 text-sm leading-6">
          {value.map((itemValue, itemValueIdx) => (
            <li key={`${inputKey}-${itemValueIdx}`} className="flex justify-between gap-x-6 py-2">
              <input
                type="text"
                name={`${inputKey}-${itemValueIdx}`}
                id={`${inputKey}-${itemValueIdx}`}
                value={itemValue.src}
                onChange={(evt) => {
                  const temp = [...value];
                  temp[itemValueIdx].src = evt.target.value;
                  setFieldValue(inputKey, temp);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
              />
              <button
                type="button"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
                onClick={() => {
                  const temp = [...value];
                  temp.splice(itemValueIdx, 1);
                  setFieldValue(inputKey, temp);
                }}  
              >
                Xoá
              </button>
            </li>
          ))}
        </ul>

        <div className="flex border-t border-gray-100 pt-6">
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            onClick={() => {
              const temp = [...value];
              temp.push({
                src: '',
              });
              setFieldValue(inputKey, temp);
            }}  
          >
            <span aria-hidden="true">+</span> Thêm ảnh
          </button>
        </div>
      </div>
    );
  }

	return (
		<div>
			<label htmlFor={inputKey} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <div className="mt-1">
        <input
          type={type}
          name={inputKey}
          id={inputKey}
          value={value}
          onChange={onChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
          disabled={disabledBoolean}
          onBlur={onBlur}
        />
      </div>
      {touched[inputKey] && errors[inputKey] && (
        <div className="mt-2 max-w-xl text-sm text-red-500">
          <p>{errors[inputKey]}</p>
        </div>
      )}
		</div>
	);
}

export default function EditorSlideOver(props) {
	const {
		isCreate,
		onCreate,
		onUpdate,
    onDelete,
    columns,
    rowValue,
    open,
    setOpen,
    validationSchema,
  } = props;
  const onSave = isCreate ? onCreate : onUpdate;
  const initialValues = {};
  columns.forEach(col => {
    const value = rowValue[col.key];
    initialValues[col.key] = (value === null || value === undefined) ? col.default : value;
  });


  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await onSave({
        ...rowValue,
        ...formik.values,
      });
    },
  });
  console.log({formik: formik.errors})

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <form onSubmit={formik.handleSubmit} className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-indigo-700 py-6 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-lg font-medium text-white">{isCreate ? 'Tạo Mới' : 'Cập Nhật'}</Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={() => setOpen(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-indigo-300">
                            Get started by filling in the information below to create your new project.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                        	<div className="space-y-6 pt-6 pb-5">
                        		{columns.map((column) => (
                        			<DynamicInput
                        				key={`slideover-dynamic-input-${column.key}`}
                        				label={column.label}
                        				type={column.type}
                                inputKey={column.key}
                                // TODO: Verify the disabledForEdit
                                disabled={column.disabled}
                                isCreate={isCreate}
                                value={formik.values[column.key]}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                touched={formik.touched}
                                errors={formik.errors}
                                acceptableValues={column.acceptableValues}
                                setFieldValue={formik.setFieldValue}
                        			/>
                        		))}
                        	</div>
                        </div>
                      </div>
                    </div>
                    
                  {/* Button group */}
                  <div className="flex">
                    {onDelete && !isCreate && (
                      <div className="flex flex-shrink-0 justify-end px-4 py-4">
                        <button
                          type="button"
                          className="rounded-md border border-gray-300 bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          onClick={async () => {
                            await onDelete({
                              ...rowValue,
                              ...formik.values,
                            });
                            setOpen(false);
                          }}
                        >
                          Xoá
                        </button>
                      </div>
                    )}
                    
                    <div className="grow" />
                      <div className="flex flex-shrink-0 justify-end px-4 py-4">
                        <button
                          type="button"
                          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={() => setOpen(false)}
                        >
                          Huỷ
                        </button>
                        <button
                          type="submit"
                          className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          {isCreate ? 'Tạo' : 'Cập nhật'}
                        </button>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}