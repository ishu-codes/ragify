import { Component } from '@angular/core';
import { TEXTAREA_CLASS } from '../../lib/utils';

@Component({
  standalone: true,

  selector: 'textarea[appTextarea]',
  template: '',
  host: {
    'data-slot': 'textarea',
    class: TEXTAREA_CLASS,
  },
})
export class TextareaComponent {}
