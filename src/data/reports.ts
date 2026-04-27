import {
  generateMockEvent,
  ProductionLineInterval,
  ProductionLineStatus,
} from "./events";

export interface ProductionLineIntervalPerformance extends ProductionLineInterval {
  speed: number;
  performance: number;
}

export interface DowntimeReport {
  name: string;
  numberOfEvents: number;
  totalDowntime: number;
}

export interface Report {
  intervals: ProductionLineIntervalPerformance[];
  downtimeReport: DowntimeReport[];
  averageSpeed: number;
  totalProductsProduced: number;
  averagePerformance: number;
}

const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
const FIVE_HOURS_IN_MILLISECONDS = ONE_HOUR_IN_MILLISECONDS * 5;

function getRandomTimeBetweenWithMinimumTimeElapsed(
  start: Date,
  end: Date,
): Date {
  const startTime = start.getTime() + ONE_HOUR_IN_MILLISECONDS;
  const endTime = Math.min(
    start.getTime() + FIVE_HOURS_IN_MILLISECONDS,
    end.getTime(),
  );

  if (startTime > endTime) {
    return end;
  }

  return new Date(
    Math.floor(Math.random() * (endTime - startTime) + startTime),
  );
}

function getIntervalDurationInSeconds(
  interval: ProductionLineInterval,
): number {
  return Math.max(
    0,
    (interval.endTime.getTime() - interval.startTime.getTime()) / 1000,
  );
}

function getIntervalSpeed(interval: ProductionLineInterval): number {
  const durationInSeconds = getIntervalDurationInSeconds(interval);

  if (durationInSeconds === 0) {
    return 0;
  }

  return interval.productsProduced / durationInSeconds;
}

function getIntervalPerformances(
  intervals: ProductionLineInterval[],
): ProductionLineIntervalPerformance[] {
  const maxIntervalSpeed = intervals.reduce((maxSpeed, interval) => {
    return Math.max(maxSpeed, getIntervalSpeed(interval));
  }, 0);

  return intervals.map((interval) => {
    const speed = getIntervalSpeed(interval);
    return {
      ...interval,
      speed,
      performance: maxIntervalSpeed === 0 ? 0 : speed / maxIntervalSpeed,
    };
  });
}

function getDowntimeReport(
  intervals: ProductionLineInterval[],
): DowntimeReport[] {
  const downtimeMap: Record<string, ProductionLineInterval[]> = {};
  for (const interval of intervals) {
    if (
      interval.status === ProductionLineStatus.DOWNTIME &&
      interval.downtimeReason
    ) {
      if (!downtimeMap[interval.downtimeReason]) {
        downtimeMap[interval.downtimeReason] = [];
      }
      downtimeMap[interval.downtimeReason].push(interval);
    }
  }

  return Object.entries(downtimeMap).map(([reason, intervals]) => ({
    name: reason,
    numberOfEvents: intervals.length,
    totalDowntime: intervals.reduce((total, interval) => {
      return total + getIntervalDurationInSeconds(interval);
    }, 0),
  }));
}

export function getReport(startTime: Date, endTime: Date): Report {
  const intervals: ProductionLineInterval[] = [];

  let currTime = startTime;
  while (currTime < endTime) {
    const intervalEndTime = getRandomTimeBetweenWithMinimumTimeElapsed(
      currTime,
      endTime,
    );

    const interval = generateMockEvent(currTime, intervalEndTime);
    intervals.push(interval);
    currTime = intervalEndTime;
  }

  const intervalWithPerformances = getIntervalPerformances(intervals);

  const totalProductsProduced = intervals.reduce((total, interval) => {
    return total + interval.productsProduced;
  }, 0);

  const intervalsForAverages = intervalWithPerformances.filter((interval) => {
    return interval.status !== ProductionLineStatus.STOPPED;
  });

  const totalUptimeDurationInSeconds = intervalsForAverages.reduce(
    (total, interval) => {
      return total + getIntervalDurationInSeconds(interval);
    },
    0,
  );

  const averageSpeed =
    totalUptimeDurationInSeconds === 0
      ? 0
      : totalProductsProduced / totalUptimeDurationInSeconds;

  const maxIntervalSpeed = intervalWithPerformances.reduce(
    (currentMax, interval) => {
      return Math.max(currentMax, interval.speed);
    },
    0,
  );

  const averagePerformance =
    maxIntervalSpeed === 0 ? 0 : averageSpeed / maxIntervalSpeed;

  return {
    intervals: intervalWithPerformances,
    downtimeReport: getDowntimeReport(intervals),
    averageSpeed,
    totalProductsProduced,
    averagePerformance,
  };
}
