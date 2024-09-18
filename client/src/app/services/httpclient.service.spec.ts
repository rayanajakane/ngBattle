import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClientService } from './httpclient.service';

describe('HttpclientService', () => {
    let service: HttpClientService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [HttpClientService, provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(HttpClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
