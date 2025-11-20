// src/app/pages/admin/dashboard-home/dashboard-home.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js'; 
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf'; 
import { environment } from '../../../../environments/enviroments'
import { 
  Chart, 
  LineController, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  BarController, 
  BarElement,    
  ArcElement,    
  PieController  
} from 'chart.js';

Chart.register(
  LineController, 
  BarController,
  PieController,
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'], 
})
export class DashboardHomeComponent implements OnInit {
    
    eventosActivos: number | string = '---'; 
    ingresosMes: string = '---'; 
    clientesVipActivos: number | string = '---';
    usuariosActivos: number | string = '---';

    private primaryColor = '#ff6b35'; 
    private secondaryColor = '#f7931e';
    private grayColor = '#5a5c69';

    public lineChartData: ChartConfiguration<'line'>['data'];
    public lineChartOptions: ChartOptions<'line'> = { responsive: true };
    public lineChartType: 'line' = 'line'; 

    public barChartData: ChartData<'bar'>;
    public barChartOptions: ChartOptions<'bar'> = { responsive: true };
    public barChartType: 'bar' = 'bar';

    public pieChartData: ChartData<'pie'>;
    public pieChartOptions: ChartOptions<'pie'> = { responsive: true };
    public pieChartType: 'pie' = 'pie'; 

    constructor(private http: HttpClient) {
        this.lineChartData = { labels: [], datasets: [{ data: [], label: 'Ingresos', fill: 'origin', tension: 0.3 }] };
        this.barChartData = { labels: [], datasets: [{ data: [], label: 'Entradas Vendidas' }] };
        this.pieChartData = { labels: ['Sin Datos'], datasets: [{ data: [100] }] } as ChartData<'pie'>; 
    }
    
    ngOnInit(): void {
        this.initializePieChart(); 
        this.loadDashboardData(); 
        // setInterval(() => this.loadDashboardData(), 30000); 
    }
    
    loadDashboardData() {
        this.http.get(`${environment.serverURL}/api/admin/analytics`).subscribe({
            next: (data: any) => {
                this.processRevenueData(data.ingresosMensuales);
                this.processTicketsData(data.ticketsPorEvento);
                
                this.eventosActivos = data.eventosActivos;
                this.clientesVipActivos = data.clientesVipActivos || 0;
                this.usuariosActivos = data.usuariosActivos || 0;
                
                const totalRevenue = data.ingresosMensuales.reduce((sum: number, item: any) => {
                    return sum + (parseFloat(item.ingresos) || 0);
                }, 0);
                
                this.ingresosMes = `S/${totalRevenue.toFixed(2)}`;
            },
            error: (err) => {
                console.error('Error al cargar datos del dashboard:', err);
                this.eventosActivos = 'Error';
                this.ingresosMes = 'Error';
                this.clientesVipActivos = 'Error';
                this.usuariosActivos = 'Error';   
                this.initializeChartsEmpty(); 
            }
        });
    }
    
    private processRevenueData(data: any[]) {
        const labels = data.map(item => `Mes ${item.mes}`);
        const revenue = data.map(item => parseFloat(item.ingresos) || 0);
        
        this.lineChartData = {
            labels: labels,
            datasets: [
                {
                    data: revenue,
                    label: 'Ingresos (S/)', 
                    borderColor: this.primaryColor,
                    backgroundColor: 'rgba(255, 107, 53, 0.3)',
                    pointBackgroundColor: this.primaryColor,
                    fill: 'origin',
                    tension: 0.3 
                }
            ]
        };
    }

    private processTicketsData(data: any[]) {
        const labels = data.map(item => item.titulo);
        const counts = data.map(item => item.entradas_vendidas);
        
        this.barChartData = {
            labels: labels,
            datasets: [
                { 
                    data: counts, 
                    label: 'Entradas Vendidas', 
                    backgroundColor: [this.primaryColor, this.secondaryColor, this.grayColor], 
                    hoverBackgroundColor: 'rgba(255, 107, 53, 0.8)'
                }
            ]
        };
    }
    
