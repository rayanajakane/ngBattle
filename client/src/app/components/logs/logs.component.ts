import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LogMessage } from '@app/interfaces/message';
// import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-logs',
    standalone: true,
    imports: [MatIconModule, MatButtonModule, MatCardModule, MatChipsModule, MatProgressBarModule, FormsModule, CommonModule],
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss',
})
export class LogsComponent implements OnInit {
    btnText: string = 'Filtrer messages';
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
        this.logsContainer.nativeElement.scrollTop = this.logsContainer.nativeElement.scrollHeight;
    }

    filterLogs(): void {
        if (this.btnText === 'Filtrer messages') {
            this.btnText = 'Afficher tous les messages';
        } else {
            this.btnText = 'Filtrer messages';
        }
    }
}
