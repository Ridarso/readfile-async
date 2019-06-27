import * as dotenv from 'dotenv';

import * as mqtt from 'async-mqtt';
import * as nedbstore from 'mqtt-nedb-store';

import { sprintf } from 'sprintf-js';

dotenv.config({
	path: process.env.ENV_FILE,
	encoding: 'utf8',
});

var db = nedbstore(process.env.NEDB_FILE ? process.env.NEDB_FILE : "__nedb__/up");

var client = mqtt.connect(process.env.MQTT_BROKER_URI, {
	clientId: 'sync-server-up-1',
	clean: false,
	queueQoSZero: true,
	
	incomingStore: db.incoming,
	outgoingStore: db.outgoing,
});

client.on('connect', async () => {
	console.log(`connected to MQTT broker ${process.env.MQTT_BROKER_URI}`);
	
	try {
		await client.subscribe("test1/+/up", {
			qos: 2
		});
		
		console.log(`subscribed to test1/+/up`);
	} catch (err) {
		console.error("Error!", err);
		
		client.end();
	}
});

client.on('error', (err) => {
	console.error("Error!", err);
	
	// TODO
});

client.on('message', (topic: string, message: Buffer) => {
  console.log(`${topic} ${message.toString()}`);
});
