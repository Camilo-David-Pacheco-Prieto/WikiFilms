"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTranslate, useLanguage } from "@/i18n/language-provider";

const COLORS = ["#e11d48", "#3b82f6", "#22c55e"];

interface StatsChartProps {
  reviewsByMonth: { month: string; count: number }[];
  contentTypeDist: { type: string; count: number }[];
}

export function StatsChart({ reviewsByMonth, contentTypeDist }: StatsChartProps) {
  const t = useTranslate();
  const { locale } = useLanguage();

  const monthFormatter = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-ES", { month: "short" });

  const formatMonth = (key: string) => {
    const [, m] = key.split("-");
    const date = new Date(2024, parseInt(m, 10) - 1, 1);
    return monthFormatter.format(date);
  };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      movie: t("search.filterMovies"),
      tv: t("search.filterSeries"),
      game: t("search.filterGames"),
    };
    return map[type] ?? type;
  };

  const pieData = contentTypeDist.map((item) => ({
    ...item,
    label: typeLabel(item.type),
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-border-subtle bg-surface p-4">
        <h3 className="mb-4 text-sm font-medium text-text-primary">
          {t("admin.chartReviewsByMonth")}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={reviewsByMonth}>
            <XAxis
              dataKey="month"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              tickFormatter={formatMonth}
            />
            <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 13,
              }}
              labelFormatter={(label: any) => {
                if (typeof label !== "string") return "";
                const [y, m] = label.split("-");
                const date = new Date(2024, parseInt(m, 10) - 1, 1);
                return `${monthFormatter.format(date)} ${y}`;
              }}
            />
            <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-4">
        <h3 className="mb-4 text-sm font-medium text-text-primary">
          {t("admin.chartContentType")}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }: any) => `${name} ${Math.round((percent as number) * 100)}%`}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(_: any, name: any) => [name ?? "", t("admin.contentCount")]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
