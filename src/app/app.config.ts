import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { NgxUiLoaderModule, NgxUiLoaderConfig, SPINNER, POSITION, PB_DIRECTION } from 'ngx-ui-loader';

import { routes } from './app.routes';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: '#3478f2',
  bgsOpacity: 0.5,
  bgsPosition: POSITION.bottomRight,
  bgsSize: 60,
  bgsType: SPINNER.ballSpinClockwise,
  blur: 5,
  delay: 0,
  fastFadeOut: true,
  fgsColor: '#3478f2',
  fgsPosition: POSITION.centerCenter,
  fgsSize: 80,
  fgsType: SPINNER.squareJellyBox,
  gap: 49,
  logoPosition: POSITION.centerCenter,
  logoSize: 120,
  logoUrl: '',
  masterLoaderId: 'master',
  overlayBorderRadius: '0',
  overlayColor: 'rgba(40, 40, 40, 0.8)',
  pbColor: '#3478f2',
  pbDirection: PB_DIRECTION.leftToRight,
  pbThickness: 3,
  hasProgressBar: true,
  text: 'Procesando...',
  textColor: '#FFFFFF',
  textPosition: POSITION.centerCenter,
  maxTime: -1,
  minTime: 300
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    importProvidersFrom(NgxUiLoaderModule.forRoot(ngxUiLoaderConfig))
  ]
};
