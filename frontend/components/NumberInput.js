import { PlusIcon, MinusIcon } from '@heroicons/react/20/solid'

const NumberInput = ({ value, onChange, onIncrease, onDecrease }) => (
  <div className="inline-flex items-center justify-center rounded-md shadow-sm">
    <div className="relative -mr-px block">
      <button
        type="button"
        className="relative inline-flex items-center rounded-l-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
        onClick={onDecrease}
      >
        <span className="sr-only">Decrement number</span>
        <MinusIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
    <input
      type="number"
      className="block w-14 text-center flex-1 border-0 py-1.5 font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-md sm:leading-6"
      value={value}
      // onChange={evt => onChange(evt.target.value)}
      disabled
    />
    <div className="relative -ml-px block">
      <button
        type="button"
        className="relative inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
        onClick={onIncrease}
      >
        <span className="sr-only">Increment number</span>
        <PlusIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  </div>
)

export default NumberInput;