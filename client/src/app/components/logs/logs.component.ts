import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LogMessage } from '@app/interfaces/message';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-logs',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss',
})
export class LogsComponent implements OnInit {
    @ViewChild('messageContainer') messageContainer: ElementRef;
    @Input() roomId: string;

    logs: LogMessage[] = [];

    constructor(
        private socketService: SocketService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.loadLogs();
        this.receiveLog();
    }

    loadLogs() {
        this.socketService.once('loadAllLogs', (data: { logs: LogMessage[] }) => {
            this.logs = data.logs;
        });
        this.socketService.emit('loadAllLogs', { roomId: this.roomId });
    }

    receiveLog() {
        this.socketService.on('newLog', (log: LogMessage) => {
            this.logs.push(log);
            this.cdr.detectChanges();
            this.scrollToBottom();
        });
    }

    scrollToBottom() {
        try {
            this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
        } catch (err) {
            console.error('Scroll to bottom failed', err);
        }
    }
}
