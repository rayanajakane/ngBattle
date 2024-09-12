import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Routes, provideRouter } from '@angular/router';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { ImportPageComponent } from '@app/pages/import-page/import-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { EditPageComponent } from '@app/pages/edit-page/edit-page.component';
import { environment } from './environments/environment';

import { AdminPageComponent } from 'src/app/pages/admin-page/admin-page.component';

if (environment.production) {
    enableProdMode();
}

const routes: Routes = [
    //{ path: '**', redirectTo: '/home' },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'game', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'home', component: MainPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'create', component: CreatePageComponent },
    { path: 'import', component: ImportPageComponent },
    { path: 'edit', component: EditPageComponent}
];

bootstrapApplication(AppComponent, {
    providers: [provideHttpClient(), provideRouter(routes), provideAnimations()],
});
