import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Box, Paper, Stack, Tooltip, Typography } from "@mui/material";

import { ProductionLineIntervalPerformance } from "../data/reports";
import { ProductionLineStatus } from "../data/events";

interface ProductionLineChartProps {
  data: ProductionLineIntervalPerformance[];
}

const chartWidth = 960;
const chartHeight = 360;
const padding = { top: 32, right: 24, bottom: 48, left: 72 };

const statusColors: Record<ProductionLineStatus, string> = {
  [ProductionLineStatus.RUNNING]: "#1d4ed8",
  [ProductionLineStatus.DOWNTIME]: "#dc2626",
  [ProductionLineStatus.STOPPED]: "#6b7280",
};

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function formatProducts(value: number) {
  return `${value.toLocaleString()} units`;
}

function formatSpeed(value: number) {
  return `${value.toFixed(2)} units/s`;
}

function formatPerformance(value: number) {
  return value.toFixed(2);
}

function formatEventRange(startTime: Date, endTime: Date) {
  return `${timeFormatter.format(startTime)} - ${timeFormatter.format(endTime)}`;
}

const metricCalculationDetails = [
  "Products produced: total units recorded during the interval.",
  "Speed: products produced divided by the interval duration in seconds.",
  "Performance: interval speed divided by the fastest interval speed in the selected report.",
];

function getStartOfHour(time: number) {
  const date = new Date(time);
  date.setMinutes(0, 0, 0);
  return date.getTime();
}

