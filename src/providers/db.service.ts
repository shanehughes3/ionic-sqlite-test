import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Platform, Events } from "ionic-angular";
import { SQLite } from "ionic-native";

const win: any = window;

import 'rxjs/add/operator/map';

@Injectable()
export class DbService {
	db: any;

	constructor(
		private platform: Platform,
		private events: Events
	) {
		this.initializeDatabase();
	}

	private initializeDatabase() {
		this.platform.ready().then(() => {
			if (win.sqlitePlugin) {
				this.db = new SQLite();
				this.db.openDatabase({
					name: "data.db",
					location: "default"
				}).then(() => this.createTables());
			} else {
				this.db = win.openDatabase("data.db", "1.0", "data", 1000000);
				this.createTables();
			}
		});
	}

	private createTables() {
		this.db.transaction((tx) => {
			tx.executeSql("CREATE TABLE IF NOT EXISTS stuff " +
				"(id INTEGER PRIMARY KEY AUTOINCREMENT, firstStuff TEXT, secondStuff TEXT)", [], () => {
					this.events.publish("DatabaseInitialized");
				})
		});
	}

	/**
	 * SQLite and WebSql return slightly different results (at least their plugins do)
	 * so we have to parse any desired rows into an array so that everything else
	 * is modular
	 */
	private parseReturnedRows(results: any) {
		if (Array.isArray(results.rows)) {
			return results.rows;
		} else {
			let output = [];
			for (let i = 0; i < results.rows.length; i++) {
				output.push(results.rows.item(i));
			}
			return output;
		}
	}

	public getStuff() {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql("SELECT * FROM stuff", [], (_tx, results) => {
					resolve(this.parseReturnedRows(results));
				});
			}, (err) => { reject(err); });
		});
	}

	public saveStuff(firstStuff, secondStuff) {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql("INSERT INTO stuff (firstStuff, secondStuff) VALUES (?, ?)",
					[firstStuff, secondStuff], (_tx, results) => {
						resolve(results);
					});
			}, (err) => { reject(err); });
		});
	}
}
