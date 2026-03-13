import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. LocalStorage se token uthao
  const token = localStorage.getItem('JWT_TOKEN');

  // 2. Agar token hai, toh use clone karke bhej do
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Interceptor: Adding Token to Request');
    return next(authReq);
  }

  // Bina token ke request bhej do
  return next(req);
};