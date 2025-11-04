import { Component, OnInit, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { ThemeService } from '../../services/theme.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import anime from 'animejs/lib/anime.es.js';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  providers: [ThemeService]
})
export class LandingComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  private scrollObserver?: IntersectionObserver;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Remover el bloqueo de scroll - innecesario
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    requestAnimationFrame(() => {
      this.initHeroAnimations();
      this.initScrollAnimations();
    });
  }

  ngOnDestroy() {
    // Limpiar observer al destruir el componente
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
  }

  startElicitation() {
    if (!this.isBrowser) {
      this.router.navigate(['/elicit']);
      return;
    }

    // Animación suave de salida
    anime({
      targets: '.hero-content',
      opacity: [1, 0],
      translateY: [0, -30],
      duration: 400,
      easing: 'easeInQuad',
      complete: () => {
        this.router.navigate(['/elicit']);
      }
    });
  }

  /**
   * Animaciones iniciales del Hero (carga de página)
   * Solo las esenciales para una buena primera impresión
   */
  private initHeroAnimations() {
    // Timeline principal para el hero
    const heroTimeline = anime.timeline({
      easing: 'easeOutExpo'
    });

    // Secuencia optimizada de animaciones
    heroTimeline
      // Header
      .add({
        targets: 'header',
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 600
      })
      // Título y badge juntos
      .add({
        targets: ['.hero-badge', '.hero-title'],
        translateY: [40, 0],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(150)
      }, '-=300')
      // Subtítulo y botones
      .add({
        targets: ['.hero-subtitle', '.hero-cta'],
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        delay: anime.stagger(100)
      }, '-=400')
      // Estadísticas con contador animado
      .add({
        targets: '.stat-item',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        delay: anime.stagger(80),
        complete: () => this.animateCounters()
      }, '-=300');

    // Blobs de fondo - animación sutil y continua
    this.animateBlobs();
  }

  /**
   * Sistema de animaciones al hacer scroll - MEJORADO
   * Usa IntersectionObserver con anime.js para animaciones fluidas
   */
  private initScrollAnimations() {
    if (!this.isBrowser) return;

    const observerOptions = {
      threshold: 0.1, // Más sensible
      rootMargin: '0px 0px -50px 0px' // Trigger antes de que llegue al viewport
    };

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const target = entry.target as HTMLElement;
        const animationType = target.dataset['animation'] || 'fade-up';

        // Aplicar animación según el tipo
        switch (animationType) {
          case 'fade-up':
            this.animateFadeUp(target);
            break;
          case 'slide-left':
            this.animateSlideLeft(target);
            break;
          case 'slide-right':
            this.animateSlideRight(target);
            break;
          case 'scale-in':
            this.animateScaleIn(target);
            break;
          case 'flip-in':
            this.animateFlipIn(target);
            break;
          case 'stagger-children':
            this.animateStaggerChildren(target);
            break;
          default:
            this.animateFadeUp(target);
        }

        // Dejar de observar una vez animado
        this.scrollObserver?.unobserve(target);
      });
    }, observerOptions);

    // Observar todos los elementos con data-animation después de un pequeño delay
    setTimeout(() => {
      const elementsToAnimate = document.querySelectorAll('[data-animation]');
      console.log(`🎬 Elementos encontrados para animar: ${elementsToAnimate.length}`);
      
      if (elementsToAnimate.length === 0) {
        console.warn('⚠️ No se encontraron elementos con [data-animation]');
      }
      
      elementsToAnimate.forEach((el, index) => {
        const element = el as HTMLElement;
        console.log(`📍 Observando elemento ${index + 1}:`, element.dataset['animation'], element);
        this.scrollObserver?.observe(el);
      });
    }, 100);
  }

  /**
   * Animaciones individuales reutilizables
   */
  private animateFadeUp(target: HTMLElement) {
    anime({
      targets: target,
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutCubic'
    });
  }

  private animateSlideLeft(target: HTMLElement) {
    anime({
      targets: target,
      translateX: [100, 0],
      opacity: [0, 1],
      duration: 900,
      easing: 'easeOutExpo'
    });
  }

  private animateSlideRight(target: HTMLElement) {
    anime({
      targets: target,
      translateX: [-100, 0],
      opacity: [0, 1],
      duration: 900,
      easing: 'easeOutExpo'
    });
  }

  private animateScaleIn(target: HTMLElement) {
    anime({
      targets: target,
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 700,
      easing: 'easeOutElastic(1, .6)'
    });
  }

  private animateFlipIn(target: HTMLElement) {
    anime({
      targets: target,
      rotateY: [-90, 0],
      opacity: [0, 1],
      duration: 900,
      easing: 'easeOutExpo'
    });
  }

  private animateStaggerChildren(target: HTMLElement) {
    const children = target.querySelectorAll(':scope > *');
    
    anime({
      targets: Array.from(children),
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(100),
      easing: 'easeOutCubic'
    });
  }

  /**
   * Animación de contadores con efecto incremental
   */
  private animateCounters() {
    const counters = [
      { selector: '.counter-precision', value: 88, suffix: '%', decimals: 0 },
      { selector: '.counter-categories', value: 6, suffix: '', decimals: 0 },
      { selector: '.counter-speed', value: 5, suffix: 's', decimals: 0 },
      { selector: '.counter-automation', value: 100, suffix: '%', decimals: 0 }
    ];

    counters.forEach(({ selector, value, suffix, decimals }) => {
      const element = document.querySelector(selector);
      if (!element) return;

      const obj = { value: 0 };
      anime({
        targets: obj,
        value: value,
        duration: 1500,
        easing: 'easeOutExpo',
        round: decimals === 0 ? 1 : 10,
        update: () => {
          element.textContent = `${obj.value.toFixed(decimals)}${suffix}`;
        }
      });
    });
  }

  /**
   * Animación sutil de los blobs de fondo
   * Reducida para no distraer
   */
  private animateBlobs() {
    anime({
      targets: '.blob-1',
      translateX: [-20, 20],
      translateY: [-30, 30],
      scale: [1, 1.05],
      duration: 15000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });

    anime({
      targets: '.blob-2',
      translateX: [20, -20],
      translateY: [30, -30],
      scale: [1, 1.08],
      duration: 18000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });
  }
}