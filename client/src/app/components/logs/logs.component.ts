import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LogMessage } from '@app/interfaces/message';
//import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-logs',
    standalone: true,
    imports: [MatCardModule, MatChipsModule, MatProgressBarModule, FormsModule, CommonModule],
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss',
})
export class LogsComponent {
    @ViewChild('logsContainer') logsContainer: ElementRef;
    @Input() roomId: string;

    logs: LogMessage[] = [{ date: '2023-10-01', message: 'Log message 1' }];

    constructor() {} // private cdr: ChangeDetectorRef, // private socketService: SocketService,

    ngOnInit(): void {
        //     this.loadLogs();
        //     this.receiveLog();
    }

    // ngAfterViewInit() {
    //     this.scrollToBottom();
    // }

    // loadLogs() {
    //     this.socketService.once('loadAllLogs', (data: { logs: LogMessage[] }) => {
    //         this.logs = data.logs;
    //     });
    //     this.socketService.emit('loadAllLogs', { roomId: this.roomId });
    // }

    // receiveLog() {
    //     this.socketService.on('newLog', (log: LogMessage) => {
    //         this.logs.push(log);
    //         this.cdr.detectChanges();
    //         this.scrollToBottom();
    //     });
    // }

    scrollToBottom() {
        try {
            this.logsContainer.nativeElement.scrollTop = this.logsContainer.nativeElement.scrollHeight;
        } catch (err) {
            console.error('Scroll to bottom failed in logsComponent', err);
        }
    }
}
