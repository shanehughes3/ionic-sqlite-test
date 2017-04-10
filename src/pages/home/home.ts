import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { DbService } from "../../providers/db.service";

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	firstStuff: string = "";
	secondStuff: string = "";
	things: any[] = [];

	constructor(
		public navCtrl: NavController,
		private db: DbService,
		private events: Events
	) {
		this.events.subscribe("DatabaseInitialized", this.getStuff.bind(this));
	}

	private getStuff() {
		this.db.getStuff().then((rows: any[]) => {
			this.things = rows;
		}).catch((err) => { console.error(err); });
	}

	private saveStuff() {
		this.db.saveStuff(this.firstStuff, this.secondStuff)
			.then(() => {
				this.firstStuff = "";
				this.secondStuff = "";
				this.getStuff();
			}).catch((err) => {
				console.error(err);
			});

	}

}
