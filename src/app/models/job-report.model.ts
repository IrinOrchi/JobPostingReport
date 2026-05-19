export interface JobReportItem {
  sl: number;
  jpId: number;
  jobTitle: string;
  cpId: number;
  companyName: string;
  categoryName: string;
  serviceType: string;
  publishDate: string;
  deadline: string;
  jobSummary: number;
  jobDetails: number;
  totalApply: number;
}

export interface JobReportResponse {
  totalCount: number;
  data: JobReportItem[];
}

export interface ServiceType {
  value: string;
  label: string;
}
