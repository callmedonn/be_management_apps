// Angular
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
// Components
import { BaseComponent } from "./views/theme/base/base.component";
import { ErrorPageComponent } from "./views/theme/content/error-page/error-page.component";
// Auth
import { AuthGuard } from "./core/auth";

const routes: Routes = [
	{
		path: "auth",
		loadChildren: () =>
			import("./views/pages/auth/auth.module").then((m) => m.AuthModule),
	},

	{
		path: "",
		component: BaseComponent,
		canActivate: [AuthGuard],
		data: {
			expectedRole: [
				"administrator",
				"manager",
				"spv-tro",
				"admin-tro",
				"spv-finance",
				"admin-finance",
				"spv-engineer",
				"engineer",
				"user",
				"admin-engineer",
			],
		},
		children: [
			{
				path: "dashboard",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"administrator",
						"spv-tro",
						"admin-tro",
						"spv-finance",
						"admin-finance",
						"spv-engineer",
						"admin-engineer",
						"manager",
						"engineer",
						"user",
						"admin-engineer",
					],
				},
				loadChildren: () =>
					import("./views/pages/dashboard/dashboard.module").then(
						(m) => m.DashboardModule
					),
			},
			{
				path: "bgroup",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"administrator",
						"spv-tro",
						"admin-tro",
						"manager",
					],
				},
				loadChildren: () =>
					import("./views/pages/blockgroup/block-group.module").then(
						(m) => m.BlockGroupModule
					),
			},

			{
				path: "deposit",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"administrator",
						"manager",
						"spv-finance",
						"admin-finance"
						
					],
				},
				loadChildren: () =>
					import("./views/pages/deposit/deposit.module").then(
						(m) => m.DepositModule
					),
			},
			{
				path: "defect",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-engineer",
						"admin-engineer",
					],
				},
				loadChildren: () =>
					import("./views/pages/defect/defect.module").then(
						(m) => m.DefectModule
					),
			},
			{
				path: "tax",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/masterData/tax/tax.module").then(
						(m) => m.TaxModule
					),
			},
			{
				path: "category",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-engineer",
						"admin-engineer",
					],
				},
				loadChildren: () =>
					import("./views/pages/category/category.module").then(
						(m) => m.CategoryModule
					),
			},
			{
				path: "block",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro"
					],
				},
				loadChildren: () =>
					import("./views/pages/block/block.module").then(
						(m) => m.BlockModule
					),
			},
			{
				path: "apark",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/addpark/addpark.module").then(
						(m) => m.AddparkModule
					),
			},
			{
				path: "SpvTicket",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"spv-engineer",
						"admin-engineer",
					],
				},
				loadChildren: () =>
					import("./views/pages/ticketSpv/ticket.module").then(
						(m) => m.TicketSpvModule
					),
			},
			{
				path: "ticket",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro",
						"spv-engineer",
						"admin-engineer"
					],
				},
				loadChildren: () =>
					import("./views/pages/ticket/ticket.module").then(
						(m) => m.TicketModule
					),
			},
			{
				path: "calendar",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro",
						"spv-engineer",
					],
				},
				loadChildren: () =>
					import("./views/pages/calendar-helpdesk/calendar-helpdesk.module").then(
						(m) => m.CalendarHelpdeskModule
					),
			},
			{
				path: "UserTicket",
				canActivate: [AuthGuard],
				data: {
					expectedRole: ["administrator"],
				},
				loadChildren: () =>
					import("./views/pages/ticketUser/ticketUser.module").then(
						(m) => m.TicketUserModule
					),
			},


			{
				path: "deliveryorder",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro",
						"spv-engineer",
						"admin-engineer",
						"user"
					],
				},
				loadChildren: () =>
					import("./views/pages/deliveryorder/deliveryorder.module").then(
						(m) => m.DeliveryorderModule
					),
			},
			{
				path: "rating",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro",
						"spv-engineer",
						"admin-engineer",
						"user"
					],
				},
				loadChildren: () =>
					import("./views/pages/rating/rating.module").then(
						(m) => m.RatingModule
					),
			},
			{
				path: "engineer",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"spv-engineer"
					],
				},
				loadChildren: () =>
					import("./views/pages/engineer/engineer.module").then(
						(m) => m.EngineerModule
					),
			},
			{
				path: "accountBank",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/masterData/bank/accountBank/accountBank.module").then(
						(m) => m.AccountBankModule
					),
			},
			{
				path: "building",
				canActivate: [AuthGuard],
				data: {
					expectedRole: ["administrator"],
				},
				loadChildren: () =>
					import("./views/pages/building/building.module").then(
						(m) => m.BuildingModule
					),
			},
			{
				path: "floor",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro"
					],
				},
				loadChildren: () =>
					import("./views/pages/floor/floor.module").then(
						(m) => m.FloorModule
					),
			},
			{
				path: "accountType",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/accountType/accountType.module").then(
						(m) => m.AccountTypeModule
					),
			},
			{
				path: "accountGroup",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/accountGroup/accountGroup.module").then(
						(m) => m.AccountGroupModule
					),
			},
			{
				path: "role",
				canActivate: [AuthGuard],
				data: {
					expectedRole: ["administrator"
				],
				},
				loadChildren: () =>
					import("./views/pages/role/role.module").then(
						(m) => m.RoleModule
					),
			},
			{
				path: "parking",
				canActivate: [AuthGuard],
				data: {
					expectedRole: ["administrator"],
				},
				loadChildren: () =>
					import("./views/pages/parking/parking.module").then(
						(m) => m.ParkingModule
					),
			},
			{
				path: "subdefect",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [ "manager",
									"administrator",
									"spv-engineer",
									"admin-engineer",
								],
				},
				loadChildren: () =>
					import("./views/pages/subdefect/subdefect.module").then(
						(m) => m.SubdefectModule
					),
			},
			{
				path: "vehicletype",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/vehicletype/vehicletype.module").then(
						(m) => m.VehicletypeModule
					),
			},
			{
				path: "typeunit",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro"
					],
				},
				loadChildren: () =>
					import("./views/pages/unittype/unittype.module").then(
						(m) => m.UnitTypeModule
					),
			},
			{
				path: "rateunit",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator"
						],
				},
				loadChildren: () =>
					import("./views/pages/unitrate/unitrate.module").then(
						(m) => m.UnitRateModule
					),
			},
			{
				path: "ratePinalty",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator"],
				},
				loadChildren: () =>
					import("./views/pages/ratePinalty/ratePinalty.module").then(
						(m) => m.RatePinaltyModule
					),
			},
			{
				path: "revenue",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
					],
				},
				loadChildren: () =>
					import("./views/pages/revenue/revenue.module").then(
						(m) => m.RevenueModule
					),
			},

			{
				path: "rental",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/bm/rental/rental.module").then(
						(m) => m.RentalModule
					),
			},
			{
				path: "am",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
						
					],
				},
				loadChildren: () =>
					import("./views/pages/asset/assetManagement/am.module").then(
						(m) => m.AmModule
					),
			},

			{
				path: "assetDepreciation",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/asset/assetDepreciation/ad.module").then(
						(m) => m.AdModule
					),
			},
			{
				path: "unit",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro",
						"spv-finance",
						"admin-finance",

					],
				},
				loadChildren: () =>
					import("./views/pages/unit/unit.module").then(
						(m) => m.UnitModule
					),
			},
			{
				path: "customer",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro"
					],
				},
				loadChildren: () =>
					import("./views/pages/customer/customer.module").then(
						(m) => m.CustomerModule
					),
			},
			{
				path: "power-management",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance",
						"spv-engineer",
						"admin-engineer",
					],
				},
				loadChildren: () =>
					import("./views/pages/power/power.module").then(
						(m) => m.PowerModule
					),
			},
			{
				path: "data-transfer",
				canActivate: [AuthGuard],
				data: {
					expectedRole: ["administrator"],
				},
				loadChildren: () =>
					import(
						"./views/pages/datatransfer/datatransfer.module"
					).then((m) => m.DataTransferModule),
			},
			{
				path: "contract-management",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro",
						"spv-finance",
						"admin-finance",
					],
				},
				loadChildren: () =>
					import("./views/pages/contract/contract.module").then(
						(m) => m.ContractModule
					),
			},
			{
				path: "water-management",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance",
						"spv-engineer",
						"admin-engineer",
					],
				},
				loadChildren: () =>
					import("./views/pages/water/water.module").then(
						(m) => m.WaterModule
					),
			},
			{
				path: "gas-management",
				canActivate: [AuthGuard],
				data: {
					expectedRole: ["administrator"],
				},
				loadChildren: () =>
					import("./views/pages/gas/gas.module").then(
						(m) => m.GasModule
					),
			},
			{
				path: "billing-management",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator"
					],
				},
				loadChildren: () =>
					import("./views/pages/billing/billing.module").then(
						(m) => m.BillingModule
					),
			},
			{
				path: "pinalty",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
					"manager",
					"administrator",
					"spv-finance",
					"admin-finance"]
				},
				loadChildren: () =>
					import("./views/pages/pinalty/pinalty.module").then(
						(m) => m.PinaltyModule
					),
			},
   
			{
				path: "user-management",
				canActivate: [AuthGuard],
				data: {
					expectedRole: ["administrator"],
				},
				loadChildren: () =>
					import(
						"./views/pages/user-management/user-management.module"
					).then((m) => m.UserManagementModule),
			},
			{
				path: "bank",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import(
						"./views/pages/masterData/bank/bank/bank.module"
					).then((m) => m.BankModule),
			},
			{
				path: "invoice",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import(
						"./views/pages/invoice/invoice.module"
					).then((m) => m.InvoiceModule),
			},
			{
				path: "pwbill",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance",
						"spv-tro",
						"admin-tro"
					],
				},
				loadChildren: () =>
					import(
						"./views/pages/powbill/powbill.module"
					).then((m) => m.PowbillModule),
			},
			{
				path: "import",
				loadChildren: () =>
					import("./views/pages/import/import.module").then(
						(m) => m.ImportModule
					),
			},

			//Billing
			{
				path: "billing",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance",
						"spv-tro",
						"admin-tro"
					],
				},
				loadChildren: () =>
					import("./views/pages/billing/billing.module").then(
						(m) => m.BillingModule
					),
			},

			{
				path: "rntlbilling",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance",
						"spv-tro",
						"admin-tro"
					],
				},
				loadChildren: () =>
					import("./views/pages/rentalbilling/rentalbilling.module").then(
						(m) => m.RentalbillingModule
					),
			},
			{
				path: "lsebilling",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance",
						"spv-tro",
						"admin-tro"
					],
				},
				loadChildren: () =>
					import("./views/pages/lsebilling/lsebilling.module").then(
						(m) => m.LsebillingModule
					),
			},
			{
				path: "prkbilling",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance",
						"spv-tro",
						"admin-tro"
					],
				},
				loadChildren: () =>
					import("./views/pages/prkbilling/prkbilling.module").then(
						(m) => m.PrkbillingModule
					),
			},

			//Master Asset
			{
				path: "fixed",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/masterData/asset/fixed/fixed.module").then(
						(m) => m.FixedModule
					),
			},
			{
				path: "fiscal",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/masterData/asset/fiscal/fiscal.module").then(
						(m) => m.FiscalModule
					),
			},
			{
				path: "uom",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/masterData/asset/uom/uom.module").then(
						(m) => m.UomModule
					),
			},
			{
				path: "cashb",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/cashb/cashb.module").then(
						(m) => m.CashbModule
					),
			},

			// Finance 

			{
				path: "ar",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/finance/ar/ar.module").then(
						(m) => m.ArModule
					),
			},
			{
				path: "ap",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
									"manager",
									"administrator",
									"spv-finance",
									"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/finance/ap/ap.module").then(
						(m) => m.ApModule
					),
			},
			{
				path: "gl",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
						"admin-finance"
					],
				},
				loadChildren: () =>
					import("./views/pages/finance/gl/gl.module").then(
						m => m.GlModule
					),
			},

			// Services
			{
				path: "packages",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro",
						"customer-service"
					],
				},
				loadChildren: () =>
					import("./views/pages/services/packages/packages.module").then(
						m => m.PackagesModule
					),
			},
			{
				path: "pkgs",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
					],
				},
				loadChildren: () =>
					import("./views/pages/log/pkgs/pkgs.module").then(
						m => m.PkgsModule
					),
			},
			{
				path: "visitor",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro",
						"customer-service"
					],
				},
				loadChildren: () =>
					import("./views/pages/services/visitor/visitor.module").then(
						m => m.VisitorModule
					),
			},
			{
				path: "blast-news",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"admin-tro",
						"spv-tro"
					],
				},
				loadChildren: () =>
					import('./views/pages/services/blast-notification/blast-notification.module')
					.then(m => m.BlastNotificationModule)
			},
			{
				path: "facility-reservation",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro",
					],
				},
				loadChildren: () =>
					import('./views/pages/services/facility-reservation/facility-reservation.module')
					.then(m => m.FacilityReservationModule)
			},
			
			{
				path: "openingBalance",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
					],
				},
				loadChildren: () =>
					import("./views/pages/masterData/openingBalance/openingBalance.module").then(
						m => m.OpeningBalanceModule
					),
			},


			{
				path: "facility",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-tro",
						"admin-tro"
					],
				},
				loadChildren: () =>
					import("./views/pages/masterData/facility/facility.module").then(
						m => m.FacilityModule
					),
			},
			{
				path: "budgeting",
				canActivate: [AuthGuard],
				data: {
					expectedRole: [
						"manager",
						"administrator",
						"spv-finance",
					],
				},
				loadChildren: () =>
					import("./views/pages/services/budgeting/budgeting.module").then(
						(m) => m.BudgetingModule
					),
			},
			{
				path: "error/403",
				component: ErrorPageComponent,
				data: {
					type: "error-v6",
					code: 403,
					title: "403... Access forbidden",
					desc:
						"Looks like you don't have permission to access for requested page.<br> Please, contact administrator",
				},
			},
			{ path: "error/:type", component: ErrorPageComponent },
			{ path: "", redirectTo: "/dashboard", pathMatch: "full" },
			{ path: "**", redirectTo: "/dashboard", pathMatch: "full" },
		],
	},

	{ path: "**", redirectTo: "error/403", pathMatch: "full" },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
