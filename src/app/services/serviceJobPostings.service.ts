import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobReportItem } from '../models/job-report.model';

export interface LocationItem {
  id: number;
  name: string;
}

interface LocationApiResponse {
  data: LocationItem[];
}

@Injectable({ providedIn: 'root' })
export class ServiceJobPostingsService {
  private apiUrl = 'https://mis.bdjobs.com/jobreports/api/JobReports/GetJobReportsDetails';

  constructor(private http: HttpClient) { }

  getJobPostings(
    fromDate: string,
    toDate: string,
    serviceType: number | null,
    jobType: string | null,
    pageNo: number,
    pageSize: number,
    RegionalJob: number | null,
    locationId?: number | null
  ): Observable<JobReportItem[]> {
    let params = new HttpParams()
      .set('FromPublishDate', fromDate)
      .set('ToPublishDate', toDate)
      .set('PageNo', pageNo.toString())
      .set('PageSize', pageSize.toString())
      .set('RegionalJob', RegionalJob?.toString() || '');

    if (serviceType !== null && serviceType !== undefined) {
      params = params.set('ServiceType', serviceType.toString());
    }
    if (jobType !== null && jobType !== undefined) {
      params = params.set('JobType', jobType);
    }
    if (locationId !== null && locationId !== undefined) {
      params = params.set('LocationID', locationId.toString());
    }

    return this.http.get<JobReportItem[]>(this.apiUrl, { params });
  }

  getLocations(search: string): Observable<LocationApiResponse> {
    const url = 'https://api.bdjobs.com/EmployerApi/api/Location';
    const params = new HttpParams().set('search', search);
    return this.http.get<LocationApiResponse>(url, { params });
  }
}
