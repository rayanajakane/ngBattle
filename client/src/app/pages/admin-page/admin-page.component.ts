import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AdminItemComponent } from '@app/components/admin-components/admin-item/admin-item.component';
import { GameMode as gMode } from '@app/data-structure/enum/game-mode-enum';
import { SizeMap as Size } from '@app/data-structure/enum/size-map-enum';
import { Game } from '@app/data-structure/game-structure/game-structure';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [AdminItemComponent, RouterLink, RouterOutlet],
    templateUrl: './admin-page.component.html',
    styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent {
    games: Game[] = [
        {
            id: 1,
            name: 'item1',
            size: Size.Small,
            mode: gMode.Classic,
            isVisible: true,
            description: 'Sample Text 1',
            lastModified: '12/09/24',
        },
        {
            id: 2,
            name: 'item2',
            size: Size.Normal,
            mode: gMode.CaptureTheFlag,
            isVisible: false,
            description: 'Sample Text 2',
            lastModified: '2021-01-02',
        },
        {
            id: 3,
            name: 'item3',
            size: Size.Large,
            mode: gMode.Classic,
            isVisible: false,
            description: 'Sample Text 3',
            lastModified: '12/09/24',
        },
        {
            id: 4,
            name: 'item4',
            size: Size.Normal,
            mode: gMode.CaptureTheFlag,
            isVisible: false,
            description: 'Sample Text 4',
            lastModified: '2021-01-04',
        },
        {
            id: 5,
            name: 'item5',
            size: Size.Normal,
            mode: gMode.CaptureTheFlag,
            isVisible: true,
            description: 'Sample Text 5',
            lastModified: '2021-01-05',
        },
    ];
}
