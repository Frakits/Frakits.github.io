import fs, { readFile } from 'fs'
import get from './httpsPromise.js';
import https from 'https'
import saveMedia from './mediaSaving.js'
let listOptions = JSON.parse(fs.readFileSync("./generator script/list_options.json").toString());
export default(list) => {
	let fixedList = Array.from(list);
	//clear duplicates before applying the algorithm
	fixedList = fixedList.filter((game, i) => fixedList.findIndex(function(el) {return el.id == game.id;}) == i);
	console.log("removed duplicates");

	//give various tags
	let tempList = JSON.parse(fs.readFileSync("./final_listv2-old.json"));
	let recomendlist = [];
	Object.entries(listOptions.games_for_recommendation).forEach(([key, value]) => recomendlist.push(value));
	Object.entries(listOptions.hall_of_fame).forEach(([key, value]) => recomendlist.push(value));
	let oldList = [];
	Object.entries(tempList).forEach(([key, game]) => {
		for (let i of game) oldList.push(i);
	});
	for (let game of fixedList) {
		if (oldList.findIndex(el => {return game.id == el.id}) == -1) {
			game.t.push("New To List");
			console.log("NEW");
		}
		if (recomendlist.includes(game.uid)) game.t.push("Hall Of Fame");
	}
	let temparray = []
	for (let game of fixedList) temparray.push(game.uid);
	let splitList = chunk(temparray, 100);
	let progress = 0;
	for (let arraychunk of splitList) {
		get(`https://games.roblox.com/v1/games?universeIds=${arraychunk.toString()}`).then(json => {
			json = JSON.parse(json.body);
			for (let game of json.data) {
				let actualGame = fixedList[fixedList.findIndex(function(el) {
					return el.uid == game.id;
				})]
				actualGame.t.push(game.genre == "All" ? "Uncategorized" : game.genre);
				if (game.createVipServersAllowed) 
					actualGame.t.push("Vip Server Available")

				//grab additional data
				actualGame.v = game.visits;
				actualGame.pr = game.price;
				actualGame.cdate = game.created;
				actualGame.udate = game.updated;
				console.log(JSON.stringify(actualGame));
			}
			progress++
			if (progress == splitList.length) {
				//add all tags in one list
				let tagsList = [];
				tagsList.push("Hall Of Fame");
				tagsList.push("New To List");
				for (let game of fixedList) for (let tag of game.t) if (!tagsList.includes(tag)) tagsList.push(tag == "All" ? "Uncategorized" : tag);

				//ELIMINATION & SCORING PHASE
				let cloneCopy = Array.from(fixedList);
				loop1:for (let game of cloneCopy) {
					//ELIMINATION PHASE
					loop2:for (let word of listOptions.elimination_phase.blacklist) {
						if (game.n.toLowerCase().indexOf(word) != -1 || game.d.toLowerCase().indexOf(word) != -1) {
							for (let exception of listOptions.elimination_phase.exceptions) {
								if (game.n.toLowerCase().indexOf(exception) != -1 || game.d.toLowerCase().indexOf(exception) != -1) break loop2;
							}
							let indexToRemove = fixedList.findIndex(function(el) {
								return el.id == game.id;
							});
							fixedList.splice(indexToRemove, 1);
							console.log(`deleted ${game.n}`);
							continue loop1;
						}
					}
				
					//SCORING PHASE
					let score = 0
					for (let word of listOptions.scoring_phase.up_scored) {
						let regex = new RegExp('\\b' + word + '\\b');
						let scoreIncrease = (game.n.toLowerCase().match(regex)?.length ?? 0) + ((game.d.toLowerCase().match(regex)?.length ?? 0) / 2)
						score += scoreIncrease;
					}
					for (let word of listOptions.scoring_phase.down_scored) {
						let regex = new RegExp('\\b' + word + '\\b');
						let scoreDecreased = ((game.n.toLowerCase().match(regex)?.length ?? 0) * 2) + ((game.d.toLowerCase().match(regex)?.length ?? 0) / 2)
						score -= scoreDecreased;
					}
					let emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
					let emojiCount = (game.d.match(emojiRegex)?.length ?? 0) + (game.n.match(emojiRegex)?.length ?? 0);
					score -= (10 * emojiCount) / ((game.d.length + game.n.length) / 5);
				
					console.log(score);
				
					fixedList[fixedList.findIndex(function(el) {
						return el.id === game.id;
					})].scr = score;
				}
			
				fixedList.sort((a, b) => b.scr - a.scr);
			
				//CATEGORIZING AND SAVING PHASE 
				let cloneCopy2 = Array.from(fixedList);
				fixedList = {};
				fixedList["Main Games"] = [];
				Object.entries(listOptions.categorizing_phase).forEach(([key, category]) => {
					fixedList[key] = [];
				});
				console.log(fixedList);
				let tickingtime = 0;
				cloneCopy2.forEach((game, key) => {
					game.media = [];
					tickingtime = key;
					console.log("saving thumbnails");
					setTimeout(() => {
						get(`https://games.roblox.com/v2/games/${game.uid}/media`)
						.then((value) => {
							value = JSON.parse(value.body);
							for (let media of value.data) {
								if (media.assetType == "Image") {
									console.log("Image");
									game.media.push(media.imageId);
								}
								else game.media.push(media.videoHash);
							}
							console.log(game.media);
							if (key == cloneCopy2.length - 1) {
								fixedList.tagsList = tagsList;
								fs.writeFileSync("./final_listv2.json", JSON.stringify(fixedList, null, 2));
								saveMedia(fixedList);
							}
						})
					}, 500 * key);
					let isCategorized = false;
					Object.entries(listOptions.categorizing_phase).forEach(([key, category]) => {
						for (let word of category) {
							let regex = new RegExp('\\b' + word + '\\b');
							let wordExists = ((game.n.toLowerCase().match(regex)?.length ?? 0) + (game.d.toLowerCase().match(regex)?.length ?? 0)) > 0;
							if (!isCategorized && wordExists) {
								isCategorized = true;
								fixedList[key].push(game);
							}
							if (isCategorized) break;
						}
					});
					if (!isCategorized) fixedList["Main Games"].push(game);
				});
			}
		});
	}
}
function chunk(arr, size) {
	return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
		arr.slice(i * size, i * size + size)
	  );
}