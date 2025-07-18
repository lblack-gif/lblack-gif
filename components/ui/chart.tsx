"use client"

import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

type CustomLegendProps = {
  payload?: any
  verticalAlign?: "top" | "middle" | "bottom"
  hideIcon?: boolean
  nameKey?: string
} & React.ComponentProps<"div">

export function CustomLegend({
  payload,
  verticalAlign = "top",
  hideIcon = false,
  nameKey = "name",
  ...props
}: CustomLegendProps) {
  if (!payload) return null

  return (
    <div className={`flex flex-wrap justify-${verticalAlign}`} {...props}>
      {payload.map((entry: any, index: number) => (
        <div
          key={`item-${index}`}
          className="flex items-center mr-4 text-sm mb-1"
        >
          {!hideIcon && (
            <span
              className="inline-block w-3 h-3 rounded-sm mr-2"
              style={{ backgroundColor: entry.color }}
            />
          )}
          <span>{entry[nameKey]}</span>
        </div>
      ))}
    </div>
  )
}

export default function ChartComponent() {
  const data = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 500 },
    { name: "Apr", value: 200 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend content={<CustomLegend />} />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}
