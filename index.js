let Parser = require('rss-parser');
let parser = new Parser();
const data = require('./data.json');
const https = require('https');
var request = require('request');
var progress = require('request-progress');
const fs = require('fs');
const dir = './OUTPUT/';

async function processItems(feed, podcastFolder){
	for (const item of feed.items) {
		console.log("-------------------------------------")
		console.log("Episode data: ", item.title + ':' + item.enclosure.url) // title of episodes + play url

		// Make episode folder
		const episodeFolder = podcastFolder + '/' + item.title; //'Episode '+ index +' - '+
		// console.log("FOLDER",episodeFolder);
		if (!fs.existsSync(episodeFolder)){
			await fs.mkdirSync(episodeFolder);
		}

	    const response = await progress(request(item.enclosure.url))
	    .on('progress', function (state) {
			console.log("Percentage done: ", state.percent*100 + '%')
		})
		.on('error', function (err) {
			console.log('\x1b[31m%s\x1b[0m', "ERROR");
			console.log(err);
		})
		.on('end', function () {
			console.log('\x1b[32m%s\x1b[0m', "File download completed!");
		})
		.pipe(fs.createWriteStream(episodeFolder + '/' + item.title+'.mp3'));
	}
};

(async () => {
	for (var i = 0; i < 1; i++) { // data.podcasts.length; i++) {
		console.log("Data Title: ", data.podcasts[i].title); // title of podcast from data
		console.log("=====================================")
		let feed = await parser.parseURL(data.podcasts[i].rss);
		
		// Make directory with podcast title
		const podcastFolder = dir + data.podcasts[i].title;
		if (!fs.existsSync(podcastFolder)){
			await fs.mkdirSync(podcastFolder);
		}

		console.log("RSS Title: ",feed.title); // title from rss
		console.log("=====================================")

		processItems(feed, podcastFolder);
	}

})();

// async downloadSaveEpisode(item) {
// 	console.log("-------------------------------------")
// 	console.log("Episode data: ", item.title + ':' + item.enclosure.url) // title of episodes + play url
// 	console.log("-------------------------------------")
	
// 	// Make episode folder
// 	const episodeFolder = podcastFolder + '/' + item.title; //'Episode '+ index +' - '+
// 	// console.log("FOLDER",episodeFolder);
// 	if (!fs.existsSync(episodeFolder)){
// 		await fs.mkdirSync(episodeFolder);
// 	}

// 	// Download mp3 and write into respective episode folder
// 	await progress(await request(item.enclosure.url), {})
// 	.on('progress', function (state) {
// 		console.log("Percentage done: ", state.percent*100 + '%')
// 	})
// 	.on('error', function (err) {
// 		console.log('\x1b[31m%s\x1b[0m', "ERROR");
// 		console.log(err);
// 	})
// 	.on('end', function () {
// 		console.log('\x1b[32m%s\x1b[0m', "File download completed!");
// 	})
// 	.pipe(fs.createWriteStream(episodeFolder + '/' + item.title+'.mp3'));
// }