function ProductionLineChart({ data }: ProductionLineChartProps) {
  const [hoveredEventId, setHoveredEventId] = useState<number | null>(null);
  const [chartPixelWidth, setChartPixelWidth] = useState(chartWidth);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const hoveredEvent =
    data.find((event) => event.id === hoveredEventId) ?? null;

  useEffect(() => {
    const container = chartContainerRef.current;

    if (!container) {
      return undefined;
    }

    const updateWidth = () => {
      setChartPixelWidth(container.getBoundingClientRect().width || chartWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const { innerWidth, innerHeight, minTime, maxTime, points, yTicks, xTicks } =
    useMemo(() => {
      const innerWidthValue = chartWidth - padding.left - padding.right;
      const innerHeightValue = chartHeight - padding.top - padding.bottom;
      const minTimeValue = Math.min(
        ...data.map((event) => event.startTime.getTime()),
      );
      const maxTimeValue = Math.max(
        ...data.map((event) => event.endTime.getTime()),
      );
      const xScale = (time: number) => {
        if (maxTimeValue === minTimeValue) {
          return padding.left;
        }

        return (
          padding.left +
          ((time - minTimeValue) / (maxTimeValue - minTimeValue)) *
            innerWidthValue
        );
      };

      const yScale = (performance: number) =>
        padding.top +
        (1 - Math.min(Math.max(performance, 0), 1)) * innerHeightValue;

      const chartPoints = data.map((event) => ({
        ...event,
        startX: xScale(event.startTime.getTime()),
        endX: xScale(event.endTime.getTime()),
        x: xScale(
          event.startTime.getTime() +
            (event.endTime.getTime() - event.startTime.getTime()) / 2,
        ),
        y: yScale(event.performance),
      }));

      const startHour = getStartOfHour(minTimeValue);
      const endHour = getStartOfHour(maxTimeValue);
      const hourlyTicks = [];

      for (
        let tickTime = startHour;
        tickTime <= endHour;
        tickTime += 60 * 60 * 1000
      ) {
        hourlyTicks.push({
          value: tickTime,
          x: xScale(tickTime),
        });
      }

      const maxVisibleTimeTicks = Math.max(2, Math.floor(chartPixelWidth / 90));
      const tickStep = Math.max(
        1,
        Math.ceil(hourlyTicks.length / maxVisibleTimeTicks),
      );
      const chartTicks = hourlyTicks.filter((_, index) => {
        return (
          index === 0 ||
          index === hourlyTicks.length - 1 ||
          index % tickStep === 0
        );
      });

      const performanceTicks = [0, 0.25, 0.5, 0.75, 1].map((value) => ({
        value,
        y: yScale(value),
      }));

      return {
        innerWidth: innerWidthValue,
        innerHeight: innerHeightValue,
        minTime: minTimeValue,
        maxTime: maxTimeValue,
        points: chartPoints,
        yTicks: chartTicks,
        xTicks: performanceTicks,
      };
    }, [chartPixelWidth, data]);

  const linePath = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.startX} ${point.y} H ${point.endX}`;
    }

    return `${path} V ${point.y} H ${point.endX}`;
  }, "");

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        borderRadius: 3,
        p: 3,
        textAlign: "left",
        backgroundColor: "#f8fafc",
        border: "1px solid #cbd5e1",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Production Line Performance
            </Typography>
          </Stack>

          <Tooltip
            arrow
            placement="bottom-end"
            title={
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Metric calculations
                </Typography>
                {metricCalculationDetails.map((detail) => (
                  <Typography key={detail} variant="body2">
                    {detail}
                  </Typography>
                ))}
              </Stack>
            }
            slotProps={{
              tooltip: {
                sx: {
                  maxWidth: 320,
                  backgroundColor: "#0f172a",
                  borderRadius: 2,
                  p: 1.5,
                },
              },
            }}
          >
            <Box
              component="button"
              type="button"
              aria-label="Show metric calculations"
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #94a3b8",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                fontSize: "0.95rem",
                fontWeight: 700,
                lineHeight: 1,
                cursor: "help",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition:
                  "background-color 120ms ease, border-color 120ms ease",
                "&:hover, &:focus-visible": {
                  backgroundColor: "#e2e8f0",
                  borderColor: "#64748b",
                },
              }}
            >
              i
            </Box>
          </Tooltip>
        </Box>
      </Box>

      <Box ref={chartContainerRef} sx={{ position: "relative" }}>
        <Box
          component="svg"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          sx={{ width: "100%", height: "auto", display: "block" }}
          role="img"
          aria-label="Production line data chart"
        >
          {data.map((event) => {
            const startX =
              padding.left +
              ((event.startTime.getTime() - minTime) /
                (maxTime - minTime || 1)) *
                innerWidth;
            const endX =
              padding.left +
              ((event.endTime.getTime() - minTime) / (maxTime - minTime || 1)) *
                innerWidth;

            return (
              <rect
                key={`bg-${event.id}`}
                x={startX}
                y={padding.top}
                width={Math.max(endX - startX, 2)}
                height={innerHeight}
                fill={
                  event.status === ProductionLineStatus.DOWNTIME
                    ? "rgba(220, 38, 38, 0.16)"
                    : "rgba(148, 163, 184, 0.08)"
                }
              />
            );
          })}

          {yTicks.map((tick) => (
            <g key={tick.value.toString()}>
              <line
                x1={tick.x}
                x2={tick.x}
                y1={padding.top}
                y2={chartHeight - padding.bottom}
                stroke="#cbd5e1"
                strokeDasharray="4 4"
              />
              <text
                x={tick.x}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#475569"
              >
                {timeFormatter.format(new Date(tick.value))}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={padding.left}
                x2={chartWidth - padding.right}
                y1={tick.y}
                y2={tick.y}
                stroke="#e2e8f0"
              />
              <text
                x={padding.left - 12}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#475569"
              >
                {formatPerformance(tick.value)}
              </text>
            </g>
          ))}

          <line
            x1={padding.left}
            x2={chartWidth - padding.right}
            y1={chartHeight - padding.bottom}
            y2={chartHeight - padding.bottom}
            stroke="#64748b"
          />
          <line
            x1={padding.left}
            x2={padding.left}
            y1={padding.top}
            y2={chartHeight - padding.bottom}
            stroke="#64748b"
          />

          <path
            d={linePath}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((point) => (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill={statusColors[point.status]}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="18"
                fill="transparent"
                onMouseEnter={() => setHoveredEventId(point.id)}
                onMouseLeave={() =>
                  setHoveredEventId((current) =>
                    current === point.id ? null : current,
                  )
                }
              />
            </g>
          ))}

          {points.map((point) => (
            <rect
              key={`hit-${point.id}`}
              x={point.startX}
              y={point.y - 12}
              width={Math.max(point.endX - point.startX, 8)}
              height={24}
              fill="transparent"
              onClick={() =>
                setHoveredEventId((current) =>
                  current === point.id ? null : point.id,
                )
              }
              onMouseEnter={() => setHoveredEventId(point.id)}
              onMouseLeave={() =>
                setHoveredEventId((current) =>
                  current === point.id ? null : current,
                )
              }
            />
          ))}

          <text
            x={chartWidth / 2}
            y={chartHeight - 8}
            textAnchor="middle"
            fontSize="13"
            fill="#334155"
            fontWeight="600"
          >
            Time
          </text>

          <text
            x={18}
            y={chartHeight / 2}
            fontSize="13"
            fill="#334155"
            fontWeight="600"
            transform={`rotate(-90 18 ${chartHeight / 2})`}
            textAnchor="middle"
          >
            Performance
          </text>
        </Box>

        {hoveredEvent && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 260,
              p: 2,
              borderRadius: 2,
              border: `1px solid ${statusColors[hoveredEvent.status]}`,
              backgroundColor:
                hoveredEvent.status === ProductionLineStatus.DOWNTIME
                  ? "#fef2f2"
                  : "#ffffff",
            }}
          >
            <Stack spacing={0.75}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: statusColors[hoveredEvent.status],
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {hoveredEvent.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatEventRange(hoveredEvent.startTime, hoveredEvent.endTime)}
              </Typography>
              <Typography variant="body2">
                {formatProducts(hoveredEvent.productsProduced)}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Speed: {formatSpeed(hoveredEvent.speed)}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Performance: {formatPerformance(hoveredEvent.performance)}
              </Typography>
              <Typography variant="body2">Event #{hoveredEvent.id}</Typography>
              {hoveredEvent.downtimeReason && (
                <Typography variant="body2">
                  Reason: {hoveredEvent.downtimeReason}
                </Typography>
              )}
            </Stack>
          </Paper>
        )}
      </Box>
    </Paper>
  );
}

export default memo(ProductionLineChart);
