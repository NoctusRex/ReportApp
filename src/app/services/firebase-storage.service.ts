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
import {Game} from "../models/game.model";
import {Team} from "../models/team.model";


@Injectable({providedIn: 'root'})
export class FireBaseStorageService {

  private loadingController = inject(LoadingController);
  private injector = inject(Injector);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private games = new BehaviorSubject<Array<Game>>([]);
  private user: any;

  constructor() {
    signInAnonymously(this.auth).then(x => this.user = x);
  }

  getGames(): Observable<Array<Game>> {
    if (this.games.value && this.games.value.length > 0) {
      return this.games.pipe(take(1));
    }

    return this.runInContext(() => {
      const gamesRef = collection(this.firestore, 'games');

      return collectionData(gamesRef, {idField: 'id'}) as Observable<Array<Game>>;
    }).pipe(take(1), tap(games => this.games.next(games)));
  }

  getReports(): Observable<Array<Report>> {
    return this.runInContext(() => {
      const reportsRef = collection(this.firestore, 'reports');
      return (collectionData(reportsRef, {idField: 'id'}) as Observable<Report[]>).pipe(take(1));
    });
  }

  getReport(id: number): Observable<Report | undefined> {
    return this.runInContext(() => {
      const reportsRef = doc(this.firestore, `reports/${id}`);

      return (docData(reportsRef, {idField: 'id'}) as Observable<Report>).pipe(take(1));
    });
  }

  deleteReport(id: number): Observable<void> {
    return this.runInContext(() => {
      const reportRef = doc(this.firestore, `reports/${id}`);

      return from(deleteDoc(reportRef));
    });
  }

  addOrUpdateReport(report: Report): Observable<void> {
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

  getJudges(): Observable<Array<string>> {
    return this.runInContext(() => {
      const reportsRef = collection(this.firestore, 'judges');
      return (collectionData(reportsRef, {idField: 'id'}) as Observable<Array<{
        id: string
      }>>).pipe(
        take(1),
        map(x => x?.map(y => y.id) || []));
    });
  }

  addOrUpdateJudge(judge: string): Observable<void> {
    return this.runInContext(() => {
      const reportRef = doc(this.firestore, `judges/${judge}`);

      return from(setDoc(reportRef, {id: judge}));
    });
  }

  deleteJudge(id: string): Observable<void> {
    return this.runInContext(() => {
      const reportRef = doc(this.firestore, `judges/${id}`);

      return from(deleteDoc(reportRef));
    });
  }

  getTeams(): Observable<Array<Team>> {
    return this.runInContext(() => {
      const reportsRef = collection(this.firestore, 'teams');

      return (collectionData(reportsRef, {idField: 'id'}) as Observable<Array<Team>>).pipe(
        take(1),
        map(x => {
          x.forEach((r) => {
            if (!r.players) {
              r.players = [];
            }
          })

          return x;
        })
      )
    });
  }

  addOrUpdateTeamPlayers(team: Team): Observable<void> {
    return this.runInContext(() => {
      const reportRef = doc(this.firestore, `teams/${team.id}`);

      return from(setDoc(reportRef, team));
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
