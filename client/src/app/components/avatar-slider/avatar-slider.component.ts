import { NgFor } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Avatar } from '@app/interfaces/avatar';
import { AVATARS_LIST } from './constant';

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
    @Input() avatars: Avatar[] = AVATARS_LIST;

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
