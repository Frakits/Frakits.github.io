import fs from 'fs'
import run from './mediaSaving.js'
import get from './httpsPromise.js'
import https from 'https'
export default(list) => {
	if (list == null) list = JSON.parse(fs.readFileSync("./final_listv2.json"))
	let array = [];
	Object.entries(list).forEach(([key, value]) => {for (let game of value) {
		array.push(game.uid)
		if (!fs.existsSync(`./roblox icons/${game.uid}-media`)) fs.mkdirSync(`./roblox icons/${game.uid}-media`);
	}});
	let progress = 0;
	let timer = 1;
	for (let arraychunk of chunk(array, 50)) {
		timer++
		setTimeout(() => {
			get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${arraychunk.toString()}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`)
			.then(value => {
				value = JSON.parse(value.body);
				for (let game of value.data) {
					let file = fs.createWriteStream(`./roblox icons/${game.targetId}.png`)
					timer++;
					setTimeout(() => {
						https.get(game.imageUrl, response => {
							response.pipe(file);
						})
					}, 350 * timer)
					console.log("saving icon..")
				}
			})
		}, 350 * timer)
		//setTimeout(() => {
		//	get(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${arraychunk.toString()}&countPerUniverse=999&defaults=true&size=768x432&format=Png&isCircular=false`)
		//	.then(value => {
		//		let timer = 0;
		//		value = JSON.parse(value.body);
		//		for (let game of value.data) {
		//			for (let thumbnail of game.thumbnails) {
		//				timer++;
		//				let file = fs.createWriteStream(`./roblox icons/${game.universeId}-media/${thumbnail.targetId}.png`)
		//				setTimeout(() => {
		//					https.request(thumbnail.imageUrl, response => {
		//						response.pipe(file);
		//					}).end();
		//					console.log("saving thumbnail..")
		//				}, 350 * timer);
		//			}
		//		}
		//	})
		//}, 350 * (array.length + timer));
	}
}
export function chunk(arr, size) {
	return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
		arr.slice(i * size, i * size + size)
	  );
}