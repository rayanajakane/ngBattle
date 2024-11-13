import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameEndPageComponent } from './game-end-page.component';

describe('GameEndPageComponent', () => {
  let component: GameEndPageComponent;
  let fixture: ComponentFixture<GameEndPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameEndPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameEndPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
