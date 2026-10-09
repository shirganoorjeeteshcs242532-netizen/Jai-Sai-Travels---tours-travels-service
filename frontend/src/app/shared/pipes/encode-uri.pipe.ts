import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'encodeUri',
  standalone: true
})
export class EncodeUriPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    return encodeURIComponent(value);
  }
}
