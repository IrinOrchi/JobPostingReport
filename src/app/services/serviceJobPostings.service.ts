import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { JobReportItem, JobReportResponse } from '../models/job-report.model';

@Injectable({ providedIn: 'root' })
export class ServiceJobPostingsService {
  private apiUrl = 'https://api.example.com/job-postings/service-wise'; // Replace with actual API

  constructor(private http: HttpClient) {}

  getJobPostings(
    fromDate: string,
    toDate: string,
    serviceType: string,
    page: number,
    pageSize: number
  ): Observable<JobReportResponse> {
    // Mock data for development
    const mockData: JobReportItem[] = [
      {
        sl: 1, jpId: 1484244, jobTitle: 'Thai Chef', cpId: 146617,
        companyName: 'Eena Mart Super Shop', categoryName: 'Chef/Cook',
        serviceType: 'SME', publishDate: '2026-05-03 15:54:00',
        deadline: '2026-05-13 00:00:00', jobSummary: 250, jobDetails: 150, totalApply: 50
      },
      {
        sl: 2, jpId: 1484301, jobTitle: 'Senior Software Engineer', cpId: 147200,
        companyName: 'TechVision Ltd', categoryName: 'IT/Software',
        serviceType: 'Corporate', publishDate: '2026-05-04 10:30:00',
        deadline: '2026-05-20 00:00:00', jobSummary: 520, jobDetails: 380, totalApply: 120
      },
      {
        sl: 3, jpId: 1484388, jobTitle: 'Marketing Manager', cpId: 148050,
        companyName: 'GlobalBrands BD', categoryName: 'Marketing/Sales',
        serviceType: 'SME', publishDate: '2026-05-05 09:15:00',
        deadline: '2026-05-25 00:00:00', jobSummary: 310, jobDetails: 200, totalApply: 75
      },
      {
        sl: 4, jpId: 1484455, jobTitle: 'Accounts Executive', cpId: 148320,
        companyName: 'FinServe Bangladesh', categoryName: 'Accounts/Finance',
        serviceType: 'Basic', publishDate: '2026-05-06 11:00:00',
        deadline: '2026-05-26 00:00:00', jobSummary: 180, jobDetails: 120, totalApply: 35
      },
      {
        sl: 5, jpId: 1484512, jobTitle: 'HR Officer', cpId: 148600,
        companyName: 'PrimeStaff Solutions', categoryName: 'Human Resources',
        serviceType: 'Corporate', publishDate: '2026-05-07 14:00:00',
        deadline: '2026-05-27 00:00:00', jobSummary: 420, jobDetails: 290, totalApply: 98
      },
    ];

    const response: JobReportResponse = { totalCount: 397, data: mockData };
    return of(response);

    // Uncomment for real API:
    // const params = new HttpParams()
    //   .set('fromDate', fromDate)
    //   .set('toDate', toDate)
    //   .set('serviceType', serviceType)
    //   .set('page', page.toString())
    //   .set('pageSize', pageSize.toString());
    // return this.http.get<JobReportResponse>(this.apiUrl, { params });
  }
}
