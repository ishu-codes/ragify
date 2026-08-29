import { Component } from '@angular/core';
import { INPUT_CLASS } from '../../lib/utils';

@Component({
  standalone: true,

  selector: 'input[appInput]',
  template: '',
  host: {
    'data-slot': 'input',
    class: INPUT_CLASS,
  },
})
export class InputComponent {}
