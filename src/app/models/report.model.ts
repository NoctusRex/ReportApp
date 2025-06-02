export type Report = {
  id: number;
  year: number;
  persons: Array<string>;
  judges: Array<string>;
  report: string;
  level: ReportLevel;
};

export type ReportLevel = 'pre-warning' | 'warning' | 'strike';
