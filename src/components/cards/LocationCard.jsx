import React from 'react';
import { cn } from '@/lib/utils';
import TetrisIcon from '@/components/tetris/TetrisIcon';
import Badge from '@/components/ui/Badge';

/**
 * LocationCard - כרטיס מיקום
 * Displays a location with address, hours, tip, and rating
 */
const LocationCard = ({
  name,
  category,
  address,
  hours,
  tip,
  phone,
  rating,
  featured = false,
  className,
}) => {
  return (
    <article
      dir="rtl"
      className={cn(
        'p-6',
        'bg-off-white',
        'border-3 border-off-black',
        'shadow-brutalist',
        'hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]',
        'transition-all duration-200',
        className
      )}
    >
      <div className="flex flex-row-reverse items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-off-black text-right mb-1">{name}</h3>
          {category && <Badge color="bg-tetris-green">{category}</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <TetrisIcon icon="map-pin" size={20} className="text-tetris-orange" />
        </div>
      </div>

      {address && (
        <p className="text-sm text-dark-gray text-right mb-2">{address}</p>
      )}

      {hours && (
        <p className="text-sm text-dark-gray text-right mb-2">{hours}</p>
      )}

      {rating && (
        <div className="flex flex-row-reverse gap-1 mb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <TetrisIcon
              key={i}
              icon="star"
              size={16}
              className={i < Math.round(rating) ? 'text-tetris-yellow' : 'text-light-gray'}
            />
          ))}
          <span className="text-xs text-dark-gray ms-2">{rating}</span>
        </div>
      )}

      {tip && (
        <div className="mt-4 pt-4 border-t-3 border-light-gray">
          <p className="text-sm text-off-black text-right">
            <span className="font-bold">טיפ: </span>{tip}
          </p>
        </div>
      )}

      {phone && (
        <a
          href={`tel:${phone}`}
          className={cn(
            'inline-flex flex-row-reverse items-center gap-2 mt-3',
            'text-sm font-medium text-off-black',
            'hover:text-tetris-purple transition-colors'
          )}
        >
          <TetrisIcon icon="phone" size={16} />
          <span>{phone}</span>
        </a>
      )}
    </article>
  );
};

export default LocationCard;
