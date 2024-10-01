import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
// import SpyObj = jasmine.SpyObj;

import { provideRouter } from '@angular/router';

import { EditPageComponent } from './edit-page.component';
// import { MapService } from '@app/services/map.service';
// import { IDGenerationService } from '@app/services/idgeneration.service';

describe('EditPageComponent', () => {
    // let mapServiceSpy: SpyObj<MapService>;
    // let idGenerationServiceSpy: SpyObj<IDGenerationService>;

    let component: EditPageComponent;
    let fixture: ComponentFixture<EditPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditPageComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
