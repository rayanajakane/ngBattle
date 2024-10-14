import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PlayerMessage } from '@app/interfaces/message';
import { SocketService } from '@app/services/socket.service';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss',
    providers: [DatePipe],
})
export class ChatComponent implements OnInit {
    @ViewChild('messageContainer') messageContainer: ElementRef;
    @Input() roomId: string;
    @Input() characterName: string;

    messages: PlayerMessage[] = [];
    myMessage: PlayerMessage = { name: '', message: '', date: '' };

    constructor(
        private socketService: SocketService,
        private datePipe: DatePipe,
    ) {}

    ngOnInit() {
        this.sendMessage();
        this.loadMessages();
        this.receiveMessage();
        this.myMessage.name = this.characterName;
    }

    loadMessages() {
        this.socketService.once('loadAllMessages', (data: { messages: PlayerMessage[] }) => {
            this.messages = data.messages;
            console.log(data.messages);
        });
        this.socketService.emit('loadAllMessages', { roomId: this.roomId });
    }

    receiveMessage() {
        this.socketService.on('singleMessage', (messageReceived: PlayerMessage) => {
            const message = messageReceived;
            this.messages.push(message);

            this.scrollToBottom();
        });
    }

    sendMessage() {
        if (this.myMessage.message === '') return;

        const currentTime = this.datePipe.transform(new Date(), 'HH:mm:ss');
        this.myMessage.date = currentTime || '';

        this.socketService.emit('roomMessage', { roomId: this.roomId, message: this.myMessage.message, date: this.myMessage.date });
        console.log('sentMessage');
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }
}
