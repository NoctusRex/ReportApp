import {Component, inject, Input, OnInit} from "@angular/core";
import {FireBaseStorageService} from "../services/firebase-storage.service";
import {ModalService} from "../services/modal.service";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ActionSheetService} from "../services/action-sheet.service";
import {Team} from "../models/team.model";
import {of} from "rxjs";

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
  template:
    `
      <ion-header>
        <ion-toolbar color="light">
          <ion-progress-bar [color]="progressBarColor" value="1"></ion-progress-bar>
          <ion-title>Enter Team and Player</ion-title>
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
        <ion-toolbar>
          <ion-input label="Team" fill="outline" label-placement="fixed" [(ngModel)]="team" type="text"
                     required></ion-input>
          <ion-input label="Name" fill="outline" label-placement="fixed" [(ngModel)]="player" type="text"
                     required (keyup.enter)="canSubmit ? submit() : null"></ion-input>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list lines="full">
          @for (key of teamKeys; track key) {
            <ion-list-header>
              <ion-title style="text-overflow: inherit; white-space: normal; width: 85%">{{ key }}</ion-title>
              <ion-button color="dark" (click)="team = key">
                <ion-icon slot="icon-only" name="arrow-forward"></ion-icon>
              </ion-button>
            </ion-list-header>
            <ion-item-sliding *ngFor="let playerName of getPlayers(key)">
              <ion-item (click)="player=playerName; team = key; submit();" button detail="true" detail-icon="checkmark">
                <ion-label>{{ playerName }}</ion-label>
              </ion-item>
              <ion-item-options>
                <ion-item-option (click)="remove(key, playerName)" color="danger">
                  <ion-icon name="trash" slot="icon-only"></ion-icon>
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          }
        </ion-list>
      </ion-content>
    `
})
export class SelectPlayerModal implements OnInit {
  firebaseStorageService = inject(FireBaseStorageService);
  modalService = inject(ModalService);
  actionSheet = inject(ActionSheetService);

  team: string | undefined | null = undefined;
  player: string | undefined | null = undefined;
  @Input() year: number | undefined;

  actionSheetOpen = false;

  _teams: Array<Team> = [];

  get teams() {
    return this.groupBy(this._teams, x => x.name);
  }

  get teamKeys() {
    const regex = new RegExp(this.team ?? '', 'i');

    return this._teams.filter(x => (this.year ? x.year === this.year : true) && regex.test(x.name)).map(x => x.name);
  }

  get canSubmit(): boolean {
    return this.teamFieldValid && this.playerFieldValid;
  }

  get teamFieldValid(): boolean {
    return !!(this.team && this.team.trim().length > 0 && this.teamKeys.includes(this.team));
  }

  get playerFieldValid(): boolean {
    return !!(this.player && this.player.trim().length > 0);
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

  getPlayers(key: string) {
    const regex = new RegExp(this.player ?? '', 'i');

    return (this.teams?.[key]?.[0]?.players ?? []).filter(x => regex.test(x));
  }

  ngOnInit(): void {
    this.firebaseStorageService.getTeams().subscribe(x => this._teams = x);
  }

  cancel(): void {
    this.modalService.dismiss(null, 'backdrop');
  }

  submit(): void {
    if (!this.team || !this.player) {
      return;
    }

    const existing = this._teams.find(x => x.name === this.team);
    let existingPlayer = existing?.players.find(x => x.toLowerCase() === this.player!.trim().toLowerCase());
    if (!existing) {
      return;
    }

    if (existingPlayer) {
      this.player = existingPlayer;
    } else {
      existing.players.push(this.player);
    }

    (existingPlayer ? of(undefined) : this.firebaseStorageService.addOrUpdateTeamPlayers(existing))
      .subscribe(() => {
        this.modalService.dismiss(`${this.player} ➡️ ${existing.name}`, 'destructive');
      });
  }

  remove(team: string, player: string): void {
    this.actionSheetOpen = true;

    this.actionSheet.show("Should the player be deleted?", [
      {
        text: 'Yes, delete the player.',
        role: "yes"
      },
      {
        text: 'No, cancel.',
        role: "cancel"
      },
    ]).then((result) => {
      if (result === "yes") {
        const existing = this._teams.find(x => x.name === team);
        if (existing) {
          existing.players = existing.players.filter(x => x != player);

          this.firebaseStorageService.addOrUpdateTeamPlayers(existing).subscribe();
        }
      }
    }).finally(() => {
      this.actionSheetOpen = false;
    });
  }

  private groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
    arr.reduce((groups, item) => {
      (groups[key(item)] ||= []).push(item);
      return groups;
    }, {} as Record<K, T[]>);
}
