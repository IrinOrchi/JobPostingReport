import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceJobPostingsService } from '../../services/serviceJobPostings.service';
import { JobReportItem, ServiceTypeDropdownOption } from '../../models/job-report.model';



@Component({
  selector: 'app-service-wise-job-postings',
  imports: [CommonModule, FormsModule],
  templateUrl: './service-wise-job-postings.html',
  styleUrl: './service-wise-job-postings.scss',
})
export class ServiceWiseJobPostings implements OnInit {
  fromDate: string = '';
  toDate: string = '';

  serviceTypes: ServiceTypeDropdownOption[] = [
    { label: 'All', serviceType: null, jobType: null },
    { label: 'SME', serviceType: 10, jobType: 'J' },
    { label: 'Standard Listing', serviceType: 0, jobType: 'J' },
    { label: 'Premium Listing', serviceType: 1, jobType: 'J' },
    { label: 'Premium Plus', serviceType: 2, jobType: 'J' },
    { label: 'Hot Job', serviceType: 1, jobType: 'H' },
    { label: 'PNPL', serviceType: 0, jobType: 'J' },
    { label: 'Free Listing', serviceType: 12, jobType: 'J' },
    { label: 'Internship Announcement', serviceType: 13, jobType: 'J' },
    { label: 'Blue Collar', serviceType: 14, jobType: 'J' }
  ];

  selectedServiceType: ServiceTypeDropdownOption = this.serviceTypes[0];

  todayStr: string = '';
  yesterdayStr: string = '';

  isSelectOpen: boolean = false;

  jobs: JobReportItem[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 20;
  pageSizeOptions = [20, 50, 100];
  isLoading: boolean = false;
  hasSearched: boolean = false;

  constructor(private jobService: ServiceJobPostingsService) {}

  ngOnInit(): void {
    this.initDates();
  }

  selectServiceType(opt: ServiceTypeDropdownOption): void {
    this.selectedServiceType = opt;
    this.isSelectOpen = false;
    if (opt.label === 'All') {
      this.hasSearched = false;
      this.jobs = [];
      this.totalCount = 0;
    }
  }

  initDates(): void {
    const today = new Date();
    this.todayStr = this.formatDate(today);



    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    this.yesterdayStr = this.formatDate(yesterday);

    this.fromDate = this.yesterdayStr;
    this.toDate = this.yesterdayStr;
  }

  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  formatDateToApi(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10).toString();
      const day = parseInt(parts[2], 10).toString();
      return `${month}/${day}/${year}`;
    }
    return dateStr;
  }

  getServiceTypeName(job: JobReportItem): string {
    if (job.serviceType !== undefined && job.jobType !== undefined) {
      const sType = Number(job.serviceType);
      const jType = String(job.jobType);
      if (sType === 0 && jType === 'J') return 'PNPL';
      if (sType === 0 && jType === 'J') return 'Standard Listing';
      if (sType === 1 && jType === 'H') return 'Hot Job';
      if (sType === 1 && jType === 'J') return 'Premium Listing';
      if (sType === 2 && jType === 'J') return 'Premium Plus';
      if (sType === 10 && jType === 'J') return 'SME';
      if (sType === 12 && jType === 'J') return 'Free Listing';
      if (sType === 13 && jType === 'J') return 'Internship Announcement';
      if (sType === 14 && jType === 'J') return 'Blue Collar';
    }
    if (typeof job.serviceType === 'string' && job.serviceType.length > 0) {
      return job.serviceType;
    }
    if (this.selectedServiceType.label !== 'All') {
      return this.selectedServiceType.label;
    }
    return '-';
  }

  fetchJobs(): void {
    this.isLoading = true;
    const formattedFrom = this.formatDateToApi(this.fromDate);
    const formattedTo = this.formatDateToApi(this.toDate);

    this.jobService
      .getJobPostings(
        formattedFrom,
        formattedTo,
        this.selectedServiceType.serviceType,
        this.selectedServiceType.jobType,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.jobs = res;
          this.totalCount = res.length > 0 ? res[0].totalRow : 0;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.jobs = [];
          this.totalCount = 0;
        },
      });
  }


  onSubmit(): void {
    if (this.selectedServiceType.label === 'All') {
      this.hasSearched = false;
      this.jobs = [];
      this.totalCount = 0;
      return;
    }
    this.hasSearched = true;
    this.currentPage = 1;
    this.fetchJobs();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.fetchJobs();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 8) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3, 4, 5, 6, 7, 8);
      if (total > 9) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchJobs();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchJobs();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchJobs();
    }
  }

  getSerialNumber(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  getEndRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }
}
