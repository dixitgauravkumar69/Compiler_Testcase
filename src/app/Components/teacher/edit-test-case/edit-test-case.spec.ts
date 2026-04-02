import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTestCase } from './edit-test-case';

describe('EditTestCase', () => {
  let component: EditTestCase;
  let fixture: ComponentFixture<EditTestCase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTestCase],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTestCase);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
