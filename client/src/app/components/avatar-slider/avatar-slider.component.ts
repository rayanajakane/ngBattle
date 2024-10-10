import { NgFor } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-avatar-slider',
    standalone: true,
    imports: [NgFor],
    templateUrl: './avatar-slider.component.html',
    styleUrl: './avatar-slider.component.scss',
})
export class AvatarSliderComponent {
    @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef;
    @Output() selectedAvatarEmitter = new EventEmitter<{ name: string; img: string }>();

    avatars: { name: string; img: string }[];
    selectedAvatar: { name: string; img: string } | null = null;

    private readonly scrollValue: number = 150;
    private readonly nAvatars: number = 12;

    constructor() {
        this.avatars = [];
        for (let i = 1; i <= this.nAvatars; i++)
            this.avatars.push({
                name: `Avatar ${i}`,
                img: `../../../assets/characters/${i}.png`, // Chemin générique pour les images
            });
    }

    scrollLeft(): void {
        this.widgetsContent.nativeElement.scrollLeft -= this.scrollValue;
    }

    scrollRight(): void {
        this.widgetsContent.nativeElement.scrollRight += this.scrollValue;
    }

    selectAvatar(avatar: { name: string; img: string }): void {
        this.selectedAvatar = avatar;
        this.selectedAvatarEmitter.emit(this.selectedAvatar);
    }
}
