import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface FormularioData {
  nombre: string;
  email: string;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class Message {
  constructor(private _http: HttpClient){}
  
  sendMessage(body: FormularioData){
    return this._http.post('https://prism-club-backend.onrender.com', body);
  }
}
