import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeExecution } from './code-execution';

describe('CodeExecution', () => {
  let component: CodeExecution;
  let fixture: ComponentFixture<CodeExecution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeExecution],
    }).compileComponents();

    fixture = TestBed.createComponent(CodeExecution);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
