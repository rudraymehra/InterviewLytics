import React from 'react'
import { useTheme } from 'next-themes'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface BarChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
      borderWidth?: number
    }[]
  }
  options?: any
  className?: string
}

const BarChart: React.FC<BarChartProps> = ({ data, options, className }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false, // allow custom height via wrapper
    barPercentage: 0.9,
    categoryPercentage: 0.75,
    layout: { padding: { top: 0, right: 0, bottom: 24, left: 0 } },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 10,
          font: { size: 14, family: 'Inter, sans-serif', weight: '500' },
          color: isDark ? '#e5e7eb' : '#374151',
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: isDark ? '#3b82f6' : '#D4AF37',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: { display: false, drawTicks: false },
        border: { display: false },
        ticks: {
          font: { size: 14, family: 'Inter, sans-serif', weight: '500' },
          color: isDark ? '#d1d5db' : '#374151',
          padding: 6,
        },
      },
      y: {
        beginAtZero: true,
        max: 20,
        ticks: {
          stepSize: 2.5,
          font: { size: 14, family: 'Inter, sans-serif', weight: '500' },
          color: isDark ? '#d1d5db' : '#374151',
        },
        grid: { color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0,0,0,0.05)', drawBorder: false },
      },
    },
    elements: { bar: { borderRadius: 12, maxBarThickness: 60 } },
    ...options,
  }

  return (
    <div className={`w-full h-full ${className || ''}`}>
      <Bar data={data} options={defaultOptions} />
    </div>
  )
}

export { BarChart }
