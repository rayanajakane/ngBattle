import { TestBed } from '@angular/core/testing';

import { IDgenerationService } from './idgeneration.service';

describe('IDgenerationService', () => {
    let service: IDgenerationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IDgenerationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should generate a unique ID', () => {
        const id1 = service.generateID();
        const id2 = service.generateID();
        expect(id1).not.toEqual(id2);
    });
    it('should generate a valid UUID', () => {
        const id = service.generateID();
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
    it('should generate a valid UUID version 4', () => {
        const id = service.generateID();
        expect(id[14]).toEqual('4');
    });
    it('should generate a valid UUID variant', () => {
        const id = service.generateID();
        expect(id[19]).toMatch(/[89ab]/);
    });
    it('should be the right length', () => {
        const id = service.generateID();
        const IDLENGTH = 36;
        expect(id.length).toEqual(IDLENGTH);
    });
});
