import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { JobReportItem, JobReportResponse } from '../models/job-report.model';

@Injectable({ providedIn: 'root' })
export class ServiceJobPostingsService {
  private apiUrl = 'https://mis.bdjobs.com/jobreports/api/JobReports/GetJobReportsDetails'; 

  constructor(private http: HttpClient) {}

  getJobPostings(
    fromDate: string,
    toDate: string,
    serviceType: number | null,
    jobType: string | null,
    pageNo: number,
    pageSize: number
  ): Observable<JobReportItem[]> {
    let params = new HttpParams()
      .set('FromPublishDate', fromDate)
      .set('ToPublishDate', toDate)
      .set('PageNo', pageNo.toString())
      .set('PageSize', pageSize.toString());

    if (serviceType !== null && serviceType !== undefined) {
      params = params.set('ServiceType', serviceType.toString());
    }
    if (jobType !== null && jobType !== undefined) {
      params = params.set('JobType', jobType);
    }

    return this.http.get<JobReportItem[]>(this.apiUrl, { params });
  }
}

