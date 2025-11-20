// src/app/services/data.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroments';

@Injectable({ providedIn: 'root' })
export class DataService {
    private apiUrl = 'https://prism-club-backend.onrender.com/api/data';
    
    constructor(private http: HttpClient) {}

    getHomeData(): Observable<any> {
        return this.http.get(`${this.apiUrl}/home`);
    }
    
    sendContactMessage(messageData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/contact`, messageData);
    }
}

