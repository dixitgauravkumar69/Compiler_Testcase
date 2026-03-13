import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Ye dono imports add karein
import { authInterceptor } from './auth.interceptor'; // Jo functional interceptor humne banaya tha

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    
    // HttpClient ko register karein aur batayein ki authInterceptor use karna hai
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};