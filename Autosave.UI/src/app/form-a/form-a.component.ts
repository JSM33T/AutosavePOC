import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-form-a',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink],
  templateUrl: './form-a.component.html',
})
export class FormAComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  status: string = 'Idle';
  private syncInterval!: Subscription;
  private readonly storageKey = 'autosave-form1';
  private readonly apiUrl = `${environment.apiBaseUrl}/api/autosave/save`;
  private readonly getUrl = `${environment.apiBaseUrl}/api/autosave/getbyid`;
  private lastSyncedJson: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [0],
      title: ['', Validators.required],
      description: [''],
      isAutosaved: [true],
    });

    window.addEventListener('beforeunload', this.syncToBackend.bind(this));

    this.route.queryParams.subscribe((params) => {
      const id = +params['id'];

      if (id > 0) {
        this.http.get<any>(`${this.getUrl}?id=${id}`).subscribe((data) => {
          data.isAutosaved = true; // ✅ mark record as being edited
          //   this.form.patchValue(data);

          //   localStorage.setItem(this.storageKey, JSON.stringify(data));
          //   this.status = 'Loaded from backend';
          delete data.dateCreated;
          delete data.hits;
          this.form.patchValue(data);
          this.lastSyncedJson = JSON.stringify(data);
          localStorage.setItem(this.storageKey, JSON.stringify(data));

          this.status = 'Loaded from backend';
        });
      } else {
        const saved = localStorage.getItem(this.storageKey);

        if (saved) {
          const parsed = JSON.parse(saved);

          const isFreshDraft =
            !parsed.id || parsed.id === 0 || parsed.isAutosaved === true;

          if (isFreshDraft) {
            delete parsed.DateCreated;
            delete parsed.Hits;
            this.form.patchValue(parsed);
            this.lastSyncedJson = JSON.stringify(parsed);
            this.status = 'Loaded from localStorage';
          } else {
            // 🔥 Force clean state if it's a submitted or stale record
            localStorage.removeItem(this.storageKey);
            this.form.reset({
              id: 0,
              title: '',
              description: '',
              isAutosaved: true,
            });
            this.lastSyncedJson = JSON.stringify(this.form.value);
            this.status = 'New form - cleared old data';
          }
        } else {
          // No saved data — ensure clean start
          this.form.reset({
            id: 0,
            title: '',
            description: '',
            isAutosaved: true,
          });
          this.status = 'New form - no saved data';
        }
      }
    });

    this.form.valueChanges
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe((val) => {
        localStorage.setItem(this.storageKey, JSON.stringify(val));
        this.status = 'Autosaved locally';
      });

    this.syncInterval = interval(5000).subscribe(() => this.syncToBackend());
  }
  private syncToBackend(): void {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return;

    if (data === this.lastSyncedJson) return;

    console.log(data);
    console.log('==========================');
    console.log(this.lastSyncedJson);

    const parsed = JSON.parse(data);

    // Do not sync if the record was already submitted (isAutosaved === false)
    if (!parsed.title || parsed.title.trim() === '') return;
    if (parsed.isAutosaved === false) return;

    if (parsed.isAutosaved !== false) {
      parsed.isAutosaved = true;
    }

    // this.http.post<any>(this.apiUrl, parsed).subscribe((res) => {
    //   this.status = 'Synced to backend';

    //   if (parsed.id === 0 && res?.id > 0) {
    //     parsed.id = res.id;
    //     this.form.patchValue({ id: res.id });
    //     localStorage.setItem(this.storageKey, JSON.stringify(parsed));
    //     this.location.replaceState(`/form1?id=${res.id}`);
    //   }
    // });
    this.http.post<any>(this.apiUrl, parsed).subscribe((res) => {
      this.status = 'Synced to backend';
      this.lastSyncedJson = JSON.stringify(parsed);

      if (parsed.id === 0 && res?.id > 0) {
        parsed.id = res.id;
        this.form.patchValue({ id: res.id });
        localStorage.setItem(this.storageKey, JSON.stringify(parsed));
        this.location.replaceState(`/form1?id=${res.id}`);
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      const payload = {
        ...this.form.value,
        isAutosaved: false,
      };

      this.http.post<any>(this.apiUrl, payload).subscribe((res) => {
        localStorage.removeItem(this.storageKey);
        this.status = 'Submitted and cleared local storage';

        if (res?.id > 0) {
          this.router.navigate([], {
            queryParams: { id: res.id },
            queryParamsHandling: 'merge',
          });
        }
      });
    } else {
      this.status = 'Form is invalid';
    }
  }

  ngOnDestroy(): void {
    this.syncInterval?.unsubscribe();
    this.syncToBackend();
    localStorage.removeItem(this.storageKey);
    window.removeEventListener('beforeunload', this.syncToBackend.bind(this));
  }
}
