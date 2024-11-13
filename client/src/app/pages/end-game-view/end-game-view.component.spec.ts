import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndGameViewComponent } from './end-game-view.component';

describe('EndGameViewComponent', () => {
  let component: EndGameViewComponent;
  let fixture: ComponentFixture<EndGameViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndGameViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndGameViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
