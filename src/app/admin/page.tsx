'use client'
import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/shadcn/chart";

// Function to generate mock revenue data based on time range and currency
const generateRevenueMockData = (timeRange: string, currency: CurrencyKey) => {
  const dataPoints: { date: string; revenue: number }[] = [];
  const now = new Date();

  // Adjust base values based on currency
  const currencyMultiplier = currency === 'ALL' ? 1 :
    currency === '$' ? 0.4 :
    currency === '€' ? 0.35 : 0.25; // NT$

  const currencyRate = currency === 'ALL' ? 1 : (currencyRates[currency] || 1);

  switch (timeRange) {
    case 'TODAY':
      // Generate hourly data for today
      for (let i = 0; i < 24; i++) {
        dataPoints.push({
          date: `${i}:00`,
          revenue: Math.floor((Math.random() * 5000 + 2000) * currencyMultiplier * currencyRate),
        });
      }
      break;
    case '7 DAYS':
      // Generate daily data for 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dataPoints.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          revenue: Math.floor((Math.random() * 20000 + 10000) * currencyMultiplier * currencyRate),
        });
      }
      break;
    case '1 MONTH':
    case 'THIS MONTH':
      // Generate daily data for the month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const monthName = now.toLocaleString('en-US', { month: 'short' });
        dataPoints.push({
          date: `${monthName} ${i}`,
          revenue: Math.floor((Math.random() * 25000 + 15000) * currencyMultiplier * currencyRate),
        });
      }
      break;
    case '3 MONTHS':
      // Generate weekly data for 3 months
      for (let i = 12; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        const monthName = date.toLocaleString('en-US', { month: 'short' });
        dataPoints.push({
          date: `${monthName} ${date.getDate()}`,
          revenue: Math.floor((Math.random() * 50000 + 30000) * currencyMultiplier * currencyRate),
        });
      }
      break;
    case 'THIS YEAR':
      // Generate monthly data for the year
      for (let i = 0; i <= now.getMonth(); i++) {
        const date = new Date(now.getFullYear(), i, 1);
        const monthName = date.toLocaleString('en-US', { month: 'short' });
        dataPoints.push({
          date: monthName,
          revenue: Math.floor((Math.random() * 100000 + 50000) * currencyMultiplier * currencyRate),
        });
      }
      break;
    case 'A YEAR':
      // Generate monthly data for 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleString('en-US', { month: 'short' });
        dataPoints.push({
          date: monthName,
          revenue: Math.floor((Math.random() * 100000 + 50000) * currencyMultiplier * currencyRate),
        });
      }
      break;
    case 'ALL':
      // Generate yearly data
      const currentYear = now.getFullYear();
      for (let year = currentYear - 4; year <= currentYear; year++) {
        dataPoints.push({
          date: year.toString(),
          revenue: Math.floor((Math.random() * 500000 + 300000) * currencyMultiplier * currencyRate),
        });
      }
      break;
    default:
      break;
  }

  return dataPoints;
};

// Function to generate mock order data based on time range and currency
const generateOrderMockData = (timeRange: string, currency: CurrencyKey) => {
  const dataPoints: { date: string; orders: number }[] = [];
  const now = new Date();

  // Adjust base values based on currency
  const currencyMultiplier = currency === 'ALL' ? 1 :
    currency === '$' ? 0.4 :
    currency === '€' ? 0.35 : 0.25; // NT$

  switch (timeRange) {
    case 'TODAY':
      // Generate hourly data for today
      for (let i = 0; i < 24; i++) {
        dataPoints.push({
          date: `${i}:00`,
          orders: Math.floor((Math.random() * 50 + 10) * currencyMultiplier),
        });
      }
      break;
    case '7 DAYS':
      // Generate daily data for 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dataPoints.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          orders: Math.floor((Math.random() * 100 + 50) * currencyMultiplier),
        });
      }
      break;
    case '1 MONTH':
    case 'THIS MONTH':
      // Generate daily data for the month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const monthName = now.toLocaleString('en-US', { month: 'short' });
        dataPoints.push({
          date: `${monthName} ${i}`,
          orders: Math.floor((Math.random() * 120 + 60) * currencyMultiplier),
        });
      }
      break;
    case '3 MONTHS':
      // Generate weekly data for 3 months
      for (let i = 12; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        const monthName = date.toLocaleString('en-US', { month: 'short' });
        dataPoints.push({
          date: `${monthName} ${date.getDate()}`,
          orders: Math.floor((Math.random() * 200 + 100) * currencyMultiplier),
        });
      }
      break;
    case 'THIS YEAR':
      // Generate monthly data for the year
      for (let i = 0; i <= now.getMonth(); i++) {
        const date = new Date(now.getFullYear(), i, 1);
        const monthName = date.toLocaleString('en-US', { month: 'short' });
        dataPoints.push({
          date: monthName,
          orders: Math.floor((Math.random() * 500 + 250) * currencyMultiplier),
        });
      }
      break;
    case 'A YEAR':
      // Generate monthly data for 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleString('en-US', { month: 'short' });
        dataPoints.push({
          date: monthName,
          orders: Math.floor((Math.random() * 500 + 250) * currencyMultiplier),
        });
      }
      break;
    case 'ALL':
      // Generate yearly data
      const currentYear = now.getFullYear();
      for (let year = currentYear - 4; year <= currentYear; year++) {
        dataPoints.push({
          date: year.toString(),
          orders: Math.floor((Math.random() * 2500 + 1500) * currencyMultiplier),
        });
      }
      break;
    default:
      break;
  }

  return dataPoints;
};

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#6b7280",
  },
} satisfies ChartConfig;

