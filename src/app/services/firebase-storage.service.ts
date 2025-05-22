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
import {BehaviorSubject, concatMap, from, map, Observable, take} from "rxjs";
import {inject, Injectable, Injector, runInInjectionContext} from "@angular/core";
import {Auth, signInAnonymously} from "@angular/fire/auth";


@Injectable()
export class FireBaseStorageService extends StorageService {

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
    return runInInjectionContext(this.injector, () => {
      const gamesRef = collection(this.firestore, 'games');

      return collectionData(gamesRef, {idField: 'id'}) as Observable<Array<Game>>;
    }).pipe(take(1));
  }

  override getReports(): Observable<Array<Report>> {
    return runInInjectionContext(this.injector, () => {
      const reportsRef = collection(this.firestore, 'reports');
      return (collectionData(reportsRef, {idField: 'id'}) as Observable<Report[]>).pipe(take(1));
    });
  }

  override getReport(id: number): Observable<Report | undefined> {
    return runInInjectionContext(this.injector, () => {
      const reportsRef = doc(this.firestore, `reports/${id}`);

      return (docData(reportsRef, {idField: 'id'}) as Observable<Report>).pipe(take(1));
    });
  }

  override deleteReport(id: number): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const reportRef = doc(this.firestore, `reports/${id}`);

      return deleteDoc(reportRef);
    }));
  }

  override setReports(reports: Array<Report>): Observable<void> {
    throw new Error("Method not implemented.");
  }

  override addOrUpdateReport(report: Report): Observable<void> {
    return this.getHighestReportId().pipe(
      concatMap(lastId => {
        return from(runInInjectionContext(this.injector, () => {
          if (report.id === undefined) {
            report.id = (lastId ?? 0) + 1;
          }

          const reportRef = doc(this.firestore, `reports/${report.id}`);

          return setDoc(reportRef, report);
        }));
      })
    )
  }

  getHighestReportId(): Observable<number | null> {
    return runInInjectionContext(this.injector, () => {
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
}
