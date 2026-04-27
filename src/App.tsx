import { useMemo, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

import { getReport } from "./data/reports";

import "./App.css";
import DateTimeRange from "./components/DateRange";
import ProductionLineChart from "./components/ProductionLineChart";
import DowntimeReportTable from "./components/DowntimeReportTable";
import MetricCard from "./components/MetricCard";

function formatSpeed(value: number) {
  return `${value.toFixed(2)} units/s`;
}

function formatProducts(value: number) {
  return value.toLocaleString();
}

function formatPerformance(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function App() {
  const [startDate, setStartDate] = useState(dayjs().subtract(1, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  const report = useMemo(() => {
    return getReport(startDate.toDate(), endDate.toDate());
  }, [startDate, endDate]);

  const maxSpeed = useMemo(() => {
    return report.intervals.reduce((currentMax, interval) => {
      return Math.max(currentMax, interval.speed);
    }, 0);
  }, [report.intervals]);

  const metricCards = [
    {
      label: "Max Speed",
      value: formatSpeed(maxSpeed),
      helperText: "Fastest recorded interval",
    },
    {
      label: "Average Speed",
      value: formatSpeed(report.averageSpeed),
      helperText: "Across all active intervals",
    },
    {
      label: "Average Performance",
      value: formatPerformance(report.averagePerformance),
      helperText: "Relative to max speed",
    },
    {
      label: "Total Products",
      value: formatProducts(report.totalProductsProduced),
      helperText: "Units produced in range",
    },
  ];

  return (
    <Box className="App">
      <Stack
        direction="row"
        useFlexGap
        spacing={2}
        sx={{
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h4">Packaging Line 1</Typography>
        <DateTimeRange
          startDate={startDate}
          startDateOnChange={setStartDate}
          endDate={endDate}
          endDateOnChange={setEndDate}
        />
      </Stack>
      <ProductionLineChart data={report.intervals} />
      <DowntimeReportTable data={report.downtimeReport} />
      <Box
        sx={{
          mt: 4,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {metricCards.map((metricCard) => (
          <MetricCard key={metricCard.label} {...metricCard} />
        ))}
      </Box>
    </Box>
  );
}

export default App;
