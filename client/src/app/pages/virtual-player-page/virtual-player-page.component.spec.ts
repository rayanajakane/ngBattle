import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualPlayerPageComponent } from './virtual-player-page.component';

describe('VirtualPlayerPageComponent', () => {
  let component: VirtualPlayerPageComponent;
  let fixture: ComponentFixture<VirtualPlayerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualPlayerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualPlayerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
