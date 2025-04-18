import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  entries: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.http
      .get<any[]>(`${environment.apiBaseUrl}/api/autosave/get`)
      .subscribe({
        next: (data) => {
          console.log('Fetched entries:', data);
          this.entries = data;
        },
        error: (err) => console.error('API error:', err),
      });
  }

  refresh(): void {
    window.location.reload();
  }

  goToForm(id: number) {
    this.router.navigate(['/form1'], { queryParams: { id } });
  }
}
