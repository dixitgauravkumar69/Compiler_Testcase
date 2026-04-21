import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSimiplarity } from './code-simiplarity';

describe('CodeSimiplarity', () => {
  let component: CodeSimiplarity;
  let fixture: ComponentFixture<CodeSimiplarity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeSimiplarity],
    }).compileComponents();

    fixture = TestBed.createComponent(CodeSimiplarity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
