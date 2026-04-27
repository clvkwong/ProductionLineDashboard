import dayjs from "dayjs";
import { Stack } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

interface DateTimeRangeProps {
  startDate: dayjs.Dayjs;
  startDateOnChange: (date: any) => void;
  endDate: dayjs.Dayjs;
  endDateOnChange: (date: any) => void;
}

export default function DateTimeRange({
  startDate,
  startDateOnChange,
  endDate,
  endDateOnChange,
}: DateTimeRangeProps) {
  return (
    <Stack direction="row" spacing={2}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Start Date Time"
          value={startDate}
          onChange={startDateOnChange}
        />
        <DateTimePicker
          label="End Date Time"
          value={endDate}
          onChange={endDateOnChange}
        />
      </LocalizationProvider>
    </Stack>
  );
}
