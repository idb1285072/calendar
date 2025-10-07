import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { CalendarComponent } from './calendar/calendar.component';
import { DateCellComponent } from './calendar/date-cell/date-cell.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddActivityComponent } from './calendar/add-activity/add-activity.component';
import { LoginComponent } from './auth/login/login.component';
import { ActivitiesModalComponent } from './calendar/activities-modal/activities-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CalendarComponent,
    DateCellComponent,
    AddActivityComponent,
    LoginComponent,
    ActivitiesModalComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
