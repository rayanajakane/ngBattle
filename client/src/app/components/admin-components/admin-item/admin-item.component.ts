import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDeletionDialogComponent } from '@app/components/confirm-deletion-dialog/confirm-deletion-dialog.component';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';

@Component({
    selector: 'app-admin-item',
    standalone: true,
    imports: [MatCardModule, MatButtonModule, MatTooltipModule],
    templateUrl: './admin-item.component.html',
    styleUrl: './admin-item.component.scss',
})
export class AdminItemComponent {
    @Input() game: GameJson;
    constructor(
        private http: HttpClientService,
        private dialog: MatDialog,
    ) {}

    invertVisibility() {
        this.http.changeVisibility(this.game.id).subscribe(() => {
            this.game.isVisible = !this.game.isVisible;
        });
    }

    deleteGame(): void {
        const dialogRef = this.dialog.open(ConfirmDeletionDialogComponent);
        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.http.getGame(this.game.id).subscribe((game) => {
                    if (!game) {
                        alert('Le jeu a déjà été supprimé par un autre administrateur');
                        return;
                    } else {
                        this.http.deleteGame(this.game.id).subscribe(() => {
                            alert('Le jeu a été supprimé avec succès');
                            window.location.reload();
                        });
                    }
                });
            }
        });
    }

    // TODO: Add a function to unsuscribe from the streams of the component (use ngOnDestruct)
}