const orderChartConfig = {
  orders: {
    label: "Orders",
    color: "#6b7280",
  },
} satisfies ChartConfig;

// Type for currency keys
type CurrencyKey = '$' | '€' | 'NT$' | 'ALL';

// Type for currency data
type CurrencyData = {
  [key in CurrencyKey]: number;
};

// Currency conversion rates (relative to USD)
const currencyRates: { [key: string]: number } = {
  '$': 1,
  '€': 0.92,
  'NT$': 31.5,
};

// Generate base revenue data for all currencies at once
const generateBaseRevenueData = (timeRange: string): CurrencyData => {
  const baseMultipliers: { [key: string]: number } = {
    'TODAY': 5000,
    '7 DAYS': 35000,
    '1 MONTH': 150000,
    'THIS MONTH': 150000,
    '3 MONTHS': 450000,
    'THIS YEAR': 1200000,
    'A YEAR': 1800000,
    'ALL': 9000000,
  };

  const base = baseMultipliers[timeRange] || 100000;
  const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

  // Generate values for each currency that will sum correctly
  const usdRevenue = Math.floor(base * randomFactor * 0.4);
  const eurRevenue = Math.floor(base * randomFactor * 0.35);
  const ntdRevenue = Math.floor(base * randomFactor * 0.25);

  return {
    '$': Math.floor(usdRevenue * currencyRates['$']),
    '€': Math.floor(eurRevenue * currencyRates['€']),
    'NT$': Math.floor(ntdRevenue * currencyRates['NT$']),
    'ALL': Math.floor(usdRevenue * currencyRates['$']) + Math.floor(eurRevenue * currencyRates['€']) + Math.floor(ntdRevenue * currencyRates['NT$']),
  };
};

// Generate base order data for all currencies at once
const generateBaseOrderData = (timeRange: string): CurrencyData => {
  const baseMultipliers: { [key: string]: number } = {
    'TODAY': 50,
    '7 DAYS': 350,
    '1 MONTH': 1500,
    'THIS MONTH': 1500,
    '3 MONTHS': 4500,
    'THIS YEAR': 12000,
    'A YEAR': 18000,
    'ALL': 90000,
  };

  const base = baseMultipliers[timeRange] || 1000;
  const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

  const usdOrders = Math.floor(base * randomFactor * 0.4);
  const eurOrders = Math.floor(base * randomFactor * 0.35);
  const ntdOrders = Math.floor(base * randomFactor * 0.25);

  return {
    '$': usdOrders,
    '€': eurOrders,
    'NT$': ntdOrders,
    'ALL': usdOrders + eurOrders + ntdOrders,
  };
};

// Generate base pending order data for all currencies at once
const generateBasePendingOrderData = (): CurrencyData => {
  const base = 25;
  const randomFactor = 0.5 + Math.random(); // 0.5 to 1.5

  const usdPending = Math.floor(base * randomFactor * 0.4);
  const eurPending = Math.floor(base * randomFactor * 0.35);
  const ntdPending = Math.floor(base * randomFactor * 0.25);

  return {
    '$': usdPending,
    '€': eurPending,
    'NT$': ntdPending,
    'ALL': usdPending + eurPending + ntdPending,
  };
};

// Function to generate mock user visits
const generateMockUserVisits = (timeRange: string) => {
  const baseMultipliers: { [key: string]: number } = {
    'TODAY': 500,
    '7 DAYS': 3500,
    '1 MONTH': 15000,
    'THIS MONTH': 15000,
    '3 MONTHS': 45000,
    'THIS YEAR': 120000,
    'A YEAR': 180000,
    'ALL': 900000,
  };

  const base = baseMultipliers[timeRange] || 10000;
  const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

  return Math.floor(base * randomFactor);
};

// Format currency display
const formatCurrency = (value: number, currency: string) => {
  if (currency === 'NT$') {
    return `NT$${value.toLocaleString()}`;
  }
  return `${currency}${value.toLocaleString()}`;
};

