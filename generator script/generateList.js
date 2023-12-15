import fixList from './algorithm.js'
import get from './httpsPromise.js';
import fs from 'fs'
let games = [];
let progress = 0;
let timer

let listOptions = JSON.parse(fs.readFileSync("./generator script/list_options.json"));
let progressCap = listOptions.games_to_recommend.length * 2;
for (let universeId of listOptions.games_to_recommend) {
	for (let i=0; i<2; i++) {
		setTimeout(() => {
			get({host: `games.roblox.com`, agent: false, path: `/v1/games/recommendations/game/${universeId}?PaginationKey=startRowIndex_${i * 10}%2Cversion_&MaxRows=5000&IsTruncatedResultsEnabled=false`})
			.then(res2 => {
				let jsonFromRoblox = JSON.parse(res2.body).games;
				if (jsonFromRoblox == null) {
					progress++;
					if (progress == progressCap) {
						games = fixList(games)
						fs.writeFileSync("./final_listv2.json", JSON.stringify(games, null, 2));
					}
					return;
				}
				Object.entries(jsonFromRoblox).forEach(([key2, value])=>{
					let properGameJson = {
						uid: value.universeId,
						n: value.name,
						l: value.totalUpVotes,
						dl: value.totalDownVotes,
						id: value.placeId,
						pls: value.playerCount,
						cid: value.creatorId,
						ct: value.creatorType,
						d: value.gameDescription
					}
					games.push(properGameJson);
					progress += 1 / Object.entries(jsonFromRoblox).length;
					console.log(`${progress.toFixed(0)}/${progressCap}`);
				});
				if (progress.toFixed(0) == progressCap) {
					games = fixList(games);
					fs.writeFileSync("./final_listv2.json", JSON.stringify(games, null, 2));
				}
			})
		}, 2000 * ((listOptions.games_to_recommend.indexOf(universeId)) * (i+1)));
	}
}