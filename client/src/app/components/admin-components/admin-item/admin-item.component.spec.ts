import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminItemComponent } from './admin-item.component';

describe('AdminItemComponent', () => {
    let component: AdminItemComponent;
    let fixture: ComponentFixture<AdminItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminItemComponent],
            providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminItemComponent);
        component = fixture.componentInstance;
        component.game = {
            id: '1',
            gameName: 'Game 1',
            gameDescription: 'This is an example game description.',
            mapSize: '10x10',
            map: [
                { i: 0, j: 0, tileType: 'grass', item: 'item1', hasPlayer: false },
                { i: 0, j: 1, tileType: 'water', item: '', hasPlayer: false },
                { i: 1, j: 0, tileType: 'sand', item: 'item2', hasPlayer: true },
                { i: 1, j: 1, tileType: 'mountain', item: '', hasPlayer: false },
            ],
            gameType: 'ctf',
            isVisible: true,
            creationDate: '2021-09-01T00:00:00.000Z',
        };

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
