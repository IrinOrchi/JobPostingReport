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
    { label: 'All', serviceType: -1, jobType: 'all', RegionalJob: 0 },
    { label: 'SME', serviceType: 10, jobType: 'J', RegionalJob: 0 },
    { label: 'Standard Listing', serviceType: 0, jobType: 'J', RegionalJob: 0 },
    { label: 'Premium Listing', serviceType: 1, jobType: 'J', RegionalJob: 0 },
    { label: 'Premium Plus', serviceType: 2, jobType: 'J', RegionalJob: 0 },
    { label: 'Hot Job', serviceType: 1, jobType: 'H', RegionalJob: 0 },
    { label: 'PNPL', serviceType: 0, jobType: 'J', RegionalJob: 5 },
    // { label: 'Free Listing', serviceType: 12, jobType: 'J', RegionalJob: 0 },
    { label: 'Internship Announcement', serviceType: 13, jobType: 'J', RegionalJob: 0 },
    { label: 'Blue Collar', serviceType: 14, jobType: 'J', RegionalJob: 0 }
  ];

  selectedServiceType: ServiceTypeDropdownOption = this.serviceTypes[0];

  todayStr: string = '';
  yesterdayStr: string = '';
  /** Earliest selectable publish date */
  readonly minDateStr = '2025-03-25';
  dateRangeError = '';

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

  sortColumn: 'summaryView' | 'detailView' | 'totalApply' | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  private readonly defaultSortColumns: Array<'summaryView' | 'detailView' | 'totalApply'> = [
    'summaryView',
    'detailView',
    'totalApply',
  ];

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

    const defaultDate =
      this.yesterdayStr >= this.minDateStr ? this.yesterdayStr : this.minDateStr;
    this.fromDate = defaultDate;
    this.toDate = defaultDate;
    this.updateDateRangeError();
  }

  get toDateMin(): string {
    if (this.fromDate && this.fromDate >= this.minDateStr) {
      return this.fromDate;
    }
    return this.minDateStr;
  }

  get isDateRangeValid(): boolean {
    return (
      !!this.fromDate &&
      !!this.toDate &&
      this.fromDate >= this.minDateStr &&
      this.toDate >= this.minDateStr &&
      this.toDate >= this.fromDate &&
      this.toDate <= this.yesterdayStr &&
      this.fromDate <= this.yesterdayStr
    );
  }

  onFromDateChange(value: string): void {
    this.fromDate = this.clampDate(value, this.minDateStr, this.yesterdayStr);
    if (this.toDate < this.fromDate) {
      this.toDate = this.fromDate;
    }
    this.updateDateRangeError();
  }

  onToDateChange(value: string): void {
    this.toDate = this.clampDate(value, this.toDateMin, this.yesterdayStr);
    this.updateDateRangeError();
  }

  private clampDate(value: string, min: string, max: string): string {
    if (!value) return min;
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  private updateDateRangeError(): void {
    if (!this.fromDate || !this.toDate) {
      this.dateRangeError = '';
      return;
    }
    if (this.toDate < this.fromDate) {
      this.dateRangeError = 'To Date must be on or after From Date.';
    } else {
      this.dateRangeError = '';
    }
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
    const row = job as JobReportItem & Record<string, unknown>;
    const serviceType =
      job.adType ?? job.serviceType ?? row['adType'] ?? row['AdType'] ?? row['ServiceType'];
    const jType =
      job.jType ?? job.jobType ?? row['jType'] ?? row['JType'] ?? row['jobType'] ?? row['JobType'];
    const regionalJob =
      job.regionalJob ?? job.RegionalJob ?? row['regionalJob'] ?? row['RegionalJob'];

    if (
      serviceType !== undefined &&
      serviceType !== null &&
      jType !== undefined &&
      jType !== null &&
      regionalJob !== undefined &&
      regionalJob !== null
    ) {
      const sType = Number(serviceType);
      const jTypeStr = String(jType);
      const rJob = Number(regionalJob);
      if (sType === 0 && jTypeStr === 'J' && rJob === 5) return 'PNPL';
      if (sType === 0 && jTypeStr === 'J' && rJob === 0) return 'Standard Listing';
      if (sType === 1 && jTypeStr === 'H' && rJob === 0) return 'Hot Job';
      if (sType === 1 && jTypeStr === 'J' && rJob === 0) return 'Premium Listing';
      if (sType === 2 && jTypeStr === 'J' && rJob === 0) return 'Premium Plus';
      if (sType === 10 && jTypeStr === 'J' && rJob === 0) return 'SME';
      if (sType === 12 && jTypeStr === 'J' && rJob === 0) return 'Free Listing';
      if (sType === 13 && jTypeStr === 'J' && rJob === 0) return 'Internship Announcement';
      if (sType === 14 && jTypeStr === 'J' && rJob === 0) return 'Blue Collar';
    }

    if (this.selectedServiceType.label !== 'All') {
      return this.selectedServiceType.label;
    }

    return '-';
  }

  fetchJobs(isPagination: boolean = false): void {
    if (this.allDataFetched && !this.isSearchMode) {
      this.jobs = this.getPagedAllJobs();
      return;
    }

    this.isLoading = true;

    if (!isPagination) {
      this.displayCount = 0;
      this.startLoadingCount();
    }

    const formattedFrom = this.formatDateToApi(this.fromDate);
    const formattedTo = this.formatDateToApi(this.toDate);
    const fetchSize = this.totalCount > 0 ? this.totalCount : 100000;

    this.jobService
      .getJobPostings(
        formattedFrom,
        formattedTo,
        this.selectedServiceType.serviceType,
        this.selectedServiceType.jobType,
        1,
        fetchSize,
        this.selectedServiceType.RegionalJob
      )
      .subscribe({
        next: (res) => {
          this.allJobs = this.sortJobList(res);
          this.allDataFetched = true;
          const newTotal = res.length > 0 ? res[0].totalRow : res.length;

          this.totalCount = newTotal;
          this.jobs = this.getPagedAllJobs();

          if (!isPagination) {
            this.animateCount(this.totalCount);
          } else {
            this.displayCount = newTotal;
          }

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.stopCountAnimation();
          this.jobs = [];
          this.allJobs = [];
          this.allDataFetched = false;
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
        fetchSize,
        this.selectedServiceType.RegionalJob
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

    this.filteredJobs = this.sortJobList(filtered);
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

  /** Get the current page slice from allJobs */
  getPagedAllJobs(): JobReportItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.allJobs.slice(start, end);
  }

  /** Triggered when user clicks the search button */
  onSearchById(): void {
    const cpidTerm = this.searchCpid.trim();
    const jpidTerm = this.searchJpid.trim();

    if (!cpidTerm && !jpidTerm) {
      return;
    }

    this.isSearchMode = true;
    if (this.allDataFetched) {
      this.applyLocalFilter();
    } else {
      this.fetchAllJobs();
    }
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
    this.updateDateRangeError();
    if (!this.isDateRangeValid) {
      return;
    }
    this.hasSearched = true;
    this.currentPage = 1;
    this.sortColumn = null;
    this.sortDirection = 'asc';
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
    } else if (this.allDataFetched) {
      this.jobs = this.getPagedAllJobs();
    } else {
      this.fetchJobs(true);
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
      } else if (this.allDataFetched) {
        this.jobs = this.getPagedAllJobs();
      } else {
        this.fetchJobs(true);
      }
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.isSearchMode) {
        this.jobs = this.getPagedFilteredJobs();
      } else if (this.allDataFetched) {
        this.jobs = this.getPagedAllJobs();
      } else {
        this.fetchJobs(true);
      }
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.isSearchMode) {
        this.jobs = this.getPagedFilteredJobs();
      } else if (this.allDataFetched) {
        this.jobs = this.getPagedAllJobs();
      } else {
        this.fetchJobs(true);
      }
    }
  }

  getSerialNumber(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  getEndRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  toggleSort(column: 'summaryView' | 'detailView' | 'totalApply'): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    this.applyCurrentSort();
  }

  private applyCurrentSort(): void {
    this.currentPage = 1;
    if (this.isSearchMode) {
      this.filteredJobs = this.sortJobList(this.filteredJobs);
      this.jobs = this.getPagedFilteredJobs();
    } else if (this.allDataFetched) {
      this.allJobs = this.sortJobList(this.allJobs);
      this.jobs = this.getPagedAllJobs();
    } else {
      this.jobs = this.sortJobList(this.jobs);
    }
  }

  private getNumericSortValue(
    job: JobReportItem,
    column: 'summaryView' | 'detailView' | 'totalApply'
  ): number {
    switch (column) {
      case 'summaryView':
        return Number(job.summaryView) || 0;
      case 'detailView':
        return Number(job.detailView) || 0;
      case 'totalApply':
        return Number(job.totalApply) || 0;
    }
  }

  isDefaultSort(): boolean {
    return this.sortColumn === null;
  }

  isColumnAsc(column: 'summaryView' | 'detailView' | 'totalApply'): boolean {
    return this.isDefaultSort() || (this.sortColumn === column && this.sortDirection === 'asc');
  }

  isColumnDesc(column: 'summaryView' | 'detailView' | 'totalApply'): boolean {
    return this.sortColumn === column && this.sortDirection === 'desc';
  }

  isColumnSortActive(column: 'summaryView' | 'detailView' | 'totalApply'): boolean {
    return this.isDefaultSort() || this.sortColumn === column;
  }

  private sortJobList(list: JobReportItem[]): JobReportItem[] {
    return [...list].sort((a, b) => {
      if (this.sortColumn === null) {
        for (const col of this.defaultSortColumns) {
          const diff = this.getNumericSortValue(a, col) - this.getNumericSortValue(b, col);
          if (diff !== 0) {
            return diff;
          }
        }
        return 0;
      }

      const direction = this.sortDirection === 'asc' ? 1 : -1;
      return (
        (this.getNumericSortValue(a, this.sortColumn) -
          this.getNumericSortValue(b, this.sortColumn)) *
        direction
      );
    });
  }
}
