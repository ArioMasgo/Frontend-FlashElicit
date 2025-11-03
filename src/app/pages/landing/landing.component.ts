import { Component, OnInit, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import anime from 'animejs/lib/anime.es.js';

@Component({
  selector: 'app-landing',
  imports: [ThemeToggleComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Prevenir scroll mientras se cargan las animaciones
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        document.body.style.overflow = 'auto';
      }, 100);
    }
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    // Esperar un frame para asegurar que el DOM esté listo
    requestAnimationFrame(() => {
      this.initAnimations();
      this.initScrollAnimations();
      this.initHoverAnimations();
    });
  }

  startElicitation() {
    if (!this.isBrowser) {
      this.router.navigate(['/elicit']);
      return;
    }

    // Animación de salida antes de navegar
    anime({
      targets: '.hero-content',
      opacity: [1, 0],
      translateY: [0, -50],
      duration: 600,
      easing: 'easeInQuad',
      complete: () => {
        this.router.navigate(['/elicit']);
      }
    });
  }

  private initAnimations() {
    // Animación del header con efecto de deslizamiento
    anime({
      targets: 'header',
      translateY: [-100, 0],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutExpo'
    });

    // Animación del badge con efecto de escala
    anime({
      targets: '.hero-badge',
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 600,
      delay: 200,
      easing: 'easeOutElastic(1, .8)'
    });

    // Animación del título principal
    anime({
      targets: '.hero-title',
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: 400,
      easing: 'easeOutExpo'
    });

    // Animación del subtítulo
    anime({
      targets: '.hero-subtitle',
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 800,
      delay: 600,
      easing: 'easeOutExpo'
    });

    // Animación de los botones CTA
    anime({
      targets: '.hero-cta',
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 800,
      delay: 800,
      easing: 'easeOutExpo'
    });

    // Animación de las estadísticas con efecto escalonado
    anime({
      targets: '.stat-item',
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(100, { start: 1000 }),
      easing: 'easeOutExpo'
    });

    // Animación de los números de las estadísticas
    this.animateCounters();

    // Animación de las blobs del fondo
    this.animateBlobs();
  }

  private initScrollAnimations() {
    if (!this.isBrowser) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;

          // Animación para títulos de sección
          if (target.classList.contains('section-title')) {
            anime({
              targets: target,
              translateY: [50, 0],
              opacity: [0, 1],
              duration: 800,
              easing: 'easeOutExpo'
            });
          }

          // Animación para cards con efecto escalonado
          if (target.classList.contains('feature-card')) {
            const cards = target.parentElement?.querySelectorAll('.feature-card') || [target];
            anime({
              targets: Array.from(cards),
              translateY: [60, 0],
              opacity: [0, 1],
              duration: 800,
              delay: anime.stagger(150),
              easing: 'easeOutExpo'
            });
          }

          // Animación para los pasos del proceso
          if (target.classList.contains('process-step')) {
            anime({
              targets: target,
              scale: [0.9, 1],
              opacity: [0, 1],
              duration: 800,
              easing: 'easeOutElastic(1, .8)'
            });
          }

          // Animación para las categorías ISO
          if (target.classList.contains('iso-category')) {
            anime({
              targets: target,
              scale: [0.95, 1],
              opacity: [0, 1],
              rotateY: [-10, 0],
              duration: 800,
              easing: 'easeOutExpo'
            });
          }

          observer.unobserve(target);
        }
      });
    }, observerOptions);

    // Observar elementos
    const elementsToObserve = [
      '.section-title',
      '.feature-card',
      '.process-step',
      '.iso-category'
    ];

    elementsToObserve.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => observer.observe(el));
    });
  }

  private initHoverAnimations() {
    if (!this.isBrowser) return;

    // Hover effect para cards con parallax
    document.querySelectorAll('.hover-card').forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        anime({
          targets: e.currentTarget,
          translateY: -10,
          scale: 1.02,
          duration: 300,
          easing: 'easeOutQuad'
        });

        // Animar el ícono dentro del card
        const icon = (e.currentTarget as HTMLElement).querySelector('.card-icon');
        if (icon) {
          anime({
            targets: icon,
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
            duration: 600,
            easing: 'easeInOutQuad'
          });
        }
      });

      card.addEventListener('mouseleave', (e) => {
        anime({
          targets: e.currentTarget,
          translateY: 0,
          scale: 1,
          duration: 300,
          easing: 'easeOutQuad'
        });
      });
    });

    // Hover effect para botones
    document.querySelectorAll('.animated-button').forEach(button => {
      button.addEventListener('mouseenter', (e) => {
        anime({
          targets: (e.currentTarget as HTMLElement).querySelector('.button-arrow'),
          translateX: [0, 5],
          duration: 300,
          easing: 'easeOutQuad'
        });
      });

      button.addEventListener('mouseleave', (e) => {
        anime({
          targets: (e.currentTarget as HTMLElement).querySelector('.button-arrow'),
          translateX: [5, 0],
          duration: 300,
          easing: 'easeOutQuad'
        });
      });
    });

    // Parallax effect en mouse move para el hero
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const { clientX, clientY } = mouseEvent;
        const { innerWidth, innerHeight } = window;

        const xPos = (clientX / innerWidth - 0.5) * 20;
        const yPos = (clientY / innerHeight - 0.5) * 20;

        anime({
          targets: '.blob-1',
          translateX: xPos,
          translateY: yPos,
          duration: 1000,
          easing: 'easeOutQuad'
        });

        anime({
          targets: '.blob-2',
          translateX: -xPos * 0.5,
          translateY: -yPos * 0.5,
          duration: 1500,
          easing: 'easeOutQuad'
        });
      });
    }
  }

  private animateCounters() {
    const counters = [
      { selector: '.counter-precision', value: 78.5, suffix: '%' },
      { selector: '.counter-categories', value: 6, suffix: '' },
      { selector: '.counter-speed', value: 5, suffix: 's' },
      { selector: '.counter-automation', value: 100, suffix: '%' }
    ];

    counters.forEach(({ selector, value, suffix }) => {
      const element = document.querySelector(selector);
      if (!element) return;

      const obj = { value: 0 };
      anime({
        targets: obj,
        value: value,
        duration: 2000,
        delay: 1200,
        easing: 'easeOutExpo',
        round: selector === '.counter-categories' ? 1 : 10,
        update: () => {
          element.textContent = `${obj.value}${suffix}`;
        }
      });
    });
  }

  private animateBlobs() {
    // Animación continua de las blobs
    anime({
      targets: '.blob-1',
      translateX: [0, 50, -30, 0],
      translateY: [0, -40, 60, 0],
      scale: [1, 1.1, 0.9, 1],
      duration: 20000,
      easing: 'easeInOutSine',
      loop: true
    });

    anime({
      targets: '.blob-2',
      translateX: [0, -40, 50, 0],
      translateY: [0, 50, -30, 0],
      scale: [1, 0.9, 1.1, 1],
      duration: 25000,
      easing: 'easeInOutSine',
      loop: true,
      delay: 2000
    });
  }
}
