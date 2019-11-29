let Parser = require('rss-parser');
let parser = new Parser();
const data = require('./data.json');
const https = require('https');
var request = require('request');
var progress = require('request-progress');
const fs = require('fs');
const dir = './OUTPUT/';

function processItems(item, podcastFolder) {
	return new Promise(async (resolve, reject) => {
		console.log('\x1b[42m%s\x1b[0m',"EPISODE")
		console.log("Title: " + item.title + ', Play URL:' + item.enclosure.url) // title of episodes + play url

		// Make episode folder
		const episodeFolder = podcastFolder + '/' + item.title; //'Episode '+ index +' - '+
		// console.log("FOLDER",episodeFolder);
		if (!fs.existsSync(episodeFolder)){
			await fs.mkdirSync(episodeFolder);
		}
		
		console.log('\x1b[34m%s\x1b[0m',"Starting episode download...")

	    const response = await progress(request(item.enclosure.url))
	    .on('progress', function (state) {
			console.log("Progress :: ", (state.percent*100).toFixed(2) + '%')
		})
		.on('error', function (err) {
			console.log(err);
			reject("ERROR");
		})
		.on('end', function () {
			resolve("File download completed!");
		})
		.pipe(fs.createWriteStream(episodeFolder + '/' + item.title+'.mp3'));
	});
};

(async () => {
	for (var i = 0; i < data.podcasts.length; i++) {
		console.log("Data Title: ", data.podcasts[i].title); // title of podcast from data
		console.log("=====================================")
		let feed = await parser.parseURL(data.podcasts[i].rss);
		
		// Make OUTPUT folder if it doesn't exist
		if (!fs.existsSync(dir)){
			await fs.mkdirSync(dir);
		}

		// Make directory with podcast title
		const podcastFolder = dir + data.podcasts[i].title;
		if (!fs.existsSync(podcastFolder)){
			await fs.mkdirSync(podcastFolder);
		}

		console.log("RSS Title: ",feed.title); // title from rss
		console.log("=====================================")
		for (const item of feed.items) {
			const res = await processItems(item, podcastFolder);
			if (res === "ERROR") {
				console.log('\x1b[31m%s\x1b[0m', res);
			} else {
				console.log('\x1b[32m%s\x1b[0m', res);
				console.log("=====================================")
			}
		}
	}

})();