import {Component, OnInit} from '@angular/core';
import {Report} from "./models/report.model";
import {ActionSheetService} from "./services/action-sheet.service";
import {StorageService} from "./services/storage.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  paletteToggle = false;
  file: File | null = null;
  showImportButton = false;

  public appPages = [
    {title: 'Reports', url: '/reports', icon: 'clipboard'},
    {title: 'Add', url: '/report', icon: 'add-circle'}
  ];

  constructor(private storageService: StorageService, private actionSheetService: ActionSheetService) {
  }

  ngOnInit(): void {
    // https://ionicframework.com/docs/theming/dark-mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.initializeDarkPalette(prefersDark.matches);
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkPalette(mediaQuery.matches));
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

  onImportFileChange(event: any): void {
    this.file = event.target.files[0];
  }

  upload(): void {
    if (this.file?.type !== 'application/json') {
      return;
    }

    this.file.text().then(json => {
      const data = JSON.parse(json) as Array<Report>;

      if (!data) {
        return;
      }

      this.actionSheetService.show("Uploading data overwrites existing data.", [{
        text: "Ok, continue.",
        role: 'ok'
      }, {text: "No, cancel.", role: 'cancel'}]).then(result => {
        if (result !== 'ok') {
          return;
        }

        this.storageService.setReports(data).subscribe();
        window.location.reload();
      });
    }).finally(() => {
      this.file = null;
    });
  }
}
