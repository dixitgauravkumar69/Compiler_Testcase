import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
   transform(value: string): string {
    if (!value) return '';

    const date = new Date(value);

    return date.toLocaleString(); // simple format date will return in local date and time format
  }
}
