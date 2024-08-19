import classNames from "classnames";
import { StarIcon } from '@heroicons/react/20/solid'

const StarRating = ({ rating, className, color = 'text-indigo-500'}) => (
    <div className={className}>
        <h3 className="sr-only">Reviews</h3>
        <div className="flex items-center">
            <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((ratingNum) => (
                <StarIcon
                key={ratingNum}
                className={classNames(
                    rating > ratingNum ? color : 'text-gray-300',
                    'h-5 w-5 flex-shrink-0'
                )}
                aria-hidden="true"
                />
            ))}
            </div>
            <p className="sr-only">{rating} out of 5 stars</p>
        </div>
    </div>
);

export default StarRating;
