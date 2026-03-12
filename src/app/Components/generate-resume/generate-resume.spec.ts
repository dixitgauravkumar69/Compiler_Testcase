import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateResume } from './generate-resume';

describe('GenerateResume', () => {
  let component: GenerateResume;
  let fixture: ComponentFixture<GenerateResume>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateResume],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateResume);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
