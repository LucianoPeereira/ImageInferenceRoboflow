import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectDetectionListComponent } from './object-detection-list.component';

describe('ObjectDetectionListComponent', () => {
  let component: ObjectDetectionListComponent;
  let fixture: ComponentFixture<ObjectDetectionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectDetectionListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectDetectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
