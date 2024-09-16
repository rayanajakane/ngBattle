import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileBasicComponent } from './tile-basic.component';

describe('TileBasicComponent', () => {
  let component: TileBasicComponent;
  let fixture: ComponentFixture<TileBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TileBasicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TileBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
