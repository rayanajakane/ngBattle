import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombatTimerComponent } from './combat-timer.component';

describe('CombatTimerComponent', () => {
  let component: CombatTimerComponent;
  let fixture: ComponentFixture<CombatTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombatTimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombatTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
