import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "./services/local-storage.service";
import {Report} from "./models/report.model";
import {ActionSheetService} from "./services/action-sheet.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  paletteToggle = false;
  file: File | null = null;

  public appPages = [
    {title: 'Reports', url: '/reports', icon: 'clipboard'},
    {title: 'Add', url: '/report', icon: 'add-circle'}
  ];

  constructor(private localStorage: LocalStorageService, private actionSheetService: ActionSheetService) {
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
    const jsonStr = JSON.stringify(this.localStorage.getReports(), null, 2); // pretty print

    // Create a Blob from the JSON string
    const blob = new Blob([jsonStr], {type: 'application/json'});

    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.json';

    // Trigger the download
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
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

        this.localStorage.setReports(data);
        window.location.reload();
      });
    }).finally(() => {
      this.file = null;
    });
  }
}
