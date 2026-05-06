import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectKnowledge } from './project-knowledge';

describe('ProjectKnowledge', () => {
  let component: ProjectKnowledge;
  let fixture: ComponentFixture<ProjectKnowledge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectKnowledge],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectKnowledge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
