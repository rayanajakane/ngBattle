import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterSelectionPageComponent } from './character-selection-page.component';

describe('CharacterSelectionPageComponent', () => {
  let component: CharacterSelectionPageComponent;
  let fixture: ComponentFixture<CharacterSelectionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterSelectionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterSelectionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
