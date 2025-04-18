import { Routes } from '@angular/router';
import { FormAComponent } from './form-a/form-a.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'form1', component: FormAComponent },
  { path: '', component: HomeComponent },
];
