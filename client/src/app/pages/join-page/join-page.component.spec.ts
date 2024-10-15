import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinPageComponent } from './join-page.component';
import { PlayerAttribute } from '@app/interfaces/player';
import { SocketService } from '@app/services/socket.service';

describe('JoinPageComponent', () => {
    let component: JoinPageComponent;
    let fixture: ComponentFixture<JoinPageComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj('SocketService', ['isSocketAlive', 'connect', 'disconnect', 'on', 'emit', 'once']);

        await TestBed.configureTestingModule({
            imports: [JoinPageComponent],
            providers: [
                { provide: SocketService, useValue: mockSocketService }, // Use the mock service
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('formChecking method returns an error associated to avatar selection', () => {
        component.selectedAvatar = '';
        expect(component.formChecking().length).toBeGreaterThan(0);
    });

    it('formChecking method returns an error associated to name', () => {
        component.isNameValid = jasmine.createSpy('isNameValid').and.returnValue(false);
        expect(component.formChecking().length).toBeGreaterThan(0);
    });

    it('formChecking method returns no errors', () => {
        component.selectedAvatar = 'Avatar 1';
        component.isNameValid = jasmine.createSpy('isNameValid').and.returnValue(true);
        expect(component.formChecking().length).toEqual(0);
    });

    it('should receive selected avatar from child', () => {
        const selectedAvatarFromChild = { name: 'Avatar 1', img: '../../Test.png' };
        component.receiveSelectedAvatar(selectedAvatarFromChild);

        expect(component.selectedAvatar).toEqual(selectedAvatarFromChild.name);
    });

    it('should receive attributes from child', () => {
        const attributesFromChild: PlayerAttribute = { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' };
        component.receiveAttributes(attributesFromChild);

        expect(component.attributes).toEqual(attributesFromChild);
    });

    it('should disconnect if already connected on submit code', () => {
        mockSocketService.isSocketAlive.and.returnValue(true);

        component.onSubmitCode(new Event('click'));

        expect(mockSocketService.disconnect).toHaveBeenCalled();
    });

    it('should connect if not already connected on submit code', () => {
        mockSocketService.isSocketAlive.and.returnValue(false);

        component.onSubmitCode(new Event('click'));

        expect(mockSocketService.connect).toHaveBeenCalled();
    });

    // it('should make room valid if on validRoom has isValid as true', () => {
    //     mockSocketService.isSocketAlive.and.returnValue(false);
    //     // mockSocketService.on.and.callFake(<T>(event: string, action: (data: boolean) => void) => {
    //     //     if (event === 'validRoom') {
    //     //         action(true); // Simulating a valid room code
    //     //     }
    //     // });
    //     mockSocketService.emit = jasmine.createSpy('emit').and.
    //     //component.onSubmitCode(new Event('click'));

    //     //expect(mockSocketService.connect).toHaveBeenCalled();
    // });
});
