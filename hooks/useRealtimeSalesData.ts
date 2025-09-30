import { useState, useEffect, useCallback } from 'react';

export interface SaleDataPoint {
  time: string;
  sales: number;
}

export interface LatestPayment {
  id: string;
  amount: number;
  product: string;
  customer: string;
  time: string;
}

export interface SalesData {
  totalRevenue: number;
  cumulativeRevenueData: SaleDataPoint[];
  salesCount: number;
  averageSale: number;
  salesChartData: SaleDataPoint[];
  latestPayments: LatestPayment[];
}

// Mock data generators
const generateRandomSale = (): number => {
  return Math.random() * 500 + 10; // $10 - $510
};

const generateRandomProduct = (): string => {
  const products = [
    'Premium Widget', 'Deluxe Package', 'Standard Plan', 'Pro License',
    'Enterprise Suite', 'Basic Subscription', 'Advanced Tools', 'Starter Kit'
  ];
  return products[Math.floor(Math.random() * products.length)];
};

const generateRandomCustomer = (): string => {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Emma'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Taylor', 'Anderson'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

const formatTime = (date: Date): string => {
  return date.toTimeString().split(' ')[0]; // HH:MM:SS format
};

export const useRealtimeSalesData = (): SalesData => {
  const [isClient, setIsClient] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [salesCount, setSalesCount] = useState<number>(0);
  const [salesChartData, setSalesChartData] = useState<SaleDataPoint[]>([]);
  const [cumulativeRevenueData, setCumulativeRevenueData] = useState<SaleDataPoint[]>([]);
  const [latestPayments, setLatestPayments] = useState<LatestPayment[]>([]);

  const addNewSale = useCallback(() => {
    const now = new Date();
    const timeString = formatTime(now);
    const saleAmount = generateRandomSale();
    
    // Update total revenue and sales count
    setTotalRevenue(prev => prev + saleAmount);
    setSalesCount(prev => prev + 1);
    
    // Add to sales chart data
    setSalesChartData(prev => {
      const newData = [...prev, { time: timeString, sales: saleAmount }];
      // Keep only last 50 data points for performance
      return newData.slice(-50);
    });
    
    // Add to cumulative revenue data
    setCumulativeRevenueData(prev => {
      const newTotal = prev.length > 0 ? prev[prev.length - 1].sales + saleAmount : saleAmount;
      const newData = [...prev, { time: timeString, sales: newTotal }];
      // Keep only last 50 data points for performance
      return newData.slice(-50);
    });
    
    // Add to latest payments
    setLatestPayments(prev => {
      const newPayment: LatestPayment = {
        id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: saleAmount,
        product: generateRandomProduct(),
        customer: generateRandomCustomer(),
        time: timeString
      };
      const newPayments = [newPayment, ...prev];
      // Keep only last 10 payments
      return newPayments.slice(0, 10);
    });
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Generate initial data only on client
    const initialDataCount = 10;
    for (let i = 0; i < initialDataCount; i++) {
      setTimeout(() => {
        addNewSale();
      }, i * 100); // Stagger initial data generation
    }

    // Set up interval for new sales
    const interval = setInterval(() => {
      // Random interval between 1-5 seconds
      const randomDelay = Math.random() * 4000 + 1000;
      setTimeout(addNewSale, randomDelay);
    }, 2000);

    return () => clearInterval(interval);
  }, [addNewSale, isClient]);

  const averageSale = salesCount > 0 ? totalRevenue / salesCount : 0;

  return {
    totalRevenue,
    cumulativeRevenueData,
    salesCount,
    averageSale,
    salesChartData,
    latestPayments,
  };
};