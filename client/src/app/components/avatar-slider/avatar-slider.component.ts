import { NgFor } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Avatar } from '@app/interfaces/avatar';

@Component({
    selector: 'app-avatar-slider',
    standalone: true,
    imports: [NgFor],
    templateUrl: './avatar-slider.component.html',
    styleUrl: './avatar-slider.component.scss',
})
export class AvatarSliderComponent {
    @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef;
    @Output() selectedAvatarEmitter = new EventEmitter<Avatar>();
    @Input() avatars: Avatar[] = [
        { name: 'Avatar 1', img: './assets/characters/1.png' },
        { name: 'Avatar 2', img: './assets/characters/2.png' },
        { name: 'Avatar 3', img: './assets/characters/3.png' },
        { name: 'Avatar 4', img: './assets/characters/4.png' },
        { name: 'Avatar 5', img: './assets/characters/5.png' },
        { name: 'Avatar 6', img: './assets/characters/6.png' },
        { name: 'Avatar 7', img: './assets/characters/7.png' },
        { name: 'Avatar 8', img: './assets/characters/8.png' },
        { name: 'Avatar 9', img: './assets/characters/9.png' },
        { name: 'Avatar 10', img: './assets/characters/10.png' },
        { name: 'Avatar 11', img: './assets/characters/11.png' },
        { name: 'Avatar 12', img: './assets/characters/12.png' },
    ];

    selectedAvatar: { name: string; img: string } | null = null;
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly SCROLL_VALUE: number = 150;

    scrollLeft(): void {
        this.widgetsContent.nativeElement.scrollLeft -= this.SCROLL_VALUE;
    }

    scrollRight(): void {
        this.widgetsContent.nativeElement.scrollRight += this.SCROLL_VALUE;
    }

    selectAvatar(avatar: { name: string; img: string }): void {
        this.selectedAvatar = avatar;
        this.selectedAvatarEmitter.emit(this.selectedAvatar);
    }
}
