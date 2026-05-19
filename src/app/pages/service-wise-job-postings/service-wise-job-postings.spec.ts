import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceWiseJobPostings } from './service-wise-job-postings';

describe('ServiceWiseJobPostings', () => {
  let component: ServiceWiseJobPostings;
  let fixture: ComponentFixture<ServiceWiseJobPostings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceWiseJobPostings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceWiseJobPostings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
