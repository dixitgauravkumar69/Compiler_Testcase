import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Servererror } from './servererror';

describe('Servererror', () => {
  let component: Servererror;
  let fixture: ComponentFixture<Servererror>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Servererror],
    }).compileComponents();

    fixture = TestBed.createComponent(Servererror);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
