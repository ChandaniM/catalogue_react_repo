interface ProductStockStatusProps {
  quantity?: number;
  className?: string;
}

const ProductStockStatus = ({ quantity, className = '' }: ProductStockStatusProps) => {
  const status = quantity === undefined || !Number.isFinite(quantity)
    ? { label: 'Availability unknown', style: 'bg-gray-100 text-gray-700' }
    : quantity <= 0
      ? { label: 'Sold out', style: 'bg-red-100 text-red-700' }
      : quantity <= 5
        ? { label: `Only ${quantity} left`, style: 'bg-amber-100 text-amber-800' }
        : { label: 'In stock', style: 'bg-green-100 text-green-800' };

  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.style} ${className}`}>
      {status.label}
    </span>
  );
};

export default ProductStockStatus;
