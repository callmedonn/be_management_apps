// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
// Core Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { DashboardComponent } from './dashboard.component';
import { GeneralComponent } from './general/general.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { MatProgressSpinnerModule } from '@angular/material';
import { AccountingComponent } from './accounting/accounting.component';
import { EngComponent } from './eng/eng.component';
// import { EngineerComponent } from './engineer/engineer.component';

const routes: Routes = [
	{
		path: '',
		component: DashboardComponent,
		children: [
			{
				path: '',
				component: GeneralComponent
			},
			{
				path: 'accounting',
				component: AccountingComponent
			},
			{
				path: 'engineer',
				component: EngComponent
			},
			
		]
	}
];

@NgModule({
	imports: [
		InlineSVGModule,
		CommonModule,
		PartialsModule,
		CoreModule,
		RouterModule.forChild(routes),

		MatProgressSpinnerModule
	],
	providers: [],
	entryComponents: [DashboardComponent],
	declarations: [
		DashboardComponent,
		GeneralComponent,
		AccountingComponent,
		EngComponent
	],
})
export class DashboardModule {
}
