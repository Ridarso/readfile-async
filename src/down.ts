import * as dotenv from 'dotenv';

import * as mqtt from 'async-mqtt';
import * as nedbstore from 'mqtt-nedb-store';

import * as fs from 'fs';
import * as readline from 'readline';
import * as stream from 'stream';

import { sprintf } from 'sprintf-js';

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// function readlines(input) {
// 	const output = new stream.PassThrough({ objectMode: true });
// 	const rl = readline.createInterface(input);
// 	rl.on("line", line => {
// 		output.write(line);
// 	});

// 	rl.on("close", () => {
// 		output.push(null);
// 	}); 
// 	console.log('output', output);
// 	return output;
// }

function readlines(stream) {
	return new Promise((resolve, reject) => {
		let rl = readline.createInterface({
				input: stream
		});
		let data = [];
		rl.on('line', (line) => {
			data.push(line);
		}).on('close', () => {
			resolve(data);
		}).on('error', err => {
			reject(err);
		})
	});
}

async function loopCallback(list, callback, acct = []) {
	if(list.length === 0) return acct;
	const [head, ...tail] = list;
	return loopCallback(tail, callback, [...acct, await callback(head)]);
}

dotenv.config({
	path: process.env.ENV_FILE,
	encoding: 'utf8',
});

(async() => {
	const input = fs.createReadStream(process.env.INPUT_FILE);
	var cnt = 0;
	const list = await readlines(input);
	await loopCallback(list, async (line) => {
		console.log(`${cnt}|${line}`);
		++cnt;
		
		await sleep(1000);
	});
	console.error("Done");
})();

/*
var db = nedbstore(process.env.NEDB_FILE ? process.env.NEDB_FILE : "__nedb__/down");

console.log(`connecting to MQTT broker ${process.env.MQTT_BROKER_URI}`);

var client = mqtt.connect(process.env.MQTT_BROKER_URI, {
	clientId: 'sync-server-down-1',
	clean: false,
	queueQoSZero: true,
	
	incomingStore: db.incoming,
	outgoingStore: db.outgoing,
});


client.on('connect', async () => {
	console.log(`connected to MQTT broker ${process.env.MQTT_BROKER_URI}`);
	
	var cnt = 0;
	
	const n = 10;
	
	try {
		const input = fs.createReadStream(process.env.INPUT_FILE);

		for await (const line of readlines(input)) {
		// for (var i = 0; i < n; ++i) {
			// var line = 'Hi';
			
			console.log(`${cnt}|${line}`);
	
			await client.publish("test1/devA/down", `${cnt}|${line}`, {
				qos: 2,
			});
			
			++cnt;
			
			await sleep(1000);
		}
	} catch (err) {
		console.error("Error!", err);
	}
	
	console.log(sprintf("published %d message(s) to test1/devA/down", cnt));
	
	client.end();
	
	process.exit(0);
});

client.on('error', (err) => {
	console.error("Error!", err);
	// TODO
});
*/
