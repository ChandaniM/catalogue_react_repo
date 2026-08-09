import { Link } from 'react-router-dom';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group block cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl no-underline"
    >
      <div className="min-h-[180px] overflow-hidden bg-gray-100">
        {category.coverImage ? (
          <img
            src={category.coverImage}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] text-white">
            <span className="text-sm font-semibold uppercase tracking-[0.24em]">View items</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-black">{category.name}</h3>
        <p className="mt-2 text-sm text-gray-500">{category.slug.replace('-', ' ')}</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
