import { Component } from '@angular/core';
import { GameMode } from '@app/data-structure/enum/game-mode-enum';
import { SizeMap } from '@app/data-structure/enum/size-map-enum';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-create-page',
    standalone: true,
    imports: [FormsModule, RouterLink],
    templateUrl: './create-page.component.html',
    styleUrl: './create-page.component.scss',
})
export class CreatePageComponent {
    gameMode: GameMode = GameMode.Classic;
    sizeMap: SizeMap = SizeMap.Small;

    // submitChoice() {
    //     // console.log('Selected choice:', this.sizeMap);
    //     // console.log('Selected choice:', this.gameMode);
    // }
}
