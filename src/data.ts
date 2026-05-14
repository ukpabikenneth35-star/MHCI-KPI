import { DashboardData, TimeRange } from './types';
import { subDays, subHours, format } from 'date-fns';

export const getDashboardData = (range: TimeRange): DashboardData => {
  const now = new Date();
  let dataPoints = 30;
  let dateFormat = 'MMM dd';
  
  switch(range) {
    case 'Day': 
      dataPoints = 24; 
      dateFormat = 'HH:00'; 
      break;
    case 'Week': 
      dataPoints = 7; 
      dateFormat = 'EEE'; 
      break;
    case 'Month': 
      dataPoints = 30; 
      dateFormat = 'MMM dd'; 
      break;
    case 'Quarter': 
      dataPoints = 90; 
      dateFormat = 'MMM dd'; 
      break;
  }

  return {
    lastUpdated: now.toISOString(),
    kpis: [
      // Uwana
      {
        id: 'uw-01',
        name: 'Active Tasks',
        value: 2,
        previousValue: 3,
        unit: '',
        trend: 'down',
        change: -33.3,
        category: 'Workload',
        owner: 'Uwana',
        type: 'workload'
      },
      {
        id: 'uw-03',
        name: 'Completed Tasks',
        value: 15,
        previousValue: 10,
        unit: '',
        trend: 'up',
        change: 50.0,
        category: 'Performance',
        owner: 'Uwana',
        type: 'performance'
      },
      // Adaeze
      {
        id: 'ad-01',
        name: 'Active Tasks',
        value: 1,
        previousValue: 2,
        unit: '',
        trend: 'down',
        change: -50.0,
        category: 'Workload',
        owner: 'Adaeze',
        type: 'workload'
      },
      {
        id: 'ad-03',
        name: 'Completed Tasks',
        value: 42,
        previousValue: 40,
        unit: '',
        trend: 'up',
        change: 5.0,
        category: 'Performance',
        owner: 'Adaeze',
        type: 'performance'
      },
      // Ikanke
      {
        id: 'ik-01',
        name: 'Active Tasks',
        value: 4,
        previousValue: 5,
        unit: '',
        trend: 'down',
        change: -20.0,
        category: 'Workload',
        owner: 'Ikanke',
        type: 'workload'
      },
      {
        id: 'ik-03',
        name: 'Completed Tasks',
        value: 38,
        previousValue: 35,
        unit: '',
        trend: 'up',
        change: 8.5,
        category: 'Performance',
        owner: 'Ikanke',
        type: 'performance'
      },
      // Bright
      {
        id: 'br-01',
        name: 'Active Tasks',
        value: 3,
        previousValue: 2,
        unit: '',
        trend: 'up',
        change: 50.0,
        category: 'Workload',
        owner: 'Bright',
        type: 'workload'
      },
      {
        id: 'br-03',
        name: 'Completed Tasks',
        value: 48,
        previousValue: 45,
        unit: '',
        trend: 'up',
        change: 6.6,
        category: 'Performance',
        owner: 'Bright',
        type: 'performance'
      }
    ],
    trends: Array.from({ length: dataPoints }).map((_, i) => {
      const date = range === 'Day' ? subHours(now, dataPoints - i) : subDays(now, dataPoints - i);
      return {
        date: format(date, dateFormat),
        value: 10 + Math.random() * 90,
        target: 75
      };
    })
  };
};
