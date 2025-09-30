import React from 'react'
import { useTheme } from 'next-themes'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface RadarChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string
      borderColor?: string
      pointBackgroundColor?: string
      pointBorderColor?: string
      pointHoverBackgroundColor?: string
      pointHoverBorderColor?: string
    }[]
  }
  options?: any
  className?: string
}

const RadarChart: React.FC<RadarChartProps> = ({ data, options, className }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 10,
          font: {
            size: 14,
            family: 'Inter, sans-serif',
            weight: '500'
          },
          color: isDark ? '#e5e7eb' : '#374151'
        },
      },
      title: {
        display: false,
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
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          },
          color: isDark ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.05)',
        },
        pointLabels: {
          font: {
            size: 12,
            family: 'Inter, sans-serif',
            weight: '600'
          },
          color: isDark ? '#d1d5db' : '#374151',
          padding: 8,
          centerPointLabels: false
        }
      },
    },
    ...options,
  }

  return (
    <div className={`w-full h-full ${className || ''}`}>
      <Radar data={data} options={defaultOptions} />
    </div>
  )
}

export { RadarChart }
