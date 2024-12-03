import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

// Define prop types for type safety and clarity
interface FeaturedInfoItemProps {
  title: string;
  value: string;
  change: number;
  icon?: React.ReactNode;
  positive?: boolean;
}

const FeaturedInfoItem: React.FC<FeaturedInfoItemProps> = ({
  title, 
  value, 
  change, 
  icon,
  positive = change >= 0
}) => {
  const changeColor = positive ? 'text-green-600' : 'text-red-600';
  const ChangeIcon = positive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center flex-wrap">
        <div>
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className="text-xl font-bold mt-1">{value}</p>
          <div className={`flex items-center ${changeColor} text-sm mt-1`}>
            {icon || <ChangeIcon size={16} className="mr-1" />}
            <span>{Math.abs(change)}% {positive ? 'increase' : 'decrease'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedInfo: React.FC = () => {
  // Sample data - could be passed as props or fetched from an API
  const featuredItems = [
    {
      title: 'Revenue',
      value: '$192.1k',
      change: 32,
    },
    {
      title: 'New Customers',
      value: '1340',
      change: -3,
    },
    {
      title: 'New Sales',
      value: '3543',
      change: 7,
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 md:grid-cols-3 gap-4">
      {featuredItems.map((item, index) => (
        <FeaturedInfoItem 
          key={index}
          title={item.title}
          value={item.value}
          change={item.change}
        />
      ))}
    </div>
  );
};

export default FeaturedInfo;