import { useMemo } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { DowntimeReport } from "../data/reports";

interface DowntimeReportTableProps {
  data: DowntimeReport[];
}

function formatDowntime(totalSeconds: number) {
  const roundedSeconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(roundedSeconds / 86400);
  const hours = Math.floor((roundedSeconds % 86400) / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const seconds = roundedSeconds % 60;

  const parts = [
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
    minutes > 0 ? `${minutes}m` : null,
    seconds > 0 ? `${seconds}s` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join("") : "0s";
}

function DowntimeReportTable({ data }: DowntimeReportTableProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((first, second) => {
      return second.totalDowntime - first.totalDowntime;
    });
  }, [data]);

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: "#f8fafc",
        border: "1px solid #cbd5e1",
      }}
    >
      <Typography variant="h5" sx={{ px: 3, pt: 3, fontWeight: 700 }}>
        Downtime Report
      </Typography>
      <TableContainer>
        <Table aria-label="Downtime report table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                # of events
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Total downtime
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow key={row.name} hover>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.numberOfEvents}</TableCell>
                <TableCell align="right">
                  {formatDowntime(row.totalDowntime)}
                </TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  No downtime recorded for the selected range.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default DowntimeReportTable;
