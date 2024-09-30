import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SNACKBAR_DURATION } from '@app/components/admin-components/admin-item/constant';
import { ConfirmDeletionDialogComponent } from '@app/components/confirm-deletion-dialog/confirm-deletion-dialog.component';
import { MapComponent } from '@app/components/map/map.component';
import { GameJson } from '@app/data-structure/game-structure';
import { HttpClientService } from '@app/services/httpclient.service';

@Component({
    selector: 'app-admin-item',
    standalone: true,
    imports: [MapComponent, MatCardModule, MatButtonModule, MatTooltipModule],
    templateUrl: './admin-item.component.html',
    styleUrl: './admin-item.component.scss',
})
export class AdminItemComponent {
    @Input() game: GameJson;
    @Output() editGameEvent = new EventEmitter<string>();
    mapSize: number;
    mapService: any;

    @ViewChild(MapComponent) mapGrid: MapComponent;
    constructor(
        private http: HttpClientService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private el: ElementRef,
    ) {}

    ngOnInit() {
        this.mapSize = parseInt(this.game.mapSize);
    }

    ngAfterViewInit() {
        setTimeout(() => (this.mapGrid.tiles = this.game.map), 0);
    }

    invertVisibility() {
        this.http.changeVisibility(this.game.id).subscribe(() => {
            this.game.isVisible = !this.game.isVisible;
        });
    }

    deleteGame(): void {
        const dialogRef = this.dialog.open(ConfirmDeletionDialogComponent);
        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.http.getGame(this.game.id).then((game) => {
                    if (!game) {
                        this.snackbar.open("Le jeu n'existe pas", 'Fermer', {
                            duration: SNACKBAR_DURATION,
                            horizontalPosition: 'right',
                            verticalPosition: 'top',
                        });
                        this.el.nativeElement.remove();
                    } else {
                        this.http.deleteGame(this.game.id).subscribe(() => {
                            this.snackbar.open('Le jeu a été supprimé', 'Fermer', {
                                duration: SNACKBAR_DURATION,
                                horizontalPosition: 'right',
                                verticalPosition: 'top',
                            });
                        });
                        this.el.nativeElement.remove();
                    }
                });
            }
        });
    }

    editGame() {
        this.editGameEvent.emit(this.game.id);
    }
}
