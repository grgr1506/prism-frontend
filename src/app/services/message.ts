import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/enviroments'; // Asegúrate de importar el environment

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
    // Corrección: Usamos la URL de Render y el endpoint correcto
    return this._http.post(`${environment.serverURL}/api/data/contact`, body);
  }
}