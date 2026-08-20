import { Truck } from 'lucide-react';

const ShippingBar = () => (
  <div className="w-full bg-black text-white" style={{ height: 31 }}>
    <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm">
        <Truck size={14} />
        <span className="font-semibold">FREE SHIPPING</span>
        <span className="text-[13px]">on orders above ₹1999</span>
      </div>
    </div>
  </div>
);

export default ShippingBar;