    private initializePieChart() {
        this.pieChartData = {
            labels: ['VIP Platinum', 'VIP Gold', 'Clientes Regulares'],
            datasets: [{
                data: [30, 45, 25], 
                backgroundColor: [this.primaryColor, this.secondaryColor, this.grayColor],
                hoverBackgroundColor: ['#ffcd3c', '#e74a3b', '#6e707e'],
            }]
        } as ChartData<'pie'>;
    }

    private initializeChartsEmpty() {
        this.lineChartData = { labels: ['Sin Datos'], datasets: [{ data: [0], label: 'Sin Datos', fill: 'origin', tension: 0.3 }] };
        this.barChartData = { labels: ['Sin Datos'], datasets: [{ data: [0], label: 'Sin Datos' }] };
        this.pieChartData = { labels: ['Sin Datos'], datasets: [{ data: [100] }] } as ChartData<'pie'>;
    }

    // 💡 FUNCIÓN GENERAR REPORTE MEJORADA (CON GRÁFICOS)
    generateReport() {
        Swal.fire({
            title: '<span style="color: #00bfff;">Confirmar Generación</span>',
            text: '¿Desea descargar el reporte PDF con métricas y gráficos?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Sí, Generar PDF', 
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                
                const doc = new jsPDF();
                const date = new Date().toLocaleDateString('es-PE');
                const padding = 15;
                let y = 20;
        
                // --- TÍTULO ---
                doc.setFontSize(22);
                doc.setTextColor(255, 0, 128); // Rosa Neon
                doc.text('REPORTE DE MÉTRICAS - PRISM CLUB', padding, y);
                y += 10;
                
                // --- FECHA ---
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100); 
                doc.text(`Fecha del Reporte: ${date}`, padding, y);
                y += 15;
                
                // --- TABLA DE MÉTRICAS ---
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0); // Negro para texto
                doc.text('Resumen General:', padding, y);
                y += 10;

                doc.setFontSize(12);
                const metrics = [
                    { label: 'Ingresos Mensuales', value: this.ingresosMes },
                    { label: 'Eventos Activos', value: this.eventosActivos },
                    { label: 'Clientes VIP Activos', value: this.clientesVipActivos },
                    { label: 'Usuarios Registrados', value: this.usuariosActivos },
                ];
                
                metrics.forEach(metric => {
                    doc.setFillColor(240, 240, 240); // Fondo gris claro para filas
                    doc.rect(padding, y - 6, 180, 8, 'F');
                    doc.text(`${metric.label}:`, padding + 2, y);
                    doc.setFont("helvetica", "bold");
                    doc.text(`${metric.value}`, 140, y);
                    doc.setFont("helvetica", "normal");
                    y += 10;
                });

                y += 10; // Espacio antes de los gráficos

                // --- CAPTURA DE GRÁFICOS (CANVAS) ---
                const canvases = document.querySelectorAll('canvas');

                if (canvases.length > 0) {
                    doc.setFontSize(16);
                    doc.setTextColor(0, 0, 0);
                    doc.text('Visualización Gráfica:', padding, y);
                    y += 10;

                    canvases.forEach((canvas, index) => {
                        // Convertir canvas a imagen
                        const imgData = (canvas as HTMLCanvasElement).toDataURL('image/png');
                        
                        // Ajustar dimensiones (Ancho fijo, alto proporcional)
                        const imgWidth = 170; 
                        const imgHeight = ((canvas as HTMLCanvasElement).height * imgWidth) / (canvas as HTMLCanvasElement).width;

                        // Si no cabe en la página, crear nueva
                        if (y + imgHeight > 280) {
                            doc.addPage();
                            y = 20;
                        }

                        // 💡 TRUCO: Dibujar un rectángulo oscuro detrás para que se vean las letras blancas del gráfico
                        doc.setFillColor(30, 30, 30); // Color de fondo #1e1e1e (similar a tu dashboard)
                        doc.rect(padding, y, imgWidth, imgHeight, 'F');

                        // Poner la imagen encima
                        doc.addImage(imgData, 'PNG', padding, y, imgWidth, imgHeight);
                        
                        y += imgHeight + 10; // Espacio para el siguiente
                    });
                }
        
                doc.save(`PrismClub_Reporte_${date.replace(/\//g, '-')}.pdf`);

                Swal.fire({
                    title: '<span style="color: #1cc88a;">¡Descarga Exitosa!</span>',
                    text: 'El reporte con gráficos ha sido generado.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    }
}