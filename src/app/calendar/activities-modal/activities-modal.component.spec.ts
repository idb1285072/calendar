import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesModalComponent } from './activities-modal.component';

describe('ActivitiesModalComponent', () => {
  let component: ActivitiesModalComponent;
  let fixture: ComponentFixture<ActivitiesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivitiesModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivitiesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
