"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Area, AreaChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart-components"

export type { ChartConfig }
export { ChartContainer, ChartTooltip, ChartTooltipContent }

export { Bar, BarChart, CartesianGrid, XAxis, Area, AreaChart }
