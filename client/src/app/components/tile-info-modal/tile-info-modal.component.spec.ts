import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileInfoModalComponent } from './tile-info-modal.component';

describe('TileInfoModalComponent', () => {
  let component: TileInfoModalComponent;
  let fixture: ComponentFixture<TileInfoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TileInfoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TileInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
