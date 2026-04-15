"use client";

import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  data: {
    id: string;
    name: string;
    totalReceived: number;
  }[];
}

const ITEMS_LIMIT = 5;

export function AllocationChart({ data }: Props) {
  const chartData = useMemo(() => {
    return data.slice(0, ITEMS_LIMIT).map((item) => ({
      charity: item.name,
      allocated: item.totalReceived,
      fill: `var(--color-${item.id})`,
    }));
  }, [data]);

  const chartConfig = {
    allocated: {
      label: "Allocated",
    },
    ...Object.fromEntries(
      data.slice(0, ITEMS_LIMIT).map((item, i) => [
        item.id,
        {
          label: item.name,
          color: `var(--chart-${i + 1})`,
        },
      ]),
    ),
  } satisfies ChartConfig;
  console.log({ chartData, chartConfig });

  const totalAllocated = data.reduce((acc, curr) => acc + curr.totalReceived, 0);
  console.log({ totalAllocated });

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-62.5">
      <PieChart>
        {/*<ChartLegend content={<ChartLegendContent />} />*/}
        <ChartTooltip cursor={true} content={<ChartTooltipContent className="gap-4" hideLabel />} />
        <Pie data={chartData} dataKey="allocated" nameKey="charity" innerRadius={60} strokeWidth={5}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy - 10} className="fill-foreground text-xl font-bold">
                      &#8377; {totalAllocated.toLocaleString()}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 12} className="fill-muted-foreground">
                      Allocated
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
