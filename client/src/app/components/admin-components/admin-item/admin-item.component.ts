import { Component, Input } from '@angular/core';
import { Game } from '@app/data-structure/game-structure/game-structure';
@Component({
    selector: 'app-admin-item',
    standalone: true,
    imports: [],
    templateUrl: './admin-item.component.html',
    styleUrl: './admin-item.component.scss',
})
export class AdminItemComponent {
    @Input() game: Game;
    @Input() lastModified: string = '12/09/24';

    invertVisibility() {
        this.game.isVisible = !this.game.isVisible;
    }

    // deleteGame() {
    //     // TODO: Write the function
    // }
}
