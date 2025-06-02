import {inject, Injectable} from "@angular/core";
import {ModalController, ModalOptions} from "@ionic/angular";
import {concatMap, EMPTY, from, map, Observable, of, tap} from "rxjs";
import {SelectJudgeModal} from "../modals/select-judge.modal";
import {LocalStorageService} from "./local-storage.service";
import {SelectPlayerModal} from "../modals/select-player.modal";

@Injectable({providedIn: 'root'})
export class ModalService {

  private modalController = inject(ModalController);
  private localStorageService = inject(LocalStorageService);

  open<T>(options: ModalOptions): Observable<T | null> {
    return from(this.modalController.create(options)).pipe(
      concatMap(modal =>
        from(modal.present()).pipe(concatMap(() => from(modal.onWillDismiss()))
        )),
      map(({data, role}) => {
        if (role === 'backdrop') {
          return null;
        }

        return data as T;
      })
    );
  }

  dismiss<T>(data: T, role?: string) {
    from(this.modalController.dismiss(data, role)).subscribe();
  }

  getJudgeName(initialValue?: string, force = true, saveName = true): Observable<string> {
    return this.open<string | null>({component: SelectJudgeModal, componentProps: {judge: initialValue}}).pipe(
      concatMap(judge => {
        if (!judge && force) {
          return this.getJudgeName(initialValue);
        }

        if (!judge) {
          return EMPTY;
        }

        return of(judge).pipe(
          tap(judge => {
            if (saveName) {
              this.localStorageService.setJudgeName(judge);
            }
          })
        );
      })
    )
  }

  getPlayerName(year: number | undefined | null): Observable<string> {
    return this.open<string | null>({component: SelectPlayerModal, componentProps: {year}}).pipe(
      concatMap(player => {
        if (!player) {
          return EMPTY;
        }

        return of(player);
      })
    )
  }
}
