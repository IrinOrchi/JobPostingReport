import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceJobPostingsService } from '../../services/serviceJobPostings.service';
import { JobReportItem } from '../../models/job-report.model';

@Component({
  selector: 'app-service-wise-job-postings',
  imports: [CommonModule, FormsModule],
  templateUrl: './service-wise-job-postings.html',
  styleUrl: './service-wise-job-postings.scss',
})
export class ServiceWiseJobPostings implements OnInit {
  fromDate: string = '';
  toDate: string = '';
  selectedServiceType: string = 'All';

  todayStr: string = '';
  twoYearsLaterStr: string = '';
  yesterdayStr: string = '';

  serviceTypes = [
    'All',
    'SME Package',
    'Standard Listing',
    'Premium Listing',
    'Premium Plus',
    'PNPL',
    'Hot Job',
    'Internship Announcement',
    'Blue Collar Job'
  ];

  isSelectOpen: boolean = false;

  jobs: JobReportItem[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 20;
  pageSizeOptions = [10, 20, 50, 100];
  isLoading: boolean = false;

  constructor(private jobService: ServiceJobPostingsService) {}

  ngOnInit(): void {
    this.initDates();
    this.fetchJobs();
  }

  selectServiceType(opt: string): void {
    this.selectedServiceType = opt;
    this.isSelectOpen = false;
  }

  initDates(): void {
    const today = new Date();
    this.todayStr = this.formatDate(today);

    const twoYearsLater = new Date();
    twoYearsLater.setFullYear(today.getFullYear() + 2);
    this.twoYearsLaterStr = this.formatDate(twoYearsLater);

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    this.yesterdayStr = this.formatDate(yesterday);

    // Default dates adhering to user rules
    this.fromDate = this.todayStr;
    this.toDate = this.yesterdayStr;
  }

  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  fetchJobs(): void {
    this.isLoading = true;
    this.jobService
      .getJobPostings(
        this.fromDate,
        this.toDate,
        this.selectedServiceType,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.jobs = res.data;
          this.totalCount = res.totalCount;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onSubmit(): void {
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
