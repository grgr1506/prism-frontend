import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/enviroments';

@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.css',
  imports: [CommonModule],
})
export class PaymentResultComponent {

  status: '' | 'success' | 'cancel' | 'error' = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService 
  ) {}

  ngOnInit() {
    let session_id = this.route.snapshot.queryParamMap.get("session_id");
    if (!session_id) {
      const params = new URLSearchParams(window.location.search);
      session_id = params.get("session_id") || "";
    }

    if (!session_id) {
      this.status = "error";
      return;
    }

    fetch(`${environment.serverURL}/checkout/session-status?session_id=${session_id}`)
      .then(res => res.json())
      .then(async data => {

        if (data.status === "complete") {
          this.status = "success";
          console.log(data.metadata);

          const user_id = this.authService.getUserId();
          const nombre_user = this.authService.getNombreUser();

          // Datos del metadata
          const correo_usuario = data.metadata.email;
          const nombre_evento = data.metadata.nombre_evento;

          //Convertir asistentes a array
          const asistentesArray = JSON.parse(data.metadata.asistentes);

          //Obtener los nombre_evento
          const nombresEventos = asistentesArray.map((a: any) => a.nombre_evento);

          console.log("EMAIL:", correo_usuario);
          console.log("EVENTOS:", nombresEventos);

          // 3️⃣ Enviar al backend
          await fetch(`${environment.serverURL}/save-purchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              asistentes: asistentesArray,
              amount: data.amount,
              id_usuario: user_id,
              correo_usuario: correo_usuario,
              nombre_usuario: nombre_user,
              nombreEvento: nombresEventos,
            })
          });

        } else {
          this.status = "cancel";
        }
      });
  }
}
