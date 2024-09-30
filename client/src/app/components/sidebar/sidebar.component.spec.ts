import { DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            imports: [DragDropModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set isDragging to true when startDragging is called', () => {
        component.startDragging('object');
        expect(component.isDragging).toBe(true);
    });

    it('should emit selectItemTypeEvent when startDragging is called', () => {
        spyOn(component.selectItemTypeEvent, 'emit');
        component.startDragging('object');
        expect(component.selectItemTypeEvent.emit).toHaveBeenCalledWith('object');
    });

    it('should call startDragging with "AA1" when mousedown event is triggered on AA1 object', () => {
        spyOn(component, 'startDragging');
        const aa1Element = fixture.nativeElement.querySelector('#AA1');
        aa1Element.dispatchEvent(new Event('mousedown'));
        expect(component.startDragging).toHaveBeenCalledWith('AA1');
    });

    it('should call startDragging with "Ac1" when mousedown event is triggered on Ac1 object', () => {
        spyOn(component, 'startDragging');
        const ac1Element = fixture.nativeElement.querySelector('#Ac1');
        ac1Element.dispatchEvent(new Event('mousedown'));
        expect(component.startDragging).toHaveBeenCalledWith('Ac1');
    });

    // ADD IDS ON EACH MAT GRID TILE SO YOU CAN TEST THEM ONE BY ONE
    it('should call startDragging with "AA1" when mousedown event is triggered on the mat-grid-tile', () => {
        spyOn(component, 'startDragging');
        const matGridTileElement = fixture.nativeElement.querySelector('mat-grid-tile');
        const event = new MouseEvent('mousedown');
        matGridTileElement.dispatchEvent(event);
        expect(component.startDragging).toHaveBeenCalledWith('AA1');
    });
});
