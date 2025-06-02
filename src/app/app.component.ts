import {Component, OnInit} from '@angular/core';
import {FireBaseStorageService} from "./services/firebase-storage.service";
import {ModalService} from "./services/modal.service";
import {LocalStorageService} from "./services/local-storage.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  paletteToggle = false;
  file: File | null = null;
  judge: string | null = null;

  public appPages = [
    {title: 'Reports', url: '/reports', icon: 'clipboard'},
    {title: 'Add', url: '/report', icon: 'add-circle'}
  ];

  constructor(private storageService: FireBaseStorageService, private modalService: ModalService, private localStorageService: LocalStorageService) {
  }

  ngOnInit(): void {
    // https://ionicframework.com/docs/theming/dark-mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.initializeDarkPalette(prefersDark.matches);
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkPalette(mediaQuery.matches));

    this.judge = this.localStorageService.getJudgeName();
    if (!this.judge) {
      this.setJudgeName(true);
    }

  }

  initializeDarkPalette(isDark: boolean) {
    this.paletteToggle = isDark;
    this.toggleDarkPalette(isDark);
  }

  toggleChange(event: CustomEvent) {
    this.toggleDarkPalette(event.detail.checked);
  }

  toggleDarkPalette(shouldAdd: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  }

  download(): void {
    // HAIL THE AI OVERLORD
    this.storageService.getReports().subscribe(reports => {
      const jsonStr = JSON.stringify(reports, null, 2);
      const blob = new Blob([jsonStr], {type: 'application/json'});
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.json';
      a.click();

      window.URL.revokeObjectURL(url);
    })
  }

  setJudgeName(force = false): void {
    this.modalService.getJudgeName(this.judge ?? undefined, force).subscribe(x => this.judge = x);
  }
}
