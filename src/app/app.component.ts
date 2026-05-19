import { Component, computed, inject, signal } from '@angular/core';
import { ServiceWiseJobPostings } from './pages/service-wise-job-postings/service-wise-job-postings';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
   standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
 
}
