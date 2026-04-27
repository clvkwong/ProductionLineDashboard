export enum ProductionLineStatus {
  RUNNING = "RUNNING",
  DOWNTIME = "DOWNTIME",
  STOPPED = "STOPPED",
}

export interface ProductionLineInterval {
  id: number;
  status: ProductionLineStatus;
  productsProduced: number;
  startTime: Date;
  endTime: Date;
  downtimeReason?: string;
}

const WEIGHTED_PRODUCTION_LINE_STATUS_LIST = [
  ProductionLineStatus.RUNNING,
  ProductionLineStatus.RUNNING,
  ProductionLineStatus.RUNNING,
  ProductionLineStatus.DOWNTIME,
  ProductionLineStatus.STOPPED,
];

const SAMPLE_DOWNTIME_REASONS = [
  "Conveyor belt breakdown",
  "Electrical issue",
  "Waiting on products",
];

function getRandomListItem(list: any[]): any {
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function generateMockEvent(
  startTime: Date,
  endTime: Date,
): ProductionLineInterval {
  const status = getRandomListItem(WEIGHTED_PRODUCTION_LINE_STATUS_LIST);

  const interval: ProductionLineInterval = {
    id: startTime.getTime(),
    status: status,
    productsProduced: 0,
    startTime,
    endTime,
  };

  switch (status) {
    case ProductionLineStatus.DOWNTIME:
      interval.downtimeReason = getRandomListItem(SAMPLE_DOWNTIME_REASONS);
      break;
    case ProductionLineStatus.STOPPED:
      interval.productsProduced = 0;
      break;
    case ProductionLineStatus.RUNNING:
      // estimate upper limit of 10 products per second
      const durationInSeconds =
        (endTime.getTime() - startTime.getTime()) / 1000;
      interval.productsProduced = getRandomIntInclusive(
        1,
        10 * durationInSeconds,
      );
      break;
  }

  return interval;
}
