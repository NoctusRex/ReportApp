import {Game, StorageService} from "./storage.service";
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  limit,
  orderBy,
  query,
  setDoc
} from '@angular/fire/firestore';
import {Report} from "../models/report.model";
import {BehaviorSubject, concatMap, finalize, from, map, Observable, take, tap} from "rxjs";
import {inject, Injectable, Injector, runInInjectionContext} from "@angular/core";
import {Auth, signInAnonymously} from "@angular/fire/auth";
import {LoadingController} from "@ionic/angular";


@Injectable()
export class FireBaseStorageService extends StorageService {

  private loadingController = inject(LoadingController);
  private injector = inject(Injector);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private games = new BehaviorSubject<Array<Game>>([]);
  private user: any;

  constructor() {
    super();

    signInAnonymously(this.auth).then(x => this.user = x);
  }

  override getGames(): Observable<Array<Game>> {
    if (this.games.value && this.games.value.length > 0) {
      return this.games.pipe(take(1));
    }

    return this.runInContext(() => {
      const gamesRef = collection(this.firestore, 'games');

      return collectionData(gamesRef, {idField: 'id'}) as Observable<Array<Game>>;
    }).pipe(take(1), tap(games => this.games.next(games)));
  }

  override getReports(): Observable<Array<Report>> {
    return this.runInContext(() => {
      const reportsRef = collection(this.firestore, 'reports');
      return (collectionData(reportsRef, {idField: 'id'}) as Observable<Report[]>).pipe(take(1));
    });
  }

  override getReport(id: number): Observable<Report | undefined> {
    return this.runInContext(() => {
      const reportsRef = doc(this.firestore, `reports/${id}`);

      return (docData(reportsRef, {idField: 'id'}) as Observable<Report>).pipe(take(1));
    });
  }

  override deleteReport(id: number): Observable<void> {
    return this.runInContext(() => {
      const reportRef = doc(this.firestore, `reports/${id}`);

      return from(deleteDoc(reportRef));
    });
  }

  override setReports(reports: Array<Report>): Observable<void> {
    throw new Error("Method not implemented.");
  }

  override addOrUpdateReport(report: Report): Observable<void> {
    return this.getHighestReportId().pipe(
      concatMap(lastId => {
        return this.runInContext(() => {
          if (report.id === undefined) {
            report.id = (lastId ?? 0) + 1;
          }

          const reportRef = doc(this.firestore, `reports/${report.id}`);

          return from(setDoc(reportRef, report));
        });
      })
    )
  }

  getHighestReportId(): Observable<number | null> {
    return this.runInContext(() => {
      const reportsCollection = collection(this.firestore, 'reports');
      const q = query(
        reportsCollection,
        orderBy('id', 'desc'),
        limit(1)
      );

      return collectionData(q, {idField: 'docId'}).pipe(
        take(1),
        map(reports => {
          if (reports.length > 0) {
            return Number(reports[0]['id']);
          } else {
            return null;
          }
        })
      );
    });
  }

  private runInContext(fn: () => Observable<any>): Observable<any> {
    return from(this.loadingController.create({
      duration: 30000,
      keyboardClose: true,
      showBackdrop: true,
      spinner: "crescent"
    })).pipe(
      concatMap(loading => from(loading.present()).pipe(
          concatMap(() => from(runInInjectionContext(this.injector, () => fn()))),
          finalize(() => loading.dismiss())
        )
      )
    );
  }
}
