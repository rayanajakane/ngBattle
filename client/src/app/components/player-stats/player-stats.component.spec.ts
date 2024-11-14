import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayerStatsComponent } from './player-stats.component';

describe('PlayerStatsComponent', () => {
    let component: PlayerStatsComponent;
    let fixture: ComponentFixture<PlayerStatsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayerStatsComponent, MatTableModule, MatSortModule, BrowserAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerStatsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
