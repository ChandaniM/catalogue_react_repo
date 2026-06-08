import { Link } from 'react-router-dom';
import { Folder } from 'lucide-react';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  productCount?: number;
}

const CategoryCard = ({ category, productCount }: CategoryCardProps) => {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative block cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent hover:border-[var(--primary)] bg-gray-50 p-3 shadow-sm hover:shadow-xl transition-all duration-300 no-underline"
    >
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-200">
        {category.coverImage ? (
          <img
            src={category.coverImage}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--primary-light)] text-[var(--primary)]">
            <Folder size={40} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <h3 className="font-display font-semibold text-xs sm:text-sm text-[var(--charcoal)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
          {category.name}
        </h3>
        {productCount !== undefined && (
          <span className="text-[10px] bg-[var(--primary-light)] text-[var(--primary)] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">
            {productCount} {productCount === 1 ? 'Gift' : 'Gifts'}
          </span>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;
