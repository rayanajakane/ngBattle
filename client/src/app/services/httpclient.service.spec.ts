import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpclientService } from './httpclient.service';

describe('HttpclientService', () => {
    let service: HttpclientService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [HttpclientService, provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(HttpclientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
