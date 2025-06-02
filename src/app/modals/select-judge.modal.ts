import {Component, inject, Input, OnInit} from "@angular/core";
import {FireBaseStorageService} from "../services/firebase-storage.service";
import {ModalService} from "../services/modal.service";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ActionSheetService} from "../services/action-sheet.service";
import {of} from "rxjs";

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
  template:
    `
      <ion-header>
        <ion-toolbar color="light">
          <ion-progress-bar [color]="progressBarColor" value="1"></ion-progress-bar>
          <ion-title>Enter Judge</ion-title>
          <ion-buttons slot="start">
            <ion-button (click)="cancel()">
              <ion-icon name="close" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button (click)="submit()" [disabled]="!canSubmit">
              <ion-icon name="arrow-forward" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-input label="Name" fill="outline" label-placement="fixed" [(ngModel)]="judge" type="text"
                   required (keyup.enter)="canSubmit ? submit() : null"></ion-input>
        <ion-list>
          <ion-item-sliding *ngFor="let judgeName of judges">
            <ion-item (click)="judge=judgeName; submit();" button lines="full" detail="true" detail-icon="checkmark">
              <ion-label>{{ judgeName }}</ion-label>
            </ion-item>
            <ion-item-options>
              <ion-item-option (click)="remove(judgeName)" color="danger">
                <ion-icon name="trash" slot="icon-only"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </ion-content>
    `
})
export class SelectJudgeModal implements OnInit {
  firebaseStorageService = inject(FireBaseStorageService);
  modalService = inject(ModalService);
  actionSheet = inject(ActionSheetService);

  @Input() judge: string | undefined | null;
  actionSheetOpen = false;

  _judges: Array<string> = [];

  get judges(): Array<string> {
    const regex = new RegExp(this.judge ?? '', 'i');

    return this._judges.filter(x => regex.test(x));
  }

  get canSubmit(): boolean {
    return !!(this.judge && this.judge.trim().length > 0);
  }

  get progressBarColor(): string {
    if (this.actionSheetOpen) {
      return 'danger';
    }

    if (!this.canSubmit) {
      return 'danger';
    }

    return 'success';
  }

  ngOnInit(): void {
    this.firebaseStorageService.getJudges().subscribe(x => this._judges = x);
  }

  cancel(): void {
    this.modalService.dismiss(null, 'backdrop');
  }

  submit(): void {
    if (!this.judge) {
      return;
    }

    let existing = this.judges.find(x => x.toLowerCase() === this.judge!.trim().toLowerCase());
    if (existing) {
      this.judge = existing;
    }

    (this.judges.includes(this.judge) ? of(undefined) : this.firebaseStorageService.addOrUpdateJudge(this.judge))
      .subscribe(() => {
        this.modalService.dismiss(this.judge, 'destructive');
      });
  }

  remove(judge: string): void {
    this.actionSheetOpen = true;

    this.actionSheet.show("Should the judge be deleted?", [
      {
        text: 'Yes, delete the judge.',
        role: "yes"
      },
      {
        text: 'No, cancel.',
        role: "cancel"
      },
    ]).then((result) => {
      if (result === "yes") {
        this.firebaseStorageService.deleteJudge(judge).subscribe(() => {
          this._judges = this.judges.filter(item => item !== judge);
        });
      }
    }).finally(() => {
      this.actionSheetOpen = false;
    });
  }
}