export default function AdminPage() {
  const [timeRange, setTimeRange] = useState('THIS MONTH');
  const [revenueCurrency, setRevenueCurrency] = useState('$');
  const [ordersCurrency, setOrdersCurrency] = useState('ALL');
  const [pendingOrdersCurrency, setPendingOrdersCurrency] = useState('ALL');
  const [revenueChartCurrency, setRevenueChartCurrency] = useState('$');
  const [ordersChartCurrency, setOrdersChartCurrency] = useState('ALL');


  const currencyList = ['$', '€', 'NT$'];
  const userName = "Apollodorus"

  const revenueChartData = useMemo(() => generateRevenueMockData(timeRange, revenueChartCurrency as CurrencyKey), [timeRange, revenueChartCurrency]);
  const orderChartData = useMemo(() => generateOrderMockData(timeRange, ordersChartCurrency as CurrencyKey), [timeRange, ordersChartCurrency]);

  // Generate base data for all currencies at once (ensures they add up correctly)
  const revenueData = useMemo(() => generateBaseRevenueData(timeRange), [timeRange]);
  const ordersData = useMemo(() => generateBaseOrderData(timeRange), [timeRange]);
  const pendingOrdersData = useMemo(() => generateBasePendingOrderData(), []);
  const userVisitsValue = useMemo(() => generateMockUserVisits(timeRange), [timeRange]);

  // Get values for selected currencies
  const revenueValue = revenueData[revenueCurrency as CurrencyKey] || 0;
  const ordersValue = ordersData[ordersCurrency as CurrencyKey] || 0;
  const pendingOrdersValue = pendingOrdersData[pendingOrdersCurrency as CurrencyKey] || 0;
  return (
    <div className="grid grid-cols-2 mx-3 gap-5 sm:grid-cols-8 w-full lg:max-w-7xl">
      <div className="col-span-2 sm:col-span-8 flex justify-between items-center mt-4 text-center">
        <div className="font-semibold text-base sm:text-2xl lg:text-3xl">
          Hello, {userName}
        </div>
        <select
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value);
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1em 1em',
          }}
          className="px-2 py-1 sm:py-2 lg:py-3 pr-8 sm:pr-10 text-sm sm:text-lg bg-gray-100 border border-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900 font-semibold"
        >
          <option value="TODAY">TODAY</option>
          <option value="7 DAYS">7 DAYS</option>
          <option value="1 MONTH">1 MONTH</option>
          <option value="THIS MONTH">THIS MONTH</option>
          <option value="3 MONTHS">3 MONTHS</option>
          <option value="THIS YEAR">THIS YEAR</option>
          <option value="A YEAR">A YEAR</option>
          <option value="ALL">ALL</option>
        </select>
      </div>
      {/* Blocks */}
      <div className="col-span-1 sm:col-span-2 grid grid-rows-6 w-full bg-gray-700 aspect-square">
        <div className="row-span-5 text-gray-100 flex text-center items-center flex-col justify-center">
          <h3 className="text-2xl lg:text-4xl font-bold mb-2">{formatCurrency(revenueValue, revenueCurrency)}</h3>
          <div className="text-sm lg:text-xl font-medium">
              Revenue <span className="italic font-semibold">{timeRange}</span>
          </div>
        </div>
        <div className="row-span-1 bg-gray-700 grid grid-cols-3 text-xs border lg:text-sm border-gray-700 divide-x divide-gray-700">
          {currencyList.map((currency) => (
                <button
                  key={currency}
                  onClick={() => setRevenueCurrency(currency)}
                  className={`col-span-1 flex items-center justify-center transition cursor-pointer ${
                    revenueCurrency === currency ? "bg-gray-700 text-gray-100" : "bg-gray-100 hover:bg-gray-700 hover:text-gray-100"}`}
                  >
                    {currency}
                </button>
          ))}
        </div>
      </div>
      <div className="col-span-1 sm:col-span-2 grid grid-rows-6 w-full bg-gray-100 aspect-square">
        <div className="row-span-5 text-gray-700 flex text-center items-center flex-col justify-center">
          <h3 className="text-2xl lg:text-4xl font-bold mb-2">{ordersValue.toLocaleString()}</h3>
          <div className="text-sm lg:text-xl font-medium">
          Orders <span className="italic font-semibold">{timeRange}</span>
          </div>
        </div>
        <div className="row-span-1 bg-gray-100 grid grid-cols-4 text-xs lg:text-sm">
          {['ALL', ...currencyList].map((currency) => (
                <button
                  key={currency}
                  onClick={() => setOrdersCurrency(currency)}
                  className={`col-span-1 flex items-center justify-center transition cursor-pointer ${
                    ordersCurrency === currency ? "bg-gray-100" : "bg-gray-700 text-gray-100 hover:bg-gray-100 hover:text-gray-700"}`}
                  >
                    {currency}
                </button>
          ))}
        </div>
      </div>

      <div className="col-start-1 col-span-1 sm:col-span-2 sm:col-start-5 grid grid-rows-6 w-full bg-gray-100 sm:bg-gray-700 aspect-square">
        <div className="row-span-5 text-gray-700 sm:text-gray-100 flex text-center items-center flex-col justify-center">
          <h3 className="text-2xl lg:text-4xl font-bold mb-2">{pendingOrdersValue}</h3>
          <div className="text-sm lg:text-xl font-medium">
            Pending Orders
          </div>
        </div>
        <div className="row-span-1 bg-gray-100 sm:bg-gray-700 grid grid-cols-4 text-xs lg:text-sm sm:border sm:border-gray-700 sm:divide-x sm:divide-gray-700">
          {['ALL', ...currencyList].map((currency) => (
                <button
                  key={currency}
                  onClick={() => setPendingOrdersCurrency(currency)}
                  className={`col-span-1 flex items-center justify-center transition cursor-pointer ${
                    pendingOrdersCurrency === currency ? "bg-gray-100 sm:bg-gray-700 sm:text-gray-100" : "bg-gray-700 text-gray-100 hover:bg-gray-100 hover:text-gray-700 sm:bg-gray-100 sm:text-gray-700 sm:hover:bg-gray-700 sm:hover:text-gray-100"}`}
                  >
                    {currency}
                </button>
          ))}
        </div>
      </div>

      <div className="col-start-2 col-span-1 sm:col-span-2 sm:col-start-7 w-full bg-gray-700 sm:bg-gray-100 aspect-square">
        <div className="text-gray-100 sm:text-gray-700 h-full flex text-center items-center flex-col justify-center">
          <h3 className="text-2xl lg:text-4xl font-bold mb-2">{userVisitsValue.toLocaleString()}</h3>
          <div className="text-sm lg:text-xl font-medium">
            Users visit <span className="italic font-semibold">{timeRange}</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="col-span-2 sm:col-span-4 grid grid-rows-8 lg:grid-rows-10 grid-cols-2 gap-x-5 border border-gray-700 ">
        <h2 className="ml-3 mt-2 lg:ml-5 text-lg sm:text-xl lg:text-3xl font-bold row-span-2 col-span-1">Revenue</h2>
        <div className="row-span-1 col-start-2 col-span-1 border-l border-b border-gray-700 grid grid-cols-3 text-xs sm:text-sm lg:text-base divide-x divide-gray-700">
          {currencyList.map((currency) => (
                <button
                  key={currency}
                  onClick={() => setRevenueChartCurrency(currency)}
                  className={`col-span-1 flex items-center justify-center transition cursor-pointer ${
                    revenueChartCurrency === currency ? "bg-gray-700 text-gray-100" : "hover:bg-gray-700 hover:text-gray-100"}`}
                  >
                    {currency}
                </button>
          ))}
        </div>
        <div className="row-span-6 lg:row-span-8 col-span-2 px-2">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={revenueChartData}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
                className="text-xs"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-gray-400)" stopOpacity={1} />
                  <stop offset="95%" stopColor="var(--color-gray-800)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#revenueGradient)"
                stroke="var(--color-gray-500)"
                strokeWidth={1}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
      {/* Order Chart */}
      <div className="col-span-2 sm:col-span-4 grid grid-rows-8 lg:grid-rows-10 grid-cols-2 gap-x-5 border border-gray-700">
        <h2 className="ml-3 mt-2 lg:ml-5 text-lg sm:text-xl lg:text-3xl font-bold row-span-2 col-span-1">Orders</h2>
        <div className="row-span-1 col-start-2 col-span-1 border-l border-b border-gray-700 grid grid-cols-4 text-xs sm:text-sm lg:text-base divide-x divide-gray-700">
          {['ALL', ...currencyList].map((currency) => (
                <button
                  key={currency}
                  onClick={() => setOrdersChartCurrency(currency)}
                  className={`col-span-1 flex items-center justify-center transition cursor-pointer ${
                    ordersChartCurrency === currency ? "bg-gray-700 text-gray-100" : "hover:bg-gray-700 hover:text-gray-100"}`}
                  >
                    {currency}
                </button>
          ))}
        </div>
        <div className="row-span-6 lg:row-span-8 col-span-2 px-2">
          <ChartContainer config={orderChartConfig} className="h-full w-full">
            <AreaChart
              data={orderChartData}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
                className="text-xs"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-gray-400)" stopOpacity={1} />
                  <stop offset="95%" stopColor="var(--color-gray-800)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="orders"
                type="natural"
                fill="url(#revenueGradient)"
                stroke="var(--color-gray-500)"
                strokeWidth={1}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

    </div>
  );
}
