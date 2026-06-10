import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalInfoComponent } from './personal-info.component';

describe('PersonalInfo', () => {
  let component: PersonalInfoComponent;
  let fixture: ComponentFixture<PersonalInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalInfoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
