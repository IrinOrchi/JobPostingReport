export interface JobReportItem {
  jP_ID: number;
  jobTitle: string;
  cP_ID: number;
  name?: string;
  companyName: string;
  publishDate: string;
  adType?: number;
  regionalJob?: number;
  jType?: string;
  RegionalJob?: number;
  summaryView?: string;
  detailView?: string;
  applyView?: string;
  totalApply: number;
  totalRow: number;

  sl?: number;
  jpId?: number;
  cpId?: number;
  categoryName?: string;
  serviceType?: string | number;
  jobType?: string;
  deadLine?: string;
  jobSummary?: number;
  caT_NAME?: string;
  jobDetails?: number;
}

export interface JobReportResponse {
  totalCount: number;
  data: JobReportItem[];
}

export interface ServiceType {
  value: string;
  label: string;
}

export interface ServiceTypeDropdownOption {
  label: string;
  serviceType: number | null;
  jobType: string | null;
  RegionalJob: number | null;
}