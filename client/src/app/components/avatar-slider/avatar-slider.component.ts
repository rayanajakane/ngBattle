import { NgFor } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

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
    @Input() avatars: { name: string; img: string }[] = [
        { name: '1', img: '../../../assets/characters/1.png' },
        { name: '2', img: '../../../assets/characters/2.png' },
        { name: '3', img: '../../../assets/characters/3.png' },
        { name: '4', img: '../../../assets/characters/4.png' },
        { name: '5', img: '../../../assets/characters/5.png' },
        { name: '6', img: '../../../assets/characters/6.png' },
        { name: '7', img: '../../../assets/characters/7.png' },
        { name: '8', img: '../../../assets/characters/8.png' },
        { name: '9', img: '../../../assets/characters/9.png' },
        { name: '10', img: '../../../assets/characters/10.png' },
        { name: '11', img: '../../../assets/characters/11.png' },
        { name: '12', img: '../../../assets/characters/12.png' },
        { name: '13', img: '../../../assets/characters/13.png' },
    ];

    selectedAvatar: { name: string; img: string } | null = null;
    private readonly scrollValue: number = 150;

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
