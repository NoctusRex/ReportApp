import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public appPages = [
    {title: 'Reports', url: '/reports', icon: 'clipboard'},
    {title: 'Add', url: '/report', icon: 'add-circle'}
  ];

  constructor() {
  }
}
