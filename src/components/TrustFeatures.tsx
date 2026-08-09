import { ShieldCheck, Package, Truck } from 'lucide-react';

const features = [
  { icon: <ShieldCheck />, title: '100% AUTHENTIC', subtitle: 'Original products only' },
  { icon: <Package />, title: 'CAREFULLY PACKED', subtitle: 'For safe delivery' },
  { icon: <Truck />, title: 'FAST SHIPPING', subtitle: 'Pan India delivery' },
];

const TrustFeatures: React.FC = () => (
  <div className="flex items-center gap-6">
    {features.map((f, i) => (
      <div key={f.title} className="flex items-center gap-3">
        <div className="p-2 border border-gray-200 rounded-sm text-black">{f.icon}</div>
        <div>
          <div className="text-sm font-semibold uppercase">{f.title}</div>
          <div className="text-xs text-gray-500">{f.subtitle}</div>
        </div>
        {i < features.length - 1 && <div className="h-6 border-r border-gray-200 ml-3" />}
      </div>
    ))}
  </div>
);

export default TrustFeatures;
