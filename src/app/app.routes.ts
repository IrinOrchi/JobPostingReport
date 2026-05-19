import { Routes } from '@angular/router';
import { ServiceWiseJobPostings } from './pages/service-wise-job-postings/service-wise-job-postings';
export const routes: Routes = [
     {
    path: '',
    redirectTo: 'ServiceWise',
    pathMatch: 'full'
  },
  {
    path: 'ServiceWise',
    component: ServiceWiseJobPostings
  }
  
];
