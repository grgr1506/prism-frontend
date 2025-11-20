import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { environment } from '../../../environments/enviroments';
import { loadStripe, Stripe, StripeEmbeddedCheckout } from '@stripe/stripe-js';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';


@Component({
  selector: 'app-payment-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.css'
})
export class PaymentModal {

  @Output() close = new EventEmitter<void>();

  buyerName = ''; 
  email = '';
  asistentes: any[] = [];

  showPurchaseModal = true;  // modal inicial visible
  showStripeModal = false;   // stripe oculto al inicio

  stripe: Stripe | null = null;
  checkoutInstance: StripeEmbeddedCheckout | null = null;
  clientSecret: string = "";

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.generarCamposDeAsistentes();
  }

  // -----------------------------
  // MODALES
  // -----------------------------

  openPurchaseModal() {
    this.showPurchaseModal = true;
    this.showStripeModal = false;
  }

  closePurchaseModal() {
    this.showPurchaseModal = false;
    this.close.emit();
  }

  openStripeModal() {
    this.showPurchaseModal = false;
    this.showStripeModal = true;

    setTimeout(() => {
      this.mountStripe();
    }, 100);
  }

  closeStripeModal() {
    this.showStripeModal = false;

    if (this.checkoutInstance) {
      try {
        this.checkoutInstance.unmount();
        this.checkoutInstance = null;
      } catch (e) { console.warn("Error unmount:", e); }
    }

    this.close.emit();
  }

  // -----------------------------
  // ASISTENTES
  // -----------------------------
  generarCamposDeAsistentes() {
    const items = this.cartService.getItems();
    this.asistentes = [];

    items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        this.asistentes.push({
          id_evento: item.eventId,
          nombre_evento: item.eventName,
          nombre: '',
          dni: ''
        });
      }
    });
  }

  // -----------------------------
  // MONTAR STRIPE
  // -----------------------------
  async mountStripe() {
    if (!this.clientSecret) {
      console.error("Error: clientSecret no definido.");
      return;
    }

    if (!this.stripe) {
      this.stripe = await loadStripe(environment.stripePublicKey);
    }

    // limpiar el contenedor
    const div = document.getElementById("checkout");
    if (div) div.innerHTML = "";

    this.checkoutInstance = await this.stripe!.initEmbeddedCheckout({
      clientSecret: this.clientSecret
    });

    this.checkoutInstance.mount("#checkout");
  }

  // -----------------------------
  // CONFIRMAR PAGO (CREA LA SESIÓN)
  // -----------------------------
  async confirmPayment() {
    // Validación login
    if (!this.authService.isLogged()) {
      Swal.fire("Inicia sesión", "Debes iniciar sesión para continuar", "warning");
      return;
    }
    // Validación asistentes
    for (const a of this.asistentes) {
      if (!a.nombre || !a.dni || a.dni.length !== 8) {
        Swal.fire("Campos incompletos", "Completa todos los asistentes", "warning");
        return;
      }
    }

    const cartItems = this.cartService.getItems();

    try {
      const response = await fetch(`${environment.serverURL}/checkout/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          email: this.email,
          asistentes: this.asistentes,
          nombreEvento: this.asistentes[0]?.nombre_evento
        })
      });

      const data = await response.json();
      this.clientSecret = data.clientSecret;

      // abrir el segundo modal
      this.openStripeModal();

    } catch (error) {
      console.error("Error creando sesión Stripe:", error);
      Swal.fire("Error", "No se pudo iniciar el pago", "error");
    }
  }
}
