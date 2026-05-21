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
  displayCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 20;
  pageSizeOptions = [20, 50, 100];
  isLoading: boolean = false;
  hasSearched: boolean = false;
  private countAnimationFrame: any = null;

  // Search by CPID / JPID
  searchCpid: string = '';
  searchJpid: string = '';
  isSearchMode: boolean = false;
  isLoadingAllData: boolean = false;
  allJobs: JobReportItem[] = [];
  filteredJobs: JobReportItem[] = [];
  allDataFetched: boolean = false;

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
    this.displayCount = 0;
    this.startLoadingCount();
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
          this.animateCount(this.totalCount);
        },
        error: () => {
          this.isLoading = false;
          this.stopCountAnimation();
          this.jobs = [];
          this.totalCount = 0;
          this.displayCount = 0;
        },
      });
  }

  /** Fetch ALL records so we can search locally across the full dataset */
  fetchAllJobs(): void {
    if (this.allDataFetched && this.allJobs.length > 0) {
      this.applyLocalFilter();
      return;
    }

    this.isLoadingAllData = true;
    this.isLoading = true;
    const formattedFrom = this.formatDateToApi(this.fromDate);
    const formattedTo = this.formatDateToApi(this.toDate);

    // Fetch all records at once by using totalCount (or a large number) as pageSize
    const fetchSize = this.totalCount > 0 ? this.totalCount : 100000;

    this.jobService
      .getJobPostings(
        formattedFrom,
        formattedTo,
        this.selectedServiceType.serviceType,
        this.selectedServiceType.jobType,
        1,
        fetchSize
      )
      .subscribe({
        next: (res) => {
          this.allJobs = res;
          this.allDataFetched = true;
          this.isLoadingAllData = false;
          this.isLoading = false;
          this.applyLocalFilter();
        },
        error: () => {
          this.isLoadingAllData = false;
          this.isLoading = false;
          this.allJobs = [];
        },
      });
  }

  /** Apply CPID / JPID filter on cached allJobs */
  applyLocalFilter(): void {
    let filtered = [...this.allJobs];

    const cpidTerm = this.searchCpid.trim();
    const jpidTerm = this.searchJpid.trim();

    if (cpidTerm) {
      filtered = filtered.filter(job =>
        String(job.cP_ID).includes(cpidTerm)
      );
    }

    if (jpidTerm) {
      filtered = filtered.filter(job =>
        String(job.jP_ID).includes(jpidTerm)
      );
    }

    this.filteredJobs = filtered;
    this.totalCount = filtered.length;
    this.currentPage = 1;
    this.jobs = this.getPagedFilteredJobs();
    this.animateCount(this.totalCount);
  }

  /** Get the current page slice from filteredJobs */
  getPagedFilteredJobs(): JobReportItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredJobs.slice(start, end);
  }

  /** Triggered when user clicks the search button */
  onSearchById(): void {
    const cpidTerm = this.searchCpid.trim();
    const jpidTerm = this.searchJpid.trim();

    if (!cpidTerm && !jpidTerm) {
      return;
    }

    this.isSearchMode = true;
    this.fetchAllJobs();
  }

  /** Clear search and revert to normal paginated view */
  clearSearch(): void {
    this.searchCpid = '';
    this.searchJpid = '';
    this.isSearchMode = false;
    this.filteredJobs = [];
    this.currentPage = 1;
    this.displayCount = 0;
    this.fetchJobs();
  }

  startLoadingCount(): void {
    this.stopCountAnimation();
    this.displayCount = 0;

    let lastTimestamp = 0;
    const step = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;

      // Update every 200ms, increment by 1–3 for a slow, readable count
      if (delta >= 200) {
        const increment = Math.floor(Math.random() * 3) + 1;
        this.displayCount += increment;
        lastTimestamp = timestamp;
      }

      if (this.isLoading) {
        this.countAnimationFrame = requestAnimationFrame(step);
      }
    };

    this.countAnimationFrame = requestAnimationFrame(step);
  }

  stopCountAnimation(): void {
    if (this.countAnimationFrame) {
      cancelAnimationFrame(this.countAnimationFrame);
      this.countAnimationFrame = null;
    }
  }

  animateCount(target: number): void {
    this.stopCountAnimation();
    if (target === 0) { this.displayCount = 0; return; }

    const startValue = this.displayCount;
    const duration = 700;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayCount = Math.round(startValue + (target - startValue) * eased);

      if (progress < 1) {
        this.countAnimationFrame = requestAnimationFrame(step);
      } else {
        this.displayCount = target;
      }
    };

    this.countAnimationFrame = requestAnimationFrame(step);
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
    // Reset search state on new submit
    this.isSearchMode = false;
    this.searchCpid = '';
    this.searchJpid = '';
    this.allJobs = [];
    this.allDataFetched = false;
    this.filteredJobs = [];
    this.fetchJobs();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    if (this.isSearchMode) {
      this.jobs = this.getPagedFilteredJobs();
    } else {
      this.fetchJobs();
    }
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
      if (this.isSearchMode) {
        this.jobs = this.getPagedFilteredJobs();
      } else {
        this.fetchJobs();
      }
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.isSearchMode) {
        this.jobs = this.getPagedFilteredJobs();
      } else {
        this.fetchJobs();
      }
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.isSearchMode) {
        this.jobs = this.getPagedFilteredJobs();
      } else {
        this.fetchJobs();
      }
    }
  }

  getSerialNumber(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  getEndRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }
}
