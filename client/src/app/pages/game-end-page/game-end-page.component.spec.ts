// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { ActivatedRoute } from '@angular/router';
// import { of } from 'rxjs';
// import { GameEndPageComponent } from './game-end-page.component';

// describe('GameEndPageComponent', () => {
//     let component: GameEndPageComponent;
//     let fixture: ComponentFixture<GameEndPageComponent>;
//     let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

//     beforeEach(async () => {
//         mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
//             queryParams: of({ roomId: 'testRoom', characterName: 'testName' }),
//         });

//         await TestBed.configureTestingModule({
//             imports: [GameEndPageComponent, BrowserAnimationsModule],
//             providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }],
//         }).compileComponents();

//         fixture = TestBed.createComponent(GameEndPageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// });
