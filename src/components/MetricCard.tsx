import { Card, CardContent, Typography } from "@mui/material";

interface MetricCardProps {
  label: string;
  value: string;
  helperText: string;
}

function MetricCard({ label, value, helperText }: MetricCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.95) 100%)",
        border: "1px solid #cbd5e1",
        textAlign: "left",
      }}
    >
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Typography
          variant="overline"
          sx={{
            color: "#475569",
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{ mt: 1, color: "#0f172a", fontWeight: 700 }}
        >
          {value}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1.5, color: "#64748b" }}>
          {helperText}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default MetricCard;